import { sampleImageName } from "./lessons";
import type { Files } from "./progress";

const tags = new Set(["div", "h2", "p", "img"]);

export function cardDocument(
  files: Files,
  sampleImage: string,
  document: Document,
) {
  const template = document.createElement("template");
  template.innerHTML = files["index.html"];

  for (const element of template.content.querySelectorAll("*")) {
    if (
      !tags.has(element.localName) ||
      element.namespaceURI !== "http://www.w3.org/1999/xhtml"
    ) {
      element.remove();
      continue;
    }

    const isImage = element.localName === "img";
    const useSample =
      isImage && element.getAttribute("src") === sampleImageName;
    for (const { name } of [...element.attributes]) {
      if (name !== "class" && !(isImage && name === "alt"))
        element.removeAttribute(name);
    }
    if (useSample) element.setAttribute("src", sampleImage);
  }

  // Keep an HTML end tag typed into the CSS editor inside the style element.
  const css = files["style.css"].replace(/<\/style/gi, "<\\/style");
  return `<!doctype html>
<html lang="mn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'">
<title>Миний карт · КодЛаб</title>
<style>
* { box-sizing: border-box; }
body { margin: 16px; font-family: system-ui, sans-serif; overflow-wrap: anywhere; }
img { max-width: 100%; height: auto; }
${css}
</style>
</head>
<body>
${template.innerHTML}
</body>
</html>`;
}
