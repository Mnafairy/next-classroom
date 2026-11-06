const pending=new Set();
function workerBody(){
 const send=self.postMessage.bind(self);
 const serialize=value=>{
  if(typeof value==='string')return value;
  if(value===undefined)return 'undefined';
  if(typeof value==='number'||typeof value==='boolean'||value===null)return String(value);
  try{return JSON.stringify(value)??String(value)}catch{return String(value)}
 };
 self.onmessage=e=>{
  const logs=[];
  const push=level=>(...args)=>{if(logs.length>=200)throw Error('200 мөрийн хязгаарт хүрлээ. Давталтаа шалгаарай.');logs.push({level,text:args.map(serialize).join(' ').slice(0,4000)});};
  for(const name of ['fetch','XMLHttpRequest','WebSocket','EventSource','Worker','SharedWorker','importScripts','indexedDB','caches','setTimeout','setInterval']){try{Object.defineProperty(self,name,{value:undefined,writable:false,configurable:false})}catch{}}
  try{new Function('console','"use strict";\n'+e.data)({log:push('log'),info:push('log'),warn:push('warn'),error:push('error'),clear:()=>logs.splice(0)});send({logs});}
  catch(error){send({logs,error:`${error.name}: ${error.message}`});}
 };
}
const workerSource=`(${workerBody.toString()})();`;
export function cancelRuns(){for(const cancel of [...pending])cancel();}
/**
 * @param {string} code
 * @returns {Promise<{logs: {level: string, text: string}[], error?: string, cancelled?: boolean}>}
 */
export function execute(code){
 return new Promise(resolve=>{
  if(code.length>20000){resolve({logs:[],error:'Код 20,000 тэмдэгтээс урт байна.'});return;}
  const frame=document.createElement('iframe');frame.hidden=true;frame.setAttribute('sandbox','allow-scripts');frame.title='Код ажиллуулах тусгаарлагдсан талбар';
  let done=false;
  const finish=result=>{if(done)return;done=true;clearTimeout(timer);window.removeEventListener('message',listen);frame.remove();pending.delete(cancel);resolve(result);};
  const cancel=()=>finish({logs:[],cancelled:true});pending.add(cancel);
  const listen=e=>{
   if(e.source!==frame.contentWindow)return;
   if(e.data?.kind==='ready')frame.contentWindow.postMessage({code},'*');
   if(e.data?.kind==='result'){
    const data=e.data.result;
    if(!data||!Array.isArray(data.logs))return;
    finish({logs:data.logs.slice(0,200).map(l=>({level:['error','warn'].includes(l.level)?l.level:'log',text:String(l.text).slice(0,4000)})),error:typeof data.error==='string'?data.error.slice(0,4000):undefined});
   }
  };
  window.addEventListener('message',listen);
  const timer=setTimeout(()=>finish({logs:[],error:'Ажиллах хугацаа хэтэрлээ (2 секунд). Төгсгөлгүй давталт эсвэл удаан кодоо шалгаарай.'}),2500);
  frame.srcdoc=`<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; worker-src blob:; connect-src 'none';"><script>const url=URL.createObjectURL(new Blob([${JSON.stringify(workerSource)}],{type:'text/javascript'}));let worker;window.addEventListener('message',e=>{if(e.source!==parent||typeof e.data?.code!=='string'||worker)return;try{worker=new Worker(url);const timeout=setTimeout(()=>{worker.terminate();URL.revokeObjectURL(url);parent.postMessage({kind:'result',result:{logs:[],error:'Ажиллах хугацаа хэтэрлээ (2 секунд). Давталтаа шалгаарай.'}},'*')},2000);worker.onmessage=e=>{clearTimeout(timeout);worker.terminate();URL.revokeObjectURL(url);parent.postMessage({kind:'result',result:e.data},'*')};worker.onerror=e=>{clearTimeout(timeout);worker.terminate();URL.revokeObjectURL(url);parent.postMessage({kind:'result',result:{logs:[],error:e.message}},'*')};worker.postMessage(e.data.code)}catch(error){parent.postMessage({kind:'result',result:{logs:[],error:error.message}},'*')}});parent.postMessage({kind:'ready'},'*')<\/script>`;
  document.body.append(frame);
 });
}
