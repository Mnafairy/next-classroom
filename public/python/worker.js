/* Python runs in a disposable worker, never on the web server or UI thread. */
if (self.origin !== "null" || !self.pythonBase) {
  throw new Error("Python requires an isolated exercise frame.");
}
const runtime = new URL("runtime/", self.pythonBase).href;
let python;
let harness;

self.onmessage = async ({ data }) => {
  const { id, ...request } = data;
  try {
    if (!python) {
      self.postMessage({ id, status: "loading" });
      importScripts(runtime + "pyodide.js");
      const harnessResponse = await fetch(
        new URL("harness.py", self.pythonBase),
        { credentials: "omit" },
      );
      if (!harnessResponse.ok)
        throw new Error("Python шалгагчийг ачаалж чадсангүй.");
      harness = await harnessResponse.text();
      python = await self.loadPyodide({ indexURL: runtime });
    }
    self.postMessage({ id, status: "running" });
    const scope = python.toPy({ request_json: JSON.stringify(request) });
    try {
      const result = await python.runPythonAsync(
        harness +
          "\njson.dumps(run_request(json.loads(request_json)), ensure_ascii=False)",
        { globals: scope, filename: "checker.py" },
      );
      self.postMessage({ id, result: JSON.parse(result) });
    } finally {
      scope.destroy();
    }
  } catch (error) {
    self.postMessage({
      id,
      result: {
        output: "",
        checks: [],
        error: `Python ажилласангүй: ${error.message}. Дахин оролдоорой.`,
      },
    });
  }
};
