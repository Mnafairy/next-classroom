export const EXAM_ID = "javascript-8-2026-10-v1";
export const EXAM_MINUTES = 35;
export const EXAM_GRADES: readonly number[] = [6, 7, 8];
export const EXAM_GRADE_LABEL = "6–8-р анги";
export const EXAM_TITLE = "JavaScript · 6–8-р ангийн шалгалт";

export type ExamQuestion = {
  id: string;
  prompt: string;
  code: string;
  options: string[];
};
export type ExamExercise = {
  id: string;
  title: string;
  prompt: string;
  starter: string;
  example: string;
};

// Answers and hidden cases live in grading.ts, which is imported only by the server.
export const examQuestions: ExamQuestion[] = [
  {
    id: "q01",
    prompt: "Роботын явсан зайг шинэчилсний дараах гаралтыг сонго.",
    code: "let distance = 18;\ndistance = distance - 7;\nconsole.log(distance);",
    options: ["18", "25", "11", "7"],
  },
  {
    id: "q02",
    prompt: "Тавиурын хоёр хувьсагчийн эцсийн утга аль вэ?",
    code: "let red = 4;\nlet blue = red + 3;\nred = blue - 1;\nconsole.log(red, blue);",
    options: ["4 7", "6 7", "6 6", "7 6"],
  },
  {
    id: "q03",
    prompt: "Нэг хувьсагчийн утгыг нөгөөгөөр сольсон зөв мөр аль вэ?",
    code: "let first = 16;\nlet second = 23;\n// first одоо 23 болох ёстой",
    options: [
      "first == second;",
      "let first = second;",
      "second = first;",
      "first = second;",
    ],
  },
  {
    id: "q04",
    prompt: "Энэ кодын аль мөрөнд нэрийн бичлэг зөрсөн бэ?",
    code: "let totalSteps = 30; // 1\ntotalSteps = totalSteps + 8; // 2\nconsole.log(totalsteps); // 3",
    options: ["1-р мөр", "2-р мөр", "3-р мөр", "Алдаа байхгүй"],
  },
  {
    id: "q05",
    prompt: "Хаалттай тооцооны зөв хариуг ол.",
    code: "console.log((17 - 5) / 3 + 2);",
    options: ["6", "10", "4", "8"],
  },
  {
    id: "q06",
    prompt: "Хуудасны багцын үлдэгдлийг тооцоол.",
    code: "let sheets = 29;\nconsole.log(sheets % 6);",
    options: ["4", "5", "6", "23"],
  },
  {
    id: "q07",
    prompt: "Текст ба тоог зүүнээс баруун тийш бодоход юу гарах вэ?",
    code: 'console.log(4 + 6 + "2");',
    options: ["12", "462", "42", "102"],
  },
  {
    id: "q08",
    prompt: "Зурагт хуудасны талбайг нэг мөрөөр зөв хэвлэхийг сонго.",
    code: "let width = 7;\nlet height = 9;",
    options: [
      "console.log(width + height);",
      'console.log("Талбай: " + (width * height));',
      'console.log("width * height");',
      "console.log(width / height);",
    ],
  },
  {
    id: "q09",
    prompt: "Босго утга дээр аль салаа ажиллах вэ?",
    code: 'let pages = 40;\nif (pages > 40) {\n  console.log("Урт");\n} else {\n  console.log("Богино");\n}',
    options: ["Урт", "Юу ч хэвлэхгүй", "Богино", "Урт Богино"],
  },
  {
    id: "q10",
    prompt: "Хоёр тусдаа if ашигласан үед гаралтын дараалал аль вэ?",
    code: 'let points = 14;\nif (points >= 10) console.log("X");\nif (points >= 12) console.log("Y");',
    options: ["X, дараа нь Y", "Зөвхөн X", "Зөвхөн Y", "Юу ч хэвлэхгүй"],
  },
  {
    id: "q11",
    prompt: "Салаалсан дүрмээр илгээмжийг ямар ангилалд оруулах вэ?",
    code: 'let weight = 5;\nif (weight < 2) {\n  console.log("S");\n} else if (weight < 5) {\n  console.log("M");\n} else {\n  console.log("L");\n}',
    options: ["S", "M", "Алдаа", "L"],
  },
  {
    id: "q12",
    prompt: "Утга оноохын оронд харьцуулах ёстой мөрийг зас.",
    code: 'let mode = "draw";\nif (mode = "erase") { /* ... */ }',
    options: [
      'if (mode + "erase")',
      'if (mode == "erase")',
      'if (let mode == "erase")',
      'if ("mode" == "erase")',
    ],
  },
  {
    id: "q13",
    prompt:
      "Дэлгэцийн гэрэлтүүлэг хэт бага ЭСВЭЛ хэт ихийг аль нөхцөл шалгах вэ?",
    code: "// 25-аас бага эсвэл 85-аас их",
    options: [
      "level < 25 && level > 85",
      "level >= 25 && level <= 85",
      "level < 25 || level > 85",
      "level == 25 || level == 85",
    ],
  },
  {
    id: "q14",
    prompt: "Төхөөрөмж бэлэн гэж хэвлэх үү?",
    code: 'let connected = true;\nlet paper = 0;\nif (connected == true && paper > 0) {\n  console.log("Бэлэн");\n} else {\n  console.log("Хүлээнэ");\n}',
    options: ["Хүлээнэ", "Бэлэн", "0", "true"],
  },
  {
    id: "q15",
    prompt: "Өрөөний хаалганы нөхцөл үнэн болох хос утгыг ол.",
    code: "hasKey == true || teacherHere == true",
    options: ["false, false", "0, 0", "false, true", "Аль ч хос биш"],
  },
  {
    id: "q16",
    prompt: "Тоон тасалбарын аль утга энэ нөхцөлийг хангахгүй вэ?",
    code: "ticket >= 30 && ticket < 35",
    options: ["30", "32", "34", "35"],
  },
  {
    id: "q17",
    prompt: "Хоёр үйлдлийн дараах хайрцагны тоо хэд вэ?",
    code: "let boxes = 9;\nboxes = boxes * 2;\nboxes = boxes - 4;\nconsole.log(boxes);",
    options: ["5", "14", "18", "22"],
  },
  {
    id: "q18",
    prompt: "Хугацаа ба бэлэн байдлыг хамтад нь шалгасан кодын гаралт аль вэ?",
    code: 'let minutes = 8;\nlet ready = false;\nif (minutes <= 10 && ready == true) {\n  console.log("Эхэл");\n} else {\n  console.log("Хүлээ");\n}',
    options: ["Эхэл", "8", "Хүлээ", "false"],
  },
  {
    id: "q19",
    prompt: "Хоёр тэмдэгтийг залгахад зайг зөв хадгалсан мөр аль вэ?",
    code: 'let room = "Лаб";\nlet number = 3;\n// Гаралт: Лаб 3',
    options: [
      "console.log(room + number);",
      'console.log("room number");',
      "console.log(room - number);",
      'console.log(room + " " + number);',
    ],
  },
  {
    id: "q20",
    prompt: "Хоёр салаа үнэн байж болох ч энэ код хэдэн мөр хэвлэх вэ?",
    code: 'let length = 22;\nif (length >= 20) {\n  console.log("A");\n} else if (length >= 10) {\n  console.log("B");\n} else {\n  console.log("C");\n}',
    options: ["2 мөр: A, B", "1 мөр: A", "3 мөр: A, B, C", "1 мөр: B"],
  },
];

export const examExercises: ExamExercise[] = [
  {
    id: "c01",
    title: "Зурагт хуудасны хүрээ",
    prompt:
      "width, height нь тэгш өнцөгт зурагт хуудасны талууд. Хүрээний нийт уртыг 2 * (width + height) томьёогоор олж, зөвхөн тоог хэвлэ.",
    starter: "let width = 8;\nlet height = 5;\n\n",
    example: "width = 8, height = 5 → 26",
  },
  {
    id: "c02",
    title: "Агуулахын бүртгэл",
    prompt:
      "stock дээр ирсэн added тоог нэмж, явуулсан sent тоог хасаж stock-ийн утгыг шинэчил. Дараа нь stock-ийг хэвлэ. Оролтын бүх тоо сөрөг биш, явуулсан тоо нь нөөцөөс хэтрэхгүй.",
    starter: "let stock = 24;\nlet added = 9;\nlet sent = 7;\n\n",
    example: "stock = 24, added = 9, sent = 7 → 26",
  },
  {
    id: "c03",
    title: "Секундын үлдэгдэл",
    prompt:
      "seconds нь сөрөг биш бүхэл тоо. Бүтэн минутуудыг хассаны дараа үлдэх секундыг % ашиглан олж, зөвхөн тоог хэвлэ.",
    starter: "let seconds = 143;\n\n",
    example: "seconds = 143 → 23",
  },
  {
    id: "c04",
    title: "Уулзалтаас хоцорсон уу?",
    prompt:
      'lateMinutes нь сөрөг биш бүхэл тоо. 5 минут болон түүнээс бага бол "Амжсан", 5-аас их бол "Хоцорсон" гэж хэвлэ. if / else ашигла.',
    starter: "let lateMinutes = 5;\n\n",
    example: "lateMinutes = 5 → Амжсан",
  },
  {
    id: "c05",
    title: "Бичлэг нээх эрх",
    prompt:
      'owner эсвэл invited-ийн аль нэг нь true бол "Нээнэ", хоёулаа false бол "Хаалттай" гэж хэвлэ. if болон || ашигла.',
    starter: "let owner = false;\nlet invited = true;\n\n",
    example: "owner = false, invited = true → Нээнэ",
  },
  {
    id: "c06",
    title: "Хайрцагны хэмжээ",
    prompt:
      'items нь сөрөг биш бүхэл тоо. 0–4 ширхэг бол "Жижиг", 5–9 бол "Дунд", 10 болон түүнээс их бол "Том" гэж хэвлэ. if / else if / else ашигла.',
    starter: "let items = 9;\n\n",
    example: "items = 9 → Дунд",
  },
];
