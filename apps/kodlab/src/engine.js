import {parse} from 'acorn';
export function inspect(code) { return parse(code,{ecmaVersion:'latest',sourceType:'script',locations:true}); }
export function withInputs(code,vars) {
 const tree=inspect(code); const edits=[];
 for(const [name,value] of Object.entries(vars)) {
  const declaration=tree.body.filter(n=>n.type==='VariableDeclaration').flatMap(n=>n.declarations).find(d=>d.id.type==='Identifier'&&d.id.name===name);
  if(!declaration?.init) throw new Error(`${name} хувьсагчийг эхэнд нь let ${name} = ...; гэж зарлаарай.`);
  edits.push({start:declaration.init.start,end:declaration.init.end,text:JSON.stringify(value)});
 }
 return edits.sort((a,b)=>b.start-a.start).reduce((s,e)=>s.slice(0,e.start)+e.text+s.slice(e.end),code);
}
export function checkStructure(code,requirements=[]) {
 const tree=inspect(code); const nodes=[];
 function walk(node) {if(!node||typeof node!=='object')return;if(node.type)nodes.push(node);for(const [key,val]of Object.entries(node)){if(key==='loc')continue;if(Array.isArray(val))val.forEach(walk);else if(val&&typeof val==='object')walk(val);}}
 walk(tree);
 return requirements.map(r=>{
  const [kind,value]=r.split(':'); let passed=false,label='';
  if(kind==='let'){passed=nodes.some(n=>n.type==='VariableDeclaration'&&n.kind==='let'&&n.declarations.some(d=>d.id.name===value));label=`let ашиглан ${value} хувьсагч зарласан`;}
  if(kind==='assign'){passed=nodes.some(n=>(n.type==='AssignmentExpression'&&n.left.name===value)||(n.type==='UpdateExpression'&&n.argument.name===value));label=`${value}-ийн утгыг өөрчилсөн`;}
  if(kind==='log'){passed=nodes.some(n=>n.type==='CallExpression'&&n.callee.object?.name==='console'&&n.callee.property?.name==='log'&&n.arguments.some(a=>{const find=n=>n?.type==='Identifier'&&n.name===value||n&&typeof n==='object'&&Object.values(n).some(v=>Array.isArray(v)?v.some(find):typeof v==='object'&&find(v));return find(a)}));label=`console.log()-д ${value}-ийн утгыг ашигласан`;}
  if(kind==='if'){passed=nodes.some(n=>n.type==='IfStatement');label='if нөхцөл ашигласан';}
  if(kind==='else-if'){passed=nodes.some(n=>n.type==='IfStatement'&&n.alternate?.type==='IfStatement');label='else if нөхцөл ашигласан';}
  if(kind==='logical'){passed=nodes.some(n=>n.type==='LogicalExpression'&&n.operator===value);label=`${value} холбоос ашигласан`;}
  if(kind==='typeof'||kind==='not'){
   const operator=kind==='typeof'?'typeof':'!';
   passed=nodes.some(n=>n.type==='UnaryExpression'&&n.operator===operator);
   label=`${operator} ашигласан`;
  }
  return {passed,label};
 });
}
export const sameOutput=(actual,expected)=>actual.length===expected.length&&actual.every((line,i)=>line.trim()===expected[i].trim());
export function scoreQuiz(quizQuestions,answers){return {correct:quizQuestions.filter(q=>answers[q.id]===q.answer).length,total:quizQuestions.length};}
export function errorText(error){
 const line=error.loc?.line;
 const native=error.message||String(error);
 let help='Кодын бичлэгээ шалгаарай.';
 if(/Unexpected token/.test(native))help='Хаалт, хашилт болон нөхцөлийн бичлэгээ шалгаарай.';
 if(/Unterminated string/.test(native))help='Текстийн төгсгөлийн хашилт дутуу байна.';
 if(/already been declared/.test(native))help='Энэ хувьсагч өмнө нь зарлагдсан. Утга өөрчлөхдөө let-ийг дахин бичихгүй.';
 if(/is not defined/.test(native))help='Хувьсагчийн нэр эсвэл console.log-ийн бичлэгийг шалгаарай. Том, жижиг үсэг ялгаатай.';
 return `${line?`${line}-р мөр: `:''}${help}\n${native}`;
}
