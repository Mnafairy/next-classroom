import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const source = dirname(require.resolve("pyodide/package.json"));
const destination = join(process.cwd(), "public/python/runtime");
await mkdir(destination, { recursive: true });
await Promise.all(
  [
    "pyodide.js",
    "pyodide.asm.js",
    "pyodide.asm.wasm",
    "python_stdlib.zip",
    "pyodide-lock.json",
  ].map((file) => copyFile(join(source, file), join(destination, file))),
);
console.log("Python runtime ready (self-hosted, Pyodide 0.29.2).");
