import type { ExampleFile } from "./types";

export function js(name: string, contents: string): ExampleFile {
  return { mode: "javascript", name, contents };
}

export function py(
  name: string,
  contents: string,
  inputs?: string,
): ExampleFile {
  return { mode: "python", name, contents, inputs };
}

export function file(name: string, contents: string): ExampleFile {
  return { mode: "download", name, contents };
}

export function snippet(name: string, contents: string): ExampleFile {
  return { mode: "read", name, contents };
}

export function html(title: string, body: string, css?: string): ExampleFile {
  const styles = css ? `\n<style>\n${css}\n</style>` : "";
  return file(
    "index.html",
    `<!doctype html>
<html lang="mn">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>${styles}
<body>
${body}
</body>
</html>`,
  );
}
