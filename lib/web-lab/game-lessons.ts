import { pageFiles } from "./files";
import { games } from "./games";
import type { Check } from "./lessons";

export const gameLesson = {
  id: "mini-games",
  title: "Мини тоглоом",
  color: "#6846a8",
  goal: "HTML, CSS болон if / else ашиглан гурван жижиг тоглоом бүтээнэ.",
  explanation:
    "HTML-ээр тоглоомын хэсгүүдээ байрлуулж, CSS-ээр загварчилна. Товч дарах, талбараас утга авах, санамсаргүй тоо үүсгэх, хариу харуулах код бэлэн. answer.js дээр getAnswer(choice, roll) функцийн доторх нөхцөлийг бичнэ.",
  concepts: [
    {
      code: "border-radius: 50%;",
      text: "Өргөн, өндөр нь тэнцүү байвал 50% утга дүрсийг тойрог болгоно.",
    },
    {
      code: 'if (roll === 1) {\n  return "Тийм!";\n}',
      text: "roll нь 1-тэй тэнцүү үед функц энэ хариуг буцаана.",
    },
    {
      code: "choice === 1 && roll === 3",
      text: "&& тэмдгийн хоёр талын нөхцөл хоёулаа үнэн байх ёстой.",
    },
  ],
  mistakes: [
    "HTML-ийн class нэр CSS-ийн цэгтэй сонгогчтой таарч байгаа эсэхийг шалга.",
    "Утга харьцуулахдаа ===, хариу буцаахдаа return хэрэглэ.",
  ],
  practice:
    "Тоглоом бүрийг ажиллуулаад хэд хэдэн удаа тоглож үз. Дараа нь бүх боломжит утгыг «Хариу шалгах» товчоор шалга.",
  question: "Харьцуулсан бүх нөхцөл худал байвал аль хэсэг ажиллах вэ?",
  answer: "Төгсгөлийн else хэсэг ажиллана.",
} as const;

const topic = gameLesson.id;
const eightBall = `<div class="game">
  <h2>Magic 8 Ball</h2>
  <div class="eight-ball">
    <p class="answer">8</p>
  </div>
  <label>Асуултаа бич
    <input class="question" type="text" placeholder="Өнөөдөр азтай өдөр үү?">
  </label>
  <button class="play">Бөмбөг сэгсрэх</button>
</div>`;

const gameCss = `.game {
  max-width: 290px;
  margin: 0 auto;
  display: grid;
  justify-items: center;
  gap: 12px;
  text-align: center;
}

.game h2,
.roll-result {
  margin: 0;
}

.eight-ball {
  width: 176px;
  height: 176px;
  border-radius: 50%;
  background-color: #18181b;
  display: grid;
  place-items: center;
}

.answer {
  display: grid;
  place-items: center;
  width: 84px;
  height: 84px;
  margin: 0;
  padding: 5px;
  border-radius: 50%;
  background-color: #ffffff;
  color: #18181b;
  font-size: 2.25rem;
  font-weight: bold;
}

.answer[data-answered] {
  font-size: 0.75rem;
}

.question, .choice {
  display: block;
  width: 100%;
  margin-top: 4px;
  padding: 8px 10px;
  border: 1px solid #a1a1aa;
  border-radius: 6px;
  font: inherit;
}

.play {
  padding: 8px 16px;
  border: 2px solid #3049e9;
  border-radius: 999px;
  background: #ffffff;
  color: #3049e9;
  font: inherit;
  cursor: pointer;
}`;

const htmlChecks = [
  {
    kind: "text",
    selector: ".game h2",
    value: "Magic 8 Ball",
    label: "Magic 8 Ball гарчигтай",
  },
  {
    kind: "text",
    selector: ".game .eight-ball > .answer",
    value: "8",
    label: "Бөмбөгний голд 8 гэсэн бичигтэй",
  },
  {
    kind: "element",
    selector:
      ".game label input.question[type=text][placeholder]:not([placeholder=''])",
    label: "Асуулт бичих талбартай",
  },
  {
    kind: "text",
    selector: ".game button.play",
    value: "Бөмбөг сэгсрэх",
    label: "Бөмбөг сэгсрэх товчтой",
  },
] satisfies Check[];

const ballChecks = [
  {
    kind: "style",
    selector: ".eight-ball",
    property: "width",
    value: "176px",
    label: "Бөмбөг 176px өргөнтэй",
  },
  {
    kind: "style",
    selector: ".eight-ball",
    property: "height",
    value: "176px",
    label: "Бөмбөг 176px өндөртэй",
  },
  {
    kind: "style",
    selector: ".eight-ball",
    property: "border-radius",
    value: "50%",
    label: "Бөмбөг дугуй хэлбэртэй",
  },
  {
    kind: "style",
    selector: ".answer",
    property: "border-radius",
    value: "50%",
    label: "Хариуны хэсэг дугуй хэлбэртэй",
  },
] satisfies Check[];

const emptyBranches = `// getAnswer(choice, roll) функцийн доторх хэсэг
if (false) { // Нөхцөлөө бич.
  return "";
} else if (false) { // Дараагийн нөхцөлөө бич.
  return "";
} else {
  return "";
}`;

const rpsWin = [
  "(choice === 1 && roll === 3)",
  "(choice === 2 && roll === 1)",
  "(choice === 3 && roll === 2)",
].join(" ||\n  ");

function choiceGame(
  title: string,
  icon: string,
  label: string,
  button: string,
  choices: readonly string[],
) {
  return `<div class="game">
  <h2>${title}</h2>
  <div class="eight-ball">
    <p class="answer">${icon}</p>
  </div>
  <label>${label}
    <select class="choice">
${choices.map((name, index) => `      <option value="${index + 1}">${name}</option>`).join("\n")}
    </select>
  </label>
  <button class="play">${button}</button>
  <p class="roll-result"></p>
</div>`;
}

const coin = choiceGame(
  "Зоос шидэх",
  "🪙",
  "Та аль талыг таах вэ?",
  "Зоос шидэх",
  games["coin-toss"].rolls,
);
const rps = choiceGame(
  "Чулуу, даавуу, хайч",
  "✊",
  "Өөрийн нүүдлээ сонго",
  "Тоглох",
  games["rock-paper-scissors"].rolls,
);

function choiceChecks(
  choices: readonly string[],
  button: string,
  color: string,
): Check[] {
  return [
    {
      kind: "count",
      selector: "select.choice option",
      value: choices.length,
      label: "Сонголтын тоо зөв",
    },
    ...choices.map((value, index): Check => ({
      kind: "text",
      selector: `select.choice option[value="${index + 1}"]`,
      value,
      label: `${index + 1} · ${value}`,
    })),
    {
      kind: "element",
      selector: ".game .eight-ball > .answer",
      label: "Хариу харуулах хэсэгтэй",
    },
    {
      kind: "text",
      selector: ".game button.play",
      value: button,
      label: "Тоглох товчтой",
    },
    ...ballChecks,
    {
      kind: "style",
      selector: ".eight-ball",
      property: "background-color",
      value: color,
      label: "Тоглоомд тохирсон дэвсгэр өнгөтэй",
    },
  ];
}

export const gameExercises = [
  {
    id: "eight-ball-html",
    topic,
    title: "Magic 8 Ball · HTML бүтэц",
    minutes: 6,
    file: "index.html",
    explanation:
      "8 дугаартай бөмбөг, асуултын талбар, тоглох товчоо нэг дор байрлуул.",
    prompt: [
      "Эхний хоосон class-д eight-ball, доторх p тагийн class-д answer гэж бич. p тагт 8 гэж бич.",
      "input-ийн class-д question гэж бичээд, placeholder-д жишээ асуулт бич.",
      "Товчны class-д play, товчны бичвэрт «Бөмбөг сэгсрэх» гэж бич.",
    ],
    hints: ['Бөмбөгний доторх мөрийг <p class="answer">8</p> гэж бич.'],
    starter: pageFiles(
      eightBall
        .replace('class="eight-ball"', 'class=""')
        .replace('class="answer">8', 'class="">')
        .replace('class="question"', 'class=""')
        .replace("Өнөөдөр азтай өдөр үү?", "")
        .replace('class="play">Бөмбөг сэгсрэх', 'class="">'),
    ),
    solution: pageFiles(eightBall),
    checks: htmlChecks,
  },
  {
    id: "eight-ball-css",
    topic,
    title: "Magic 8 Ball · CSS загвар",
    minutes: 7,
    file: "style.css",
    explanation: "Хар тойрог, цагаан гол, доорх асуулт ба товчийг загварчил.",
    prompt: [
      ".eight-ball-ийн өргөн, өндрийг тус бүр 176px, border-radius-ийг 50% болго.",
      "Бөмбөгний дэвсгэрийг #18181b, .answer-ийн border-radius-ийг 50% болго.",
      ".play товчны бичвэрийн өнгийг #3049e9 болго.",
    ],
    hints: [
      "Өргөн, өндөр тэнцүү үед border-radius: 50%; дүрсийг дугуй болгодог.",
    ],
    starter: pageFiles(
      eightBall,
      gameCss
        .replaceAll("176px", "/* утга */")
        .replaceAll("50%", "/* утга */")
        .replace("background-color: #18181b", "background-color: /* утга */")
        .replace("color: #3049e9", "color: /* утга */"),
    ),
    solution: pageFiles(eightBall, gameCss),
    checks: [
      ...htmlChecks,
      ...ballChecks,
      {
        kind: "style",
        selector: ".eight-ball",
        property: "background-color",
        value: "rgb(24, 24, 27)",
        label: "Бөмбөг хар өнгөтэй",
      },
      {
        kind: "style",
        selector: ".play",
        property: "color",
        value: "rgb(48, 73, 233)",
        label: "Товчны бичвэр цэнхэр өнгөтэй",
      },
    ],
  },
  {
    id: "eight-ball-logic",
    topic,
    title: "Magic 8 Ball · Хариугаа сонгоё",
    minutes: 8,
    file: "answer.js",
    game: "eight-ball",
    explanation:
      "Товч дарахад бэлэн код 1–3 хүртэл санамсаргүй roll өгнө. Функцийн доторх if / else хэсгийг гүйцээ.",
    prompt: [
      "roll нь 1 бол «Тийм!», 2 бол «Магадгүй.», бусад үед «Үгүй.» гэсэн бичвэрийг return ашиглан буцаа.",
      "Ажиллуулаад асуултаа бичиж, бөмбөгийг хэд хэдэн удаа сэгсэр.",
    ],
    hints: [
      "Эхний нөхцөлд if (roll === 1), дараагийн нөхцөлд else if (roll === 2) гэж бич.",
    ],
    starter: pageFiles(eightBall, gameCss, emptyBranches),
    solution: pageFiles(
      eightBall,
      gameCss,
      'if (roll === 1) {\n  return "Тийм!";\n} else if (roll === 2) {\n  return "Магадгүй.";\n} else {\n  return "Үгүй.";\n}',
    ),
    checks: [...htmlChecks, ...ballChecks],
  },
  {
    id: "coin-toss",
    topic,
    title: "Зоос шидэх · Талыг нь таа",
    minutes: 12,
    file: "index.html",
    game: "coin-toss",
    explanation:
      "Тоглогч зоосны талыг таана. Бэлэн код тоглогчийн сонголтыг choice, зоосны гарсан талыг roll гэж дамжуулна.",
    prompt: [
      "HTML-ийн хоосон сонголтуудад Сүлд, Тоо гэж дарааллаар бич. Товчны class-д play гэж бич.",
      "CSS-д .eight-ball-ийн дэвсгэрийг #a26316, border-radius-ийг 50% болго.",
      "answer.js дээр choice болон roll тэнцүү бол «Таалаа!», бусад үед «Таасангүй.» гэж буцаа.",
    ],
    hints: ["1 нь Сүлд, 2 нь Тоо. Хоёр тоог choice === roll гэж харьцуул."],
    starter: pageFiles(
      coin
        .replace(">Сүлд<", "><")
        .replace(">Тоо<", "><")
        .replace('class="play"', 'class=""'),
      gameCss.replace("#18181b", "/* өнгө */").replace("50%", "/* утга */"),
      'if (false) { // Нөхцөлөө бич.\n  return "";\n} else {\n  return "";\n}',
    ),
    solution: pageFiles(
      coin,
      gameCss.replace("#18181b", "#a26316"),
      'if (choice === roll) {\n  return "Таалаа!";\n} else {\n  return "Таасангүй.";\n}',
    ),
    checks: choiceChecks(
      games["coin-toss"].rolls,
      "Зоос шидэх",
      "rgb(162, 99, 22)",
    ),
  },
  {
    id: "rock-paper-scissors",
    topic,
    title: "Чулуу, даавуу, хайч",
    minutes: 15,
    file: "index.html",
    game: "rock-paper-scissors",
    explanation:
      "Төхөөрөмжийн нүүдэл roll, тоглогчийн нүүдэл choice гэсэн тоогоор функцэд ирнэ.",
    prompt: [
      "HTML-ийн хоосон сонголтуудад Чулуу, Даавуу, Хайч гэж дарааллаар бич. Товчны class-д play гэж бич.",
      "CSS-д .eight-ball-ийн дэвсгэрийг #3555a0, border-radius-ийг 50% болго.",
      "1 нь чулуу, 2 нь даавуу, 3 нь хайч. Ижил бол «Тэнцлээ.», тоглогч давбал «Хожлоо!», үлдсэн үед «Хожигдлоо.» гэж буцаа.",
      "Чулуу хайчийг, даавуу чулууг, хайч даавууг давна.",
    ],
    hints: [
      "Хожих нэг нөхцөл нь choice === 1 && roll === 3. Хожих гурван нөхцөлийг || тэмдгээр холбо.",
    ],
    starter: pageFiles(
      rps
        .replace(">Чулуу<", "><")
        .replace(">Даавуу<", "><")
        .replace(">Хайч<", "><")
        .replace('class="play"', 'class=""'),
      gameCss.replace("#18181b", "/* өнгө */").replace("50%", "/* утга */"),
      emptyBranches,
    ),
    solution: pageFiles(
      rps,
      gameCss.replace("#18181b", "#3555a0"),
      `if (choice === roll) {
  return "Тэнцлээ.";
} else if (
  ${rpsWin}
) {
  return "Хожлоо!";
} else {
  return "Хожигдлоо.";
}`,
    ),
    checks: choiceChecks(
      games["rock-paper-scissors"].rolls,
      "Тоглох",
      "rgb(53, 85, 160)",
    ),
  },
] as const;
