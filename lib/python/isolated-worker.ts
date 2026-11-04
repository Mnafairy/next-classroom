// The iframe has an opaque origin. Its blob worker inherits that origin and this CSP.
export function isolatedWorkerFrame() {
  const base = new URL("/python/", window.location.href).href;
  const frame = document.createElement("iframe");
  frame.hidden = true;
  frame.title = "Python ажиллуулах тусгаарлагдсан талбар";
  frame.setAttribute("sandbox", "allow-scripts");
  frame.srcdoc = `<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' ${base}runtime/ ${base}worker.js; worker-src blob:; connect-src ${base}runtime/ ${base}harness.py"><script>
    const workerSource = ${JSON.stringify(`self.pythonBase = ${JSON.stringify(base)}; importScripts(${JSON.stringify(base + "worker.js")});`)};
    const url = URL.createObjectURL(new Blob([workerSource], {type:"text/javascript"}));
    const worker = new Worker(url);
    worker.onmessage = event => parent.postMessage(event.data, "*");
    worker.onerror = () => parent.postMessage({failed:true}, "*");
    onmessage = event => { if (event.source === parent) worker.postMessage(event.data); };
    parent.postMessage({ready:true}, "*");
  <\/script>`;
  return frame;
}
