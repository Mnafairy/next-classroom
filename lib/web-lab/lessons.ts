export const sampleImageName = "chess.jpg";

const chessCard = `<div class="card">
  <h2>Шатрын клуб</h2>
  <p>Баасан гараг бүр уулздаг.</p>
  <img src="${sampleImageName}" alt="Шатрын хөлөг">
</div>`;

const colors = `.card {
  background-color: #fff5dd;
  color: #25334a;
  font-size: 18px;
}`;

const cardStyles = colors.replace(
  "  font-size: 18px;",
  `  font-size: 18px;
  max-width: 360px;
  padding: 20px;
  border: 2px solid #ab7339;
  border-radius: 14px;
  margin: 0 auto;`,
);

export const grades = [6, 7, 8] as const;
export type Grade = (typeof grades)[number];

type Step = {
  title: string;
  explanation: string;
  write: string;
  look: string;
};

export type Lesson = {
  id: string;
  title: string;
  shortTitle: string;
  steps: readonly Step[];
  hint: string;
  check: string;
  example: { html: string; css: string };
};

const layoutSteps: Record<Grade, Step> = {
  6: {
    title: "Нэг картыг хоёр өргөнөөр шалгах",
    explanation:
      "max-width нь картын хамгийн их өргөнийг заана. Дэлгэц нарийсахад карт түүнээс бага өргөнтэй байж болно.",
    write:
      "Картын CSS-д max-width: 360px; гэж бич. Зурагт .card img дүрэм нэмж, width: 100%; гэж бич.",
    look: "Утас, компьютерийн харагдацыг ээлжлэн сонго. Зураг картын дотор багтаж байна уу?",
  },
  7: {
    title: "Хоёр картыг Flexbox-оор байрлуулах",
    explanation:
      "display: flex; нь доторх картуудыг эгнүүлнэ. flex-wrap: wrap; нь зай хүрэхгүй үед дараагийн мөр рүү шилжүүлнэ.",
    write:
      'Хоёр .card-аа <div class="gallery"> дотор багтаа. .gallery дүрэмд display: flex;, flex-wrap: wrap;, gap: 16px; гэж бич.',
    look: "Компьютерийн өргөнд хоёр карт зэрэгцэж, утасны өргөнд дараагийн мөр рүү шилжихийг ажигла.",
  },
  8: {
    title: "Гурван картыг Grid-ээр байрлуулах",
    explanation:
      "Grid нь картуудыг баганаар байрлуулна. @media нь дэлгэцийн өргөнд тааруулж дүрмийг өөрчилнө.",
    write:
      'Гурван .card-аа <div class="gallery"> дотор багтаа. .gallery-д display: grid;, gap: 16px; өг. @media (min-width: 600px) дотор гурван багана үүсгэ.',
    look: "Утасны өргөнд нэг багана, компьютерийн өргөнд гурван багана харагдаж байна уу?",
  },
};

const secondCard = `<div class="card">
  <h2>Роботын клуб</h2>
  <p>Лхагва гараг бүр уулздаг.</p>
</div>`;
const thirdCard = `<div class="card">
  <h2>Номын клуб</h2>
  <p>Сар бүр нэг ном уншдаг.</p>
</div>`;

export const lessons = [
  {
    id: "html-tags",
    title: "HTML-ээр картаа бүтээе",
    shortTitle: "HTML таг",
    steps: [
      {
        title: "Картаа <div> дотор багтаая",
        explanation:
          "<div> нь гарчиг, тайлбар, зургийг нэг дор багтаана. </div> нь тэр хэсэг хаана дуусахыг заана.",
        write:
          "HTML талбарын <body> болон </body> тагийн дунд <div> гэж бич. Дараагийн мөрөнд </div> гэж хаа.",
        look: "Дотор нь агуулга бичих хүртэл харагдац хоосон байна.",
      },
      {
        title: "<h2> таг ашиглан гарчиг нэмье",
        explanation:
          "<h2> нь картын гарчгийг бичих таг. Гарчгийн үгийг <h2> болон </h2> хоёрын дунд бичнэ.",
        write: "Хоёр div тагийн дунд <h2>Шатрын клуб</h2> гэж бич.",
        look: "Шатрын клуб гэсэн гарчиг гарч ирнэ. Гарчгаа өөрчлөөд харагдацыг ажигла.",
      },
      {
        title: "<p> таг ашиглан тайлбар нэмье",
        explanation:
          "<p> нь тайлбарын догол мөрийг эхлүүлнэ. </p> нь догол мөрийг дуусгана.",
        write: "Гарчгийн доор <p>Баасан гараг бүр уулздаг.</p> гэж бич.",
        look: "Гарчгийн доор тайлбарын мөр нэмэгдэнэ.",
      },
      {
        title: "<img> таг ашиглан зураг оруулъя",
        explanation:
          "src нь зургийн файлыг заана. alt нь зургийг үгээр тайлбарлана. <img> тагт хаах таг хэрэггүй.",
        write: `<p>-ийн доор <img src="${sampleImageName}" alt="Шатрын хөлөг"> гэж бич.`,
        look: "Тайлбарын доор шатрын зураг гарч ирнэ.",
      },
    ],
    hint: "Гарчиг, тайлбар, зургийн гурван мөр </div> тагийн өмнө байна.",
    check: "Гарчиг, тайлбар, зураг гурвуулаа харагдаж байна уу?",
    example: { html: chessCard.replace(' class="card"', ""), css: "" },
  },
  {
    id: "css-colors",
    title: "CSS-ээр өнгө, үсгийн хэмжээг өөрчилье",
    shortTitle: "CSS өнгө",
    steps: [
      {
        title: "HTML ба CSS-ийг class-аар холбоё",
        explanation:
          'class="card" нь HTML доторх картын нэр. CSS-д .card гэж бичихэд тэр нэртэй хэсгийг сонгоно.',
        write:
          'HTML-ийн эхний тагийг <div class="card"> болго. CSS талбарт .card { } гэж бич.',
        look: "Дүрэмд загвар нэмэхэд карт өөрчлөгдөнө.",
      },
      {
        title: "Дэвсгэр ба бичвэрийн өнгө өгье",
        explanation:
          "background-color нь дэвсгэрийн өнгө. color нь бичвэрийн өнгө.",
        write:
          ".card-ийн хаалт дотор background-color: #fff5dd; болон color: #25334a; гэж тус тус бич.",
        look: "Хоёр өнгийг нэг нэгээр нь соль. Аль хэсэг өөрчлөгдөхийг урьдчилж таагаарай.",
      },
      {
        title: "Үсгийн хэмжээг өөрчилье",
        explanation:
          "font-size нь үсгийн хэмжээг тохируулна. px нь пикселээр хэмжиж байгааг заана.",
        write:
          ".card-ийн дүрэмд font-size: 18px; гэж нэм. 18-ыг 22 болгож турш.",
        look: "Тайлбарын бичвэр хэрхэн томорч байгааг ажигла.",
      },
    ],
    hint: "Сонгогчийн өмнө цэг бичнэ. CSS дүрэм бүрийн шинж чанар, утгыг хоёр цэгээр холбож, мөрийг цэгтэй таслалаар дуусгана.",
    check:
      "Картын дэвсгэр, бичвэрийн өнгө, үсгийн хэмжээ тус тус өөрчлөгдөж байна уу?",
    example: { html: chessCard, css: colors },
  },
  {
    id: "box-model",
    title: "Картын зай, хүрээг тохируулъя",
    shortTitle: "Зай ба хүрээ",
    steps: [
      {
        title: "Дотор талд padding нэмье",
        explanation:
          "padding нь картын агуулга болон хүрээний хоорондох дотор зай.",
        write: ".card-ийн CSS-д padding: 20px; гэж нэм. 20-ийг 8 болгож турш.",
        look: "Бичвэр картын ирмэгээс ямар зайтай байгааг харьцуул.",
      },
      {
        title: "Хүрээ зурж, буланг дугуйлъя",
        explanation:
          "border нь хүрээний зузаан, хэлбэр, өнгийг заана. border-radius нь буланг дугуйлна.",
        write: "border: 2px solid #ab7339; болон border-radius: 14px; гэж нэм.",
        look: "Хүрээ болон дугуй булан хэрхэн гарч байгааг ажигла.",
      },
      {
        title: "Гадна талд margin өгье",
        explanation:
          "margin нь хүрээний гаднах зай. Хажуугийн зайг auto болговол тогтоосон өргөнтэй карт голд байрлана.",
        write:
          "Эхлээд margin: 24px; гэж турш. Дараа нь max-width: 360px; өгөөд margin-аа 0 auto болгож өөрчил.",
        look: "Хүрээний доторх ба гаднах зайг зааж, ялгааг өөрийн үгээр тайлбарла.",
      },
    ],
    hint: "padding-ийн хэмжээ нэмэгдэхэд хүрээ болон бичвэрийн хоорондох зай нэмэгдэнэ.",
    check: "Картын хүрээ харагдаж, бичвэр хүрээндээ наалдахгүй байна уу?",
    example: { html: chessCard, css: cardStyles },
  },
  {
    id: "card-layout",
    title: "Картаа утас, компьютерт тааруулъя",
    shortTitle: "Картын байрлал",
    steps: [layoutSteps[6]],
    hint: "Харагдацын өргөнийг солих товчоор жижиг, том дэлгэцийг туршаарай.",
    check: "Хоёр өргөнд текст, зураг тасрахгүй байгааг шалга.",
    example: {
      html: chessCard,
      css: `${cardStyles}\n\n.card img {\n  width: 100%;\n}`,
    },
  },
  {
    id: "own-project",
    title: "Өөрийн картаа хийе",
    shortTitle: "Миний бүтээл",
    steps: [
      {
        title: "Сэдвээ сонгож, HTML-ээ бичье",
        explanation:
          "Ном, хобби эсвэл сургуулийн клубээс нэгийг сонго. Гарчиг, тайлбараа өөрийн үгээр бич.",
        write:
          "<body> дотор div, h2, p, img ашиглан шинэ карт бүтээ. Жишээ зургийг chess.jpg гэж дуудаж болно.",
        look: "Картын агуулга зөв дарааллаар гарч байгааг шалга.",
      },
      {
        title: "Өөрийн загвараа гаргая",
        explanation:
          "Өнгө, зай, хүрээний утгуудаа өөрөө сонго. Гарчиг болон тайлбар уншихад эвтэйхэн байг.",
        write:
          ".card дүрмээ бичиж, өнгө, padding, border-radius нэм. 7-р анги хоёр карт, 8-р анги гурван картын байрлалаа туршаарай.",
        look: "Утас болон компьютерийн өргөнд картаа шалга.",
      },
      {
        title: "Бүтээлээ тайлбарлаж, татаж авъя",
        explanation:
          "Нэг HTML таг, нэг CSS дүрэм сонгоод картанд ямар үүрэгтэйг тайлбарла.",
        write:
          "Үсгийн алдаа, зургийн alt тайлбараа шалга. HTML файлаа татаж аваад браузерт нээ.",
        look: "Татсан файлд гарчиг, өнгө, зураг харагдаж байна уу?",
      },
    ],
    hint: "Эхлээд нэг картаа ажиллуул. Дараа нь өнгө, зайг туршиж, шаардлагатай бол картаа давтаж бич.",
    check: "Бүтээлээ хоёр өргөнд шалгаад нэг таг, нэг дүрмийг тайлбарласан уу?",
    example: {
      html: chessCard
        .replace("Шатрын клуб", "Амралтын өдрийн шатар")
        .replace(
          "Баасан гараг бүр уулздаг.",
          "Найзуудтайгаа шинэ нүүдэл суръя.",
        ),
      css: cardStyles
        .replace("#fff5dd", "#e6f3ee")
        .replace("#ab7339", "#477666"),
    },
  },
] as const satisfies readonly Lesson[];

export type LessonId = (typeof lessons)[number]["id"];

export function lessonFor(id: LessonId, grade: Grade): Lesson {
  const lesson = lessons.find((entry) => entry.id === id) ?? lessons[0];
  if (lesson.id !== "card-layout" || grade === 6) return lesson;

  const cards =
    grade === 7 ? [chessCard, secondCard] : [chessCard, secondCard, thirdCard];
  const html = `<div class="gallery">\n${cards.map((card) => card.replace(/^/gm, "  ")).join("\n")}\n</div>`;
  const layout =
    grade === 7
      ? `.gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.gallery .card {
  flex: 1 1 250px;
  margin: 0;
}`
      : `.gallery {
  display: grid;
  gap: 16px;
}
.gallery .card {
  max-width: none;
  margin: 0;
}
@media (min-width: 600px) {
  .gallery {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}`;
  return {
    ...lesson,
    steps: [layoutSteps[grade]],
    hint:
      grade === 7
        ? "Карт бүрт flex: 1 1 250px; өг. Ингэвэл хоёр карт нарийн дэлгэцэд нэг мөрөнд шахагдахгүй."
        : "Гурван тэнцүү баганад grid-template-columns: repeat(3, minmax(0, 1fr)); ашигла.",
    example: { html, css: `${lesson.example.css}\n\n${layout}` },
  };
}
