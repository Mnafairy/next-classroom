export const sampleImageName = "chess.jpg";
export const starterHtml = `<!doctype html>
<html lang="mn">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Миний карт · КодЛаб</title>
</head>
<body>
  <!-- Картаа энд бичээрэй. -->
</body>
</html>`;

export type Files = {
  "index.html": string;
  "style.css": string;
  "answer.js"?: string;
};
export function pageFiles(body: string, css = "", answer?: string): Files {
  return {
    "index.html": starterHtml.replace(
      "<!-- Картаа энд бичээрэй. -->",
      body.replace(/\n/g, "\n  "),
    ),
    "style.css": css,
    ...(answer !== undefined && { "answer.js": answer }),
  };
}
