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

export type Files = { "index.html": string; "style.css": string };
export function pageFiles(body: string, css = ""): Files {
  return {
    "index.html": starterHtml.replace(
      "<!-- Картаа энд бичээрэй. -->",
      body.replace(/\n/g, "\n  "),
    ),
    "style.css": css,
  };
}

export const lessons = [
  {
    id: "html-tags",
    title: "HTML таг",
    color: "#4865dc",
    goal: "Гарчиг, тайлбар, зураг нэмээд нэг карт болгон багтааж сурна.",
    explanation:
      "HTML нь хуудсанд ямар агуулга байгааг заана. Бэлэн кодын head хэсэгт хуудасны тохиргоо бий. Браузерт харагдах картаа body хэсэгт бичнэ. Тагийг < > тэмдэг дотор бичдэг. Нээх таг агуулгыг эхлүүлж, / тэмдэгтэй хаах таг дуусгана.",
    concepts: [
      {
        code: "<h2>Шатрын клуб</h2>",
        text: "h2 нь гарчиг. Нээх, хаах хоёр тагийн дунд гарчгаа бичнэ. Шатрын клуб гэсэн үгээ солиход харагдах гарчиг өөрчлөгдөнө.",
      },
      {
        code: "<p>Баасан гараг бүр уулздаг.</p>",
        text: "p нь тайлбарын догол мөр. Гарчгийн дараа бичвэл тайлбар гарчгийн доор харагдана. Тагийн нэрийг хэвээр үлдээж, доторх өгүүлбэрийг өөрчилж болно.",
      },
      {
        code: '<img src="chess.jpg" alt="Шатрын хөлөг">',
        text: "img нь зураг оруулна. src-д бэлэн chess.jpg файлын нэр эсвэл https://-ээр эхэлсэн зургийн шууд холбоос бичнэ. alt нь зургийг үгээр тайлбарлана. Утгуудаа хашилтад бич. img-д хаах таг хэрэггүй.",
      },
      {
        code: '<div class="card">\n  <h2>Шатрын клуб</h2>\n  <p>Баасан гараг бүр уулздаг.</p>\n  <img src="chess.jpg" alt="Шатрын хөлөг">\n</div>',
        text: "div нь гурван элементийг нэг карт болгон багтаана. Доторх кодыг хоёр зайгаар догол мөрлөж бичвэл аль нь div дотор байгааг харахад амар. class нь дараа нь CSS-ээр загварлахад ашиглах нэр.",
      },
    ],
    mistakes: [
      "</h2> доторх / тэмдгийг орхивол дараах бичвэр гарчигт орох боломжтой. Нээсэн тагаа зөв хаа.",
      "src-ийн файлын нэрийг ches.jpg гэж алдаатай бичвэл зураг гарахгүй. chess.jpg гэж шалга.",
      "</div>-ийг зургийн өмнө бичвэл зураг картын гадна гарна. Доторх элементүүдээ эхэлж хаа.",
    ],
    practice:
      "Шатрын клубийг өөрийн дуртай клубийн нэрээр сольж, тайлбарыг нь дахин бич. Тагийн нэр болон бичвэрийн аль нь өөрчлөгдсөнийг тайлбарла.",
    question:
      "Гарчиг, тайлбар, зургийг нэг карт болгон багтаахад аль тагийг ашиглах вэ?",
    answer:
      "div тагийг ашиглана. Нээх div-ийн дараа гарчиг, тайлбар, зургийг бичээд хамгийн сүүлд div-ээ хаана.",
  },
  {
    id: "css-colors",
    title: "CSS өнгө ба бичвэр",
    color: "#bf8a31",
    goal: "CSS дүрмийн бүтцийг ойлгож, картын өнгө болон үсгийн хэмжээг өөрчилнө.",
    explanation:
      'HTML агуулгыг өгнө. CSS тэр агуулгын харагдах загварыг тохируулна. index.html доторх class="card" нэрийг style.css дотор .card гэж сонгоно. Сонгогчийн дараах { } хаалт дотор шинж чанар: утга; гэсэн дүрэм бичнэ.',
    concepts: [
      {
        code: ".card {\n  background-color: #fff4da;\n}",
        text: "background-color нь дэвсгэрийн өнгө. #fff4da нь өнгөний код. .card-ийн цэг нь HTML-ийн class нэрийг сонгож байгааг заана. Хашилтыг CSS-д дахин бичихгүй.",
      },
      {
        code: ".card {\n  background-color: #fff4da;\n  color: #24354d;\n}",
        text: "color нь бичвэрийн өнгө. Картанд өгсөн өнгө нь доторх гарчиг, тайлбарт дамжина. Дэвсгэр болон бичвэрийн өнгийг нэг нэгээр нь өөрчлөөд аль нь солигдож байгааг ажигла.",
      },
      {
        code: ".card {\n  font-size: 18px;\n}",
        text: "font-size нь үсгийн хэмжээ. px нь пикселийн нэгж. Гарчиг өөрийн хэмжээгээрээ том хэвээр харагдана. Тайлбарын хэмжээг харьцуулж шалгаарай.",
      },
    ],
    mistakes: [
      "CSS-д card гэж бичвэл card нэртэй тагийг хайна. Class сонгохдоо .card гэж цэгтэй бич.",
      "color = red гэж бичихэд дүрэм үйлчлэхгүй. color: red; гэсэн хэлбэр ашигла.",
      "Хоёр дүрмийн хооронд ; тэмдэг хэрэгтэй. Өнгө өөрчлөгдөхгүй байвал цэгтэй таслал, хаалтаа шалга.",
    ],
    practice:
      "Нэг картанд хоёр өөр өнгөний хувилбар турш. background-color-д #e7f0ff, color-д #24354d өгөөд харьцуул. Эцэст нь тайлбарыг 18px болон 22px болгож үз.",
    question: 'HTML-д class="card" гэж нэрлэсэн хэсгийг CSS-д яаж сонгох вэ?',
    answer:
      ".card { } гэж сонгоно. class-ийн нэрийн өмнө цэг бичээд, загварын дүрмүүдээ хаалт дотор бичнэ.",
  },
  {
    id: "box-model",
    title: "Зай ба хүрээ",
    color: "#258d77",
    goal: "Дотор зай, хүрээ, гадна зайн ялгааг ойлгож картанд хэрэглэнэ.",
    explanation:
      "Картын агуулгыг хүрээ тойрон байрлана. Агуулга ба хүрээний хооронд padding бий. Хүрээний гаднах зайг margin гэдэг. Хүрээ зурж хараад нэг утгыг өөрчлөхөд аль зай нэмэгдэж байгааг ажиглаарай.",
    concepts: [
      {
        code: ".card { padding: 20px; }",
        text: "padding нь дотор зай. 20px гэж нэг утга өгвөл дээд, баруун, доод, зүүн дөрвөн талд ижил зай өгнө.",
      },
      {
        code: ".card {\n  border: 2px solid #d5a65a;\n  border-radius: 12px;\n}",
        text: "border-ийн 2px нь зузаан, solid нь тасралтгүй зураас, сүүлийн утга нь өнгө. border-radius нь хүрээний буланг дугуйлна. Утга нь 0px бол булан тэгш байна.",
      },
      {
        code: ".card { margin: 20px; }",
        text: "margin нь хүрээний гаднах зай. padding-ийг хэвээр үлдээгээд margin-ийг өөрчлөхөд карт бүхлээрээ эргэн тойрноосоо холдоно.",
      },
    ],
    mistakes: [
      "Бичвэр хүрээндээ наалдсан бол padding-ийг нэм. margin-ийг нэмэхэд дотор зай өөрчлөгдөхгүй.",
      "border: 2px; гэвэл хүрээний хэлбэр дутуу байна. solid-ийг хамт бич.",
      "20 гэж нэгжгүй бичсэн уртын утга үйлчлэхгүй. 20px гэж нэгжтэй бич.",
    ],
    practice:
      "Эхлээд padding-ийг 8px, дараа нь 24px болгож харьцуул. Дараа нь padding-ийг тогтмол байлгаад margin-ийг өөрчил. Хүрээний доторх ба гаднах зайг дэлгэц дээр зааж тайлбарла.",
    question:
      "Бичвэр болон картын хүрээний хооронд зай гаргахын тулд аль дүрмийг өөрчлөх вэ?",
    answer: "padding-ийг өөрчилнө. margin нь хүрээний гаднах зайг өөрчилдөг.",
  },
  {
    id: "image-style",
    title: "Зургийн загвар",
    color: "#9765c7",
    goal: "Картын доторх зургийг сонгож, өргөн болон буланг нь тохируулна.",
    explanation:
      ".card img гэсэн сонгогч нь card нэртэй хэсгийн доторх img зургийг сонгоно. Ингэснээр картын дэвсгэр, зургийн хэмжээ хоёрыг тус тусад нь тохируулж болно.",
    concepts: [
      {
        code: ".card img {\n  width: 200px;\n}",
        text: "width нь өргөн. 200px өгвөл зураг 200 пикселийн өргөнтэй болно. Өндрийг тусад нь өгөөгүй тул зураг анхны харьцаагаа хадгална.",
      },
      {
        code: ".card img {\n  width: 200px;\n  border-radius: 8px;\n}",
        text: "border-radius-ийг зурагт хэрэглэж болно. Картын булан болон зургийн булан өөр өөр утгатай байж болно.",
      },
    ],
    mistakes: [
      ".card-д width өгвөл картын өргөн өөрчлөгдөнө. Зургийн өргөнийг .card img дүрэмд өг.",
      ".card img дүрмийг .card-ийн хаалт дотор бичихгүй. Эхний дүрмээ хаагаад шинэ дүрэм бич.",
      "Зураг хэт сунасан бол width ба height-ийг хоёуланг нь хүчээр өгсөн эсэхээ шалга. Энэ дасгалд width-ийг л тохируулна.",
    ],
    practice:
      "Зургийг 160px, 200px, 240px өргөнтэй болгож харьцуул. Буланг 0px ба 12px болгож туршаад өөрт таалагдсан загвараа тайлбарла.",
    question: ".card img гэсэн сонгогч картын аль хэсэгт үйлчлэх вэ?",
    answer:
      "Картын доторх зурагт үйлчилнэ. Гарчиг болон тайлбарын хэмжээг өөрчлөхгүй.",
  },
  {
    id: "own-project",
    title: "Миний карт",
    color: "#368aa7",
    goal: "Дөрвөн HTML таг, CSS-ийн үндсэн дүрмүүдээр бие даан карт бүтээнэ.",
    explanation:
      "Хобби, ном эсвэл сургуулийн клубийн тухай карт бүтээ. Эхлээд агуулгаа бичиж ажиллуул. Дараа нь өнгө, зай, хүрээ, зургийн загвараа нэг нэгээр нь нэм. Өөрчлөлт бүрийн дараа үр дүнгээ харьцуул.",
    concepts: [
      {
        code: "div · h2 · p · img",
        text: "Картын div дотор гарчиг, тайлбар, зургийг багтаа. Гарчиг, тайлбараа өөрийн үгээр бич. Зурагт alt тайлбар өг.",
      },
      {
        code: ".card {\n  background-color: #e7f0ff;\n  padding: 20px;\n  border-radius: 12px;\n}",
        text: "Дэвсгэрийн өнгө, дотор зай, булангийн хэмжээгээ сонго. Уншихад эвтэйхэн бичвэрийн өнгө хэрэглэ. Жишээний утгуудыг өөрчилж өөрийн загварыг гарга.",
      },
    ],
    mistakes: [
      "Бүх өөрчлөлтийг зэрэг хийвэл алдааг олоход хэцүү. Нэг дүрэм нэмээд ажиллуул.",
      "Текст харагдахгүй байвал бичвэр ба дэвсгэрийн өнгө хоорондоо ялгаатай эсэхийг хар.",
      "Татсан HTML файлаа браузерт нээж гарчиг, тайлбар, зураг, загвараа шалга.",
    ],
    practice:
      "Картаа хамтрагчдаа үзүүл. Тэр хүн картын сэдвийг ойлгож байна уу? Нэг HTML таг, нэг CSS дүрмийн үүргийг код дээрээ зааж тайлбарла.",
    question:
      "Картынхаа өнгийг солихын тулд HTML-ийн гарчгийг өөрчлөх үү, CSS дүрмийг өөрчлөх үү?",
    answer:
      "CSS дүрмийг өөрчилнө. HTML нь агуулгыг өгч, CSS нь тэр агуулгын загварыг тохируулна.",
  },
] as const;

export type LessonId = (typeof lessons)[number]["id"];
export type Check = { label: string; selector: string } & (
  | { kind: "element" }
  | { kind: "text"; value: string }
  | { kind: "content" }
  | { kind: "image" }
  | { kind: "style"; property: string; value: string }
  | { kind: "style-not"; property: string; value: string }
);
type Exercise = {
  id: string;
  topic: LessonId;
  title: string;
  minutes: number;
  file: keyof Files;
  explanation: string;
  prompt: readonly string[];
  hints: readonly string[];
  starter: Files;
  solution: Files;
  checks: readonly Check[];
};
const heading = "<h2>Шатрын клуб</h2>";
const description = `${heading}\n<p>Баасан гараг бүр уулздаг.</p>`;
const image = `${description}\n<img src="chess.jpg" alt="Шатрын хөлөг">`;
const card = `<div class="card">\n  ${image.replace(/\n/g, "\n  ")}\n</div>`;
const background = ".card {\n  background-color: #fff4da;\n}";
const textColor = ".card {\n  background-color: #fff4da;\n  color: #24354d;\n}";
const fontSize =
  ".card {\n  background-color: #fff4da;\n  color: #24354d;\n  font-size: 18px;\n}";
const padding =
  ".card {\n  background-color: #fff4da;\n  color: #24354d;\n  font-size: 18px;\n  padding: 20px;\n}";
const border =
  ".card {\n  background-color: #fff4da;\n  color: #24354d;\n  font-size: 18px;\n  padding: 20px;\n  border: 2px solid #d5a65a;\n  border-radius: 12px;\n}";
const margin =
  ".card {\n  background-color: #fff4da;\n  color: #24354d;\n  font-size: 18px;\n  padding: 20px;\n  border: 2px solid #d5a65a;\n  border-radius: 12px;\n  margin: 20px;\n}";
const imageWidth = `${margin}\n\n.card img {\n  width: 200px;\n}`;
const imageCorners = `${margin}\n\n.card img {\n  width: 200px;\n  border-radius: 8px;\n}`;

export const exercises = [
  {
    id: "card-title",
    topic: "html-tags",
    title: "Картын гарчиг",
    minutes: 4,
    file: "index.html",
    explanation:
      "<h2> нь гарчгийн эхлэл, </h2> нь төгсгөл. Хоёр тагийн дунд харагдах үгээ бичнэ.",
    prompt: [
      "Бэлэн <body> хэсгийн тайлбарын мөрийг орлуулаарай.",
      "h2 таг ашиглан Шатрын клуб гэсэн гарчиг бич.",
      "Ажиллуулах товчийг дарж гарчгаа хараад, Хариу шалгах товчоор шалга.",
    ],
    hints: [
      "Гарчгаа <body> болон </body> хоёрын дунд бичнэ.",
      "<h2> гэж эхлүүлээд үгээ бич. </h2> гэж хаа.",
    ],
    starter: { "index.html": starterHtml, "style.css": "" },
    solution: pageFiles(heading),
    checks: [
      {
        kind: "text",
        selector: "h2",
        value: "Шатрын клуб",
        label: "h2 тагт Шатрын клуб гэж бичсэн",
      },
    ],
  },
  {
    id: "card-description",
    topic: "html-tags",
    title: "Тайлбар нэмье",
    minutes: 4,
    file: "index.html",
    explanation:
      "p таг нь тайлбарын догол мөр. Гарчгийн дараа бичвэл тайлбар гарчгийн доор харагдана.",
    prompt: [
      "Бэлэн гарчгийн доор p таг нэм.",
      "Баасан гараг бүр уулздаг. гэсэн тайлбар бич.",
      "Гарчиг болон тайлбараа ажиллуулж хараарай.",
    ],
    hints: [
      "Гарчгийн </h2> тагийн дараах мөрөнд бич.",
      "<p>Тайлбарын үг</p> гэсэн бүтэцтэй.",
    ],
    starter: pageFiles(heading),
    solution: pageFiles(description),
    checks: [
      {
        kind: "text",
        selector: "h2",
        value: "Шатрын клуб",
        label: "Гарчиг хэвээр байна",
      },
      {
        kind: "text",
        selector: "p",
        value: "Баасан гараг бүр уулздаг.",
        label: "p тагт клубийн тайлбарыг бичсэн",
      },
    ],
  },
  {
    id: "card-image",
    topic: "html-tags",
    title: "Зураг оруулъя",
    minutes: 5,
    file: "index.html",
    explanation:
      "img нь зураг оруулна. src нь зургийн файлын нэр эсвэл шууд холбоос. alt нь зургийг үгээр тайлбарлана. img тагийг хаах шаардлагагүй.",
    prompt: [
      "Тайлбарын доор img таг нэм.",
      'src="chess.jpg" гэж бичих эсвэл зургийн шууд HTTPS холбоос ашигла.',
      'Зургаа тайлбарласан alt утга бичээд ажиллуул. Жишээ нь alt="Шатрын хөлөг".',
    ],
    hints: [
      "Жишээ зураг бэлэн байгаа. Файлын нэр нь chess.jpg.",
      '<img src="chess.jpg" alt="Шатрын хөлөг"> гэсэн хэлбэрээр бичнэ.',
    ],
    starter: pageFiles(description),
    solution: pageFiles(image),
    checks: [
      { kind: "element", selector: "h2", label: "Гарчиг байна" },
      { kind: "element", selector: "p", label: "Тайлбар байна" },
      {
        kind: "image",
        selector: "img",
        label: "Зураг ачаалж, alt тайлбартай байна",
      },
    ],
  },
  {
    id: "card-wrapper",
    topic: "html-tags",
    title: "Нэг карт болгон багтаая",
    minutes: 6,
    file: "index.html",
    explanation:
      'div нь хэд хэдэн элементийг нэг дор багтаана. class="card" гэж нэр өгснөөр CSS-д .card гэж сонгож болно.',
    prompt: [
      'Гарчгийн өмнө <div class="card"> гэж бич.',
      "Зургийн дараа </div> гэж хаа.",
      "Гарчиг, тайлбар, зураг гурвуулаа div дотор байгаа эсэхийг шалга.",
    ],
    hints: [
      "div нь гурван элементийн гадна талд байна.",
      "Нээх div таг гарчгийн өмнө, хаах div таг зургийн дараа байна.",
    ],
    starter: pageFiles(image),
    solution: pageFiles(card),
    checks: [
      {
        kind: "element",
        selector: ".card > h2",
        label: "Гарчиг .card дотор байна",
      },
      {
        kind: "element",
        selector: ".card > p",
        label: "Тайлбар .card дотор байна",
      },
      {
        kind: "image",
        selector: ".card > img",
        label: "Зураг .card дотор байна",
      },
    ],
  },
  {
    id: "card-background",
    topic: "css-colors",
    title: "Дэвсгэрийн өнгө",
    minutes: 5,
    file: "style.css",
    explanation:
      "CSS талбарт .card гэж бичээд, { } хаалт дотор картын загварыг бичнэ. background-color нь дэвсгэрийн өнгө.",
    prompt: [
      "style.css файлыг сонго.",
      ".card дүрэм үүсгэ.",
      "Хаалт дотор background-color: #fff4da; гэж бичээд ажиллуул.",
    ],
    hints: [
      'HTML дотор class="card" гэж нэрлэсэн хэсгийг .card гэж сонгоно.',
      ".card { background-color: #fff4da; } гэж бичнэ.",
    ],
    starter: pageFiles(card),
    solution: pageFiles(card, background),
    checks: [
      {
        kind: "style",
        selector: ".card",
        property: "background-color",
        value: "rgb(255, 244, 218)",
        label: "Картын дэвсгэр #fff4da өнгөтэй болсон",
      },
    ],
  },
  {
    id: "card-text-color",
    topic: "css-colors",
    title: "Бичвэрийн өнгө",
    minutes: 4,
    file: "style.css",
    explanation:
      "color нь сонгосон хэсгийн бичвэрийн өнгийг өөрчилнө. Картын доторх гарчиг, тайлбарт мөн үйлчилнэ.",
    prompt: [
      ".card дүрмийн хаалт дотор color: #24354d; гэж нэм.",
      "Дэвсгэрийн өнгийг хэвээр үлдээ.",
      "Ажиллуулаад гарчиг, тайлбарын өнгийг ажигла.",
    ],
    hints: [
      "Шинэ .card дүрэм нээх шаардлагагүй. Бэлэн хаалт дотор мөр нэм.",
      "color: #24354d; гэж бичээд мөрөө цэгтэй таслалаар дуусга.",
    ],
    starter: pageFiles(card, background),
    solution: pageFiles(card, textColor),
    checks: [
      {
        kind: "style",
        selector: ".card p",
        property: "color",
        value: "rgb(36, 53, 77)",
        label: "Бичвэр #24354d өнгөтэй болсон",
      },
    ],
  },
  {
    id: "card-font-size",
    topic: "css-colors",
    title: "Үсгийн хэмжээ",
    minutes: 4,
    file: "style.css",
    explanation:
      "font-size нь үсгийн хэмжээ. 18px гэдэг нь 18 пиксел гэсэн үг.",
    prompt: [
      ".card дүрэмд font-size: 18px; гэж нэм.",
      "Ажиллуулаад тайлбарын бичвэрийг ажигла.",
      "20px гэж түр туршаад, шалгахын өмнө 18px болго.",
    ],
    hints: [
      "Тооны араас px гэж бичнэ.",
      ".card-ийн { } хаалт дотор font-size: 18px; мөр нэм.",
    ],
    starter: pageFiles(card, textColor),
    solution: pageFiles(card, fontSize),
    checks: [
      {
        kind: "style",
        selector: ".card p",
        property: "font-size",
        value: "18px",
        label: "Тайлбарын үсгийн хэмжээ 18px болсон",
      },
    ],
  },
  {
    id: "card-padding",
    topic: "box-model",
    title: "Дотор зай нэмье",
    minutes: 5,
    file: "style.css",
    explanation:
      "padding нь картын агуулга болон ирмэгийн хоорондох дотор зай.",
    prompt: [
      ".card дүрэмд padding: 20px; гэж нэм.",
      "Ажиллуулаад бичвэр, зураг ирмэгээс холдсоныг ажигла.",
      "Дөрвөн талдаа 20px зайтай байгаа эсэхийг шалга.",
    ],
    hints: [
      "padding-ийг .card дүрэмд нэмнэ.",
      "padding: 20px; гэж бичвэл дөрвөн талд ижил зай өгнө.",
    ],
    starter: pageFiles(card, fontSize),
    solution: pageFiles(card, padding),
    checks: [
      {
        kind: "style",
        selector: ".card",
        property: "padding-top",
        value: "20px",
        label: "Дээд дотор зай 20px",
      },
      {
        kind: "style",
        selector: ".card",
        property: "padding-right",
        value: "20px",
        label: "Баруун дотор зай 20px",
      },
      {
        kind: "style",
        selector: ".card",
        property: "padding-bottom",
        value: "20px",
        label: "Доод дотор зай 20px",
      },
      {
        kind: "style",
        selector: ".card",
        property: "padding-left",
        value: "20px",
        label: "Зүүн дотор зай 20px",
      },
    ],
  },
  {
    id: "card-border",
    topic: "box-model",
    title: "Хүрээ ба дугуй булан",
    minutes: 6,
    file: "style.css",
    explanation:
      "border нь хүрээний зузаан, хэлбэр, өнгийг заана. border-radius нь картын буланг дугуйлна.",
    prompt: [
      ".card дүрэмд border: 2px solid #d5a65a; гэж нэм.",
      "border-radius: 12px; гэж буланг дугуйл.",
      "Ажиллуулаад хүрээгээ хараарай.",
    ],
    hints: [
      "2px нь зузаан, solid нь тасралтгүй хүрээ, #d5a65a нь өнгө.",
      "Хоёр дүрмийг хоёуланг нь .card-ийн хаалт дотор бичнэ.",
    ],
    starter: pageFiles(card, padding),
    solution: pageFiles(card, border),
    checks: [
      {
        kind: "style",
        selector: ".card",
        property: "border-top-width",
        value: "2px",
        label: "Карт 2px зузаан хүрээтэй",
      },
      {
        kind: "style",
        selector: ".card",
        property: "border-top-style",
        value: "solid",
        label: "Хүрээ тасралтгүй",
      },
      {
        kind: "style",
        selector: ".card",
        property: "border-top-color",
        value: "rgb(213, 166, 90)",
        label: "Хүрээ #d5a65a өнгөтэй",
      },
      {
        kind: "style",
        selector: ".card",
        property: "border-top-left-radius",
        value: "12px",
        label: "Картын булан 12px дугуйрсан",
      },
    ],
  },
  {
    id: "card-margin",
    topic: "box-model",
    title: "Гадна зай нэмье",
    minutes: 5,
    file: "style.css",
    explanation:
      "margin нь картын хүрээний гаднах зай. padding нь хүрээний доторх зай хэвээр байна.",
    prompt: [
      ".card дүрэмд margin: 20px; гэж нэм.",
      "Ажиллуулаад карт гадна талаасаа зайтай болсныг хар.",
      "padding ба margin-ийн ялгааг өөрийн үгээр тайлбарла.",
    ],
    hints: [
      "margin-ийг .card дүрэмд нэмнэ.",
      "margin: 20px; гэж бичвэл гадна дөрвөн талд ижил зай өгнө.",
    ],
    starter: pageFiles(card, border),
    solution: pageFiles(card, margin),
    checks: [
      {
        kind: "style",
        selector: ".card",
        property: "margin-top",
        value: "20px",
        label: "Гадна дээд зай 20px",
      },
      {
        kind: "style",
        selector: ".card",
        property: "margin-left",
        value: "20px",
        label: "Гадна хажуугийн зай 20px",
      },
    ],
  },
  {
    id: "image-width",
    topic: "image-style",
    title: "Зургийн өргөн",
    minutes: 5,
    file: "style.css",
    explanation:
      ".card img нь картын доторх зургийг сонгоно. width нь зургийн өргөнийг тохируулна.",
    prompt: [
      ".card дүрмийн дараа .card img { } гэсэн шинэ дүрэм нэм.",
      "Түүний дотор width: 200px; гэж бич.",
      "Ажиллуулаад зургийн хэмжээг ажигла.",
    ],
    hints: [
      "Зургийн дүрэм нь .card-ийн хаалтын гадна байна.",
      ".card img { width: 200px; } гэж бичнэ.",
    ],
    starter: pageFiles(card, margin),
    solution: pageFiles(card, imageWidth),
    checks: [
      { kind: "image", selector: ".card img", label: "Картын зураг байна" },
      {
        kind: "style",
        selector: ".card img",
        property: "width",
        value: "200px",
        label: "Зургийн өргөн 200px болсон",
      },
    ],
  },
  {
    id: "image-corners",
    topic: "image-style",
    title: "Зургийн дугуй булан",
    minutes: 4,
    file: "style.css",
    explanation:
      "border-radius-ийг зурагт хэрэглэж болно. Карт болон зургийн загвар тусдаа дүрэмтэй.",
    prompt: [
      ".card img дүрмийн дотор border-radius: 8px; гэж нэм.",
      "Зургийн өргөнийг 200px хэвээр үлдээ.",
      "Ажиллуулаад зургийн буланг хараарай.",
    ],
    hints: [
      "Картын .card дүрмийг биш, зургийн .card img дүрмийг засна.",
      "width-ийн доор border-radius: 8px; мөр нэм.",
    ],
    starter: pageFiles(card, imageWidth),
    solution: pageFiles(card, imageCorners),
    checks: [
      {
        kind: "style",
        selector: ".card img",
        property: "width",
        value: "200px",
        label: "Зургийн өргөн 200px хэвээр",
      },
      {
        kind: "style",
        selector: ".card img",
        property: "border-top-left-radius",
        value: "8px",
        label: "Зургийн булан 8px дугуйрсан",
      },
    ],
  },
  {
    id: "my-card",
    topic: "own-project",
    title: "Өөрийн картаа бүтээе",
    minutes: 15,
    file: "index.html",
    explanation:
      "Хобби, ном эсвэл сургуулийн клубийн тухай карт бүтээ. Сурсан HTML таг, CSS дүрмүүдээ ашигла.",
    prompt: [
      'div-д class="card" гэж нэр өг. Дотор нь h2 гарчиг, p тайлбар, img зураг нэм.',
      "Гарчиг, тайлбарыг өөрийн үгээр бич. chess.jpg эсвэл зургийн шууд HTTPS холбоос ашигла.",
      "CSS-ээр дэвсгэрийн өнгө, дотор зай, дугуй булан нэм. Хэмжээ, өнгөө өөрөө сонго.",
    ],
    hints: [
      "Эхлээд HTML агуулгаа ажиллуул. Дараа нь CSS-ээ бич.",
      ".card дүрэмд background-color, padding, border-radius ашигла.",
    ],
    starter: { "index.html": starterHtml, "style.css": "" },
    solution: pageFiles(
      card
        .replace("Шатрын клуб", "Миний дуртай шатар")
        .replace(
          "Баасан гараг бүр уулздаг.",
          "Найзуудтайгаа шинэ нүүдэл сурдаг.",
        ),
      imageCorners,
    ),
    checks: [
      { kind: "content", selector: ".card h2", label: "Карт гарчигтай" },
      { kind: "content", selector: ".card p", label: "Карт тайлбартай" },
      {
        kind: "image",
        selector: ".card img",
        label: "Карт alt тайлбартай зурагтай",
      },
      {
        kind: "style-not",
        selector: ".card",
        property: "background-color",
        value: "rgba(0, 0, 0, 0)",
        label: "Карт дэвсгэрийн өнгөтэй",
      },
      {
        kind: "style-not",
        selector: ".card",
        property: "padding-top",
        value: "0px",
        label: "Карт дотор зайтай",
      },
      {
        kind: "style-not",
        selector: ".card",
        property: "border-top-left-radius",
        value: "0px",
        label: "Карт дугуй булантай",
      },
    ],
  },
] as const satisfies readonly Exercise[];

export type ExerciseId = (typeof exercises)[number]["id"];
export type CardExercise = (typeof exercises)[number];
export function findExercise(id: string) {
  return exercises.find((exercise) => exercise.id === id) ?? exercises[0];
}
