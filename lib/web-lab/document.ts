import { sampleImageName } from "./lessons";
import type { Files } from "./progress";

const tags = new Set(["div", "h2", "p", "img", "button"]);
const embeddedImage =
  /^data:image\/(?:avif|gif|jpeg|png|webp);base64,[a-z0-9+/]+={0,2}$/i;

function imageSource(value: string | null, sampleImage: string) {
  const src = value?.trim();
  if (!src) return;
  if (src === sampleImageName || src === `./${sampleImageName}`)
    return sampleImage;
  if (embeddedImage.test(src)) return src;

  try {
    const url = new URL(src);
    if (url.protocol === "https:" && !url.username && !url.password)
      return url.href;
  } catch {
    // Relative filenames need a bundled image or a full URL.
  }
}

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
    const src = isImage
      ? imageSource(element.getAttribute("src"), sampleImage)
      : undefined;
    for (const { name } of [...element.attributes]) {
      if (name !== "class" && !(isImage && name === "alt"))
        element.removeAttribute(name);
    }
    if (src) element.setAttribute("src", src);
  }

  // Keep an HTML end tag typed into the CSS editor inside the style element.
  const css = files["style.css"].replace(/<\/style/gi, "<\\/style");
  const hasContent = Boolean(
    template.content.firstElementChild || template.content.textContent?.trim(),
  );
  const html = `<!doctype html>
<html lang="mn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: https:; base-uri 'none'; form-action 'none'">
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
  return { html, hasContent };
}
