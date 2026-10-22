import type {
  CourseModule,
  PythonExercise,
  Requirement,
  TestCase,
} from "./types";

export const modules: CourseModule[] = [
  {
    title: "Хувьсагч ба төрөл",
    description: "Мэдлэгээ сэргээе",
    symbol: "x =",
    color: "blue",
    explanation:
      "Хувьсагч утга хадгална. Python-д let эсвэл const бичихгүй. int нь бүхэл тоо, float нь бутархай тоо, str нь текст, bool нь True эсвэл False утгатай.",
    example: 'ner = "Саруул"\nnas = 16\nprint(ner, nas)\nprint(type(nas))',
  },
  {
    title: "Оролт ба тооцоолол",
    description: "input() · int() · float()",
    symbol: "in",
    color: "amber",
    explanation:
      "input() үргэлж текст буцаана. Тооцоо хийхээсээ өмнө int() эсвэл float()-аар хувиргана. Доорх оролтын талбарт input() бүрийн утгыг тусдаа мөрөнд оруулаарай.",
    example:
      'a = int(input("Эхний тоо: "))\nb = int(input("Хоёр дахь тоо: "))\nprint(a + b)',
  },
  {
    title: "Нөхцөл шалгах",
    description: "if · elif · else",
    symbol: "if",
    color: "teal",
    explanation:
      "if нөхцөл үнэн үед догол мөр доторх код ажиллана. elif нь дараагийн нөхцөлийг шалгана. Эхний үнэн салаа ажиллаад бусдыг алгасана. Аль нь ч үнэн биш бол else ажиллана. Салааны төгсгөлд : бичнэ.",
    example:
      'battery = 15\nif battery <= 20:\n    print("Цэнэглээрэй")\nelse:\n    print("Хангалттай")',
  },
  {
    title: "Хосолсон нөхцөл",
    description: "and · or · not",
    symbol: "&",
    color: "violet",
    explanation:
      "and: хоёр нөхцөл хоёулаа үнэн. or: ядаж нэг нөхцөл үнэн. not: үнэний утгыг урвуулна. Python-д 6 <= nas <= 12 гэсэн давхар харьцуулалт бас зөв.",
    example:
      'nas = 16\ngishuun = True\nif nas >= 15 and gishuun:\n    print("Орох эрхтэй")',
  },
  {
    title: "for давталт",
    description: "Давтаад, тоолоод, нэгтгэе",
    symbol: "for",
    color: "blue",
    fresh: true,
    explanation:
      "for нь дарааллын утга бүрээр давтана. range(1, 6) нь 1, 2, 3, 4, 5 гэсэн утгууд өгнө. Төгсгөлийн утга орохгүй. Нийлбэр хадгалах хувьсагчийг давталтын өмнө эхлүүлнэ.",
    example:
      "niit = 0\nfor i in range(1, 6):\n    niit += i\nprint(niit)  # 15",
  },
  {
    title: "while давталт",
    description: "Нөхцөл үнэн байх хугацаанд",
    symbol: "↻",
    color: "teal",
    fresh: true,
    explanation:
      "while нь нөхцөл True байх хугацаанд давтана. Нөхцөл эхнээсээ False бол нэг ч удаа ажиллахгүй. Давталт зогсохын тулд нөхцөлд нөлөөлөх утга өөрчлөгдөх хэрэгтэй. break нь тухайн давталтыг шууд зогсооно.",
    example: "i = 1\nwhile i <= 5:\n    print(i)\n    i += 1",
  },
  {
    title: "Давталтаа удирдъя",
    description: "continue · давхар давталт",
    symbol: "↳",
    color: "violet",
    fresh: true,
    explanation:
      "continue нь тухайн алхмын үлдсэн кодыг алгасаад дараагийн алхамд орно. Давхар давталтад гадна давталтын алхам бүрд дотор давталт бүхэлдээ ажиллана. break зөвхөн өөрийг нь хүрээлсэн хамгийн доторх давталтыг зогсооно.",
    example:
      "for mur in range(2):\n    for bagana in range(3):\n        print(mur, bagana)",
  },
];

const node = (name: string, label: string): Requirement => ({
  kind: "node",
  name,
  label,
});
const call = (name: string): Requirement => ({
  kind: "call",
  name,
  label: `${name}() ашигласан`,
});
const assign = (name: string): Requirement => ({
  kind: "assign",
  name,
  label: `${name} хувьсагч ашигласан`,
});
const variableCases = (
  name: string,
  entries: [string | number | boolean, string][],
): TestCase[] =>
  entries.map(([value, expected]) => ({
    label: `${name} = ${String(value)}`,
    variables: { [name]: value },
    expected,
  }));
const inputCases = (entries: [string[], string][]): TestCase[] =>
  entries.map(([inputs, expected]) => ({
    label: `Оролт: ${inputs.join(", ")}`,
    inputs,
    expected,
  }));

export const exercises: PythonExercise[] = [
  {
    id: "hello",
    module: 0,
    title: "Сайн уу, Python!",
    minutes: 3,
    level: "Эхлэл",
    steps: [
      'print() ашиглан "Сайн уу, Python!" гэж хэвлэ.',
      "Текстээ хашилтад бичээрэй. Нэг эсвэл хоёр хашилт ашиглаж болно.",
    ],
    starter: "# Анхны Python кодоо бичээрэй.\n",
    solution: 'print("Сайн уу, Python!")\n',
    exampleInput: "Оролт шаардлагагүй",
    expected: "Сайн уу, Python!",
    hints: [
      'print("текст") гэсэн хэлбэртэй.',
      'print("Сайн уу, Python!") гэж бичээрэй.',
    ],
    requirements: [call("print")],
    tests: [{ label: "Мэндчилгээ", expected: "Сайн уу, Python!" }],
  },
  {
    id: "name",
    module: 0,
    title: "Нэрээ өөрчилье",
    minutes: 3,
    level: "Эхлэл",
    steps: [
      'ner хувьсагчийн утгыг "Билгүүн" болгож өөрчил.',
      "Шинэ утгыг print() ашиглан хэвлэ.",
    ],
    starter: 'ner = "Жон"\n\n# Шинэ нэр өгөөд хэвлээрэй.\n',
    solution: 'ner = "Жон"\nner = "Билгүүн"\nprint(ner)\n',
    exampleInput: 'ner = "Жон"',
    expected: "Билгүүн",
    hints: [
      'Python-д хувьсагчид ner = "Билгүүн" гэж утга өгнө.',
      "print(ner) нь хувьсагчийн утгыг хэвлэнэ.",
    ],
    requirements: [assign("ner"), call("print")],
    tests: [{ label: "Шинэ нэр", expected: "Билгүүн" }],
  },
  {
    id: "age",
    module: 0,
    title: "Нэг нас нэмэгдлээ",
    minutes: 4,
    level: "Эхлэл",
    steps: [
      "nas хувьсагчид одоогийн нас хадгалагдсан.",
      "Нэгийг нэмээд дараа жилийн насыг хэвлэ. Өөр нас өгсөн ч ажилладаг байг.",
    ],
    starter: "nas = 15\n\n# Дараа жилийн насыг хэвлээрэй.\n",
    solution: "nas = 15\nprint(nas + 1)\n",
    exampleInput: "nas = 15",
    expected: "16",
    hints: ["Нас дээр 1 нэмнэ.", "print(nas + 1) ашиглаарай."],
    requirements: [assign("nas"), call("print")],
    tests: variableCases("nas", [
      [15, "16"],
      [10, "11"],
      [17, "18"],
    ]),
  },
  {
    id: "types",
    module: 0,
    title: "Ямар төрөл вэ?",
    minutes: 4,
    level: "Дадлага",
    steps: [
      "too хувьсагчийн төрлийг type()-аар шалгаад хэвлэ.",
      "Хувьсагчийн утга өөрчлөгдөхөд төрөл нь мөн өөрчлөгдөж болно.",
    ],
    starter: "too = 10\n\n# Төрлийг нь хэвлээрэй.\n",
    solution: "too = 10\nprint(type(too))\n",
    exampleInput: "too = 10",
    expected: "<class 'int'>",
    hints: ["type(too) нь төрлийг буцаана.", "print(type(too)) гэж бичнэ."],
    requirements: [assign("too"), call("type"), call("print")],
    tests: variableCases("too", [
      [10, "<class 'int'>"],
      [3.5, "<class 'float'>"],
      ["10", "<class 'str'>"],
    ]),
  },
  {
    id: "sum-input",
    module: 1,
    title: "Хоёр тооны нийлбэр",
    minutes: 5,
    level: "Эхлэл",
    steps: [
      "input() ашиглан хоёр бүхэл тоо ав.",
      "Оролт бүрийг int()-ээр хувиргаад нийлбэрийг хэвлэ.",
    ],
    starter: "# Хоёр тоог гараас аваарай.\na = int(input())\n\n",
    solution: "a = int(input())\nb = int(input())\nprint(a + b)\n",
    inputs: ["12", "8"],
    exampleInput: "12\n8",
    expected: "20",
    hints: [
      "Хоёр дахь тоонд b = int(input()) ашигла.",
      "print(a + b) нь нийлбэрийг хэвлэнэ.",
    ],
    requirements: [call("input"), call("int")],
    tests: inputCases([
      [["12", "8"], "20"],
      [["-3", "5"], "2"],
      [["0", "0"], "0"],
    ]),
  },
  {
    id: "rectangle",
    module: 1,
    title: "Талбайгаа олъё",
    minutes: 5,
    level: "Дадлага",
    steps: [
      "Тэгш өнцөгтийн урт, өргөнийг input()-ээр ав.",
      "Бутархай тоо дэмжихийн тулд float() ашигла. Талбайг хэвлэ.",
    ],
    starter: "# Урт, өргөнийг тус тус уншаарай.\n",
    solution:
      "urt = float(input())\nurgun = float(input())\nprint(urt * urgun)\n",
    inputs: ["2.5", "4"],
    exampleInput: "2.5\n4",
    expected: "10.0",
    hints: ["Талбай = урт × өргөн.", "urt = float(input()) гэж оролт авна."],
    requirements: [call("input"), call("float")],
    tests: inputCases([
      [["2.5", "4"], "10.0"],
      [["3", "6"], "18.0"],
      [["1.5", "1.5"], "2.25"],
    ]),
  },
  {
    id: "minutes",
    module: 1,
    title: "Минутыг задалъя",
    minutes: 5,
    level: "Дадлага",
    steps: [
      "Нийт минутыг бүхэл тоогоор ав.",
      "Бүтэн цаг болон үлдсэн минутыг нэг мөрөнд зайгаар тусгаарлан хэвлэ. // ба % ашиглаарай.",
    ],
    starter: "minut = int(input())\n\n",
    solution: "minut = int(input())\nprint(minut // 60, minut % 60)\n",
    inputs: ["135"],
    exampleInput: "135",
    expected: "2 15",
    hints: [
      "// нь бүхэл хуваалт, % нь үлдэгдэл.",
      "print(minut // 60, minut % 60) гэж хэвлэж болно.",
    ],
    requirements: [
      call("input"),
      node("FloorDiv", "Бүхэл хуваалт ашигласан"),
      node("Mod", "Үлдэгдэл олсон"),
    ],
    tests: inputCases([
      [["135"], "2 15"],
      [["60"], "1 0"],
      [["45"], "0 45"],
    ]),
  },
  {
    id: "battery",
    module: 2,
    title: "Батерейгаа цэнэглэх үү?",
    minutes: 4,
    level: "Эхлэл",
    steps: [
      "battery нь батерейны цэнэгийн хувь (0–100).",
      'Цэнэг 20 болон түүнээс бага бол "Батерейгаа цэнэглээрэй." гэж хэвлэ.',
      '20-оос их бол "Цэнэг хангалттай байна." гэж хэвлэ.',
      "if / else ашигла. Яг 20 байх үеийг анхаараарай.",
    ],
    starter:
      "battery = 15\n\n# Батерейгаа цэнэглэх хэрэгтэй эсэхийг шалгаарай.\n",
    solution:
      'battery = 15\n\nif battery <= 20:\n    print("Батерейгаа цэнэглээрэй.")\nelse:\n    print("Цэнэг хангалттай байна.")\n',
    exampleInput: "battery = 15",
    expected: "Батерейгаа цэнэглээрэй.",
    hints: [
      "20 мөн цэнэг багатай ангилалд орно. <= операторыг санаарай.",
      "if battery <= 20: гэж эхлүүлээд дараагийн мөрийг 4 зайгаар доголлуул.",
    ],
    requirements: [assign("battery"), node("If", "if / else нөхцөл ашигласан")],
    tests: variableCases("battery", [
      [15, "Батерейгаа цэнэглээрэй."],
      [20, "Батерейгаа цэнэглээрэй."],
      [21, "Цэнэг хангалттай байна."],
      [0, "Батерейгаа цэнэглээрэй."],
      [100, "Цэнэг хангалттай байна."],
    ]),
  },
  {
    id: "even",
    module: 2,
    title: "Тэгш үү, сондгой юу?",
    minutes: 4,
    level: "Эхлэл",
    steps: [
      'too нь 2-т үлдэгдэлгүй хуваагдвал "Тэгш", бусад үед "Сондгой" гэж хэвлэ.',
      "if / else болон % оператор ашигла.",
    ],
    starter: "too = 7\n\n",
    solution:
      'too = 7\nif too % 2 == 0:\n    print("Тэгш")\nelse:\n    print("Сондгой")\n',
    exampleInput: "too = 7",
    expected: "Сондгой",
    hints: [
      "too % 2 нь 2-т хуваахад гарах үлдэгдэл.",
      "Үлдэгдэл 0-тэй тэнцүү эсэхийг == ашиглан шалга.",
    ],
    requirements: [
      assign("too"),
      node("If", "Нөхцөл ашигласан"),
      node("Mod", "% ашигласан"),
    ],
    tests: variableCases("too", [
      [7, "Сондгой"],
      [8, "Тэгш"],
      [0, "Тэгш"],
      [-3, "Сондгой"],
    ]),
  },
  {
    id: "grade",
    module: 2,
    title: "Онооноос үнэлгээ рүү",
    minutes: 6,
    level: "Дадлага",
    steps: [
      "onoo нь 0–100 хооронд байна.",
      "90+: A, 80–89: B, 70–79: C, 60–69: D, бусад: F гэж хэвлэ.",
      "if / elif / else ашиглан өндөр онооноос эхэлж шалга.",
    ],
    starter: "onoo = 85\n\n",
    solution:
      'onoo = 85\nif onoo >= 90:\n    print("A")\nelif onoo >= 80:\n    print("B")\nelif onoo >= 70:\n    print("C")\nelif onoo >= 60:\n    print("D")\nelse:\n    print("F")\n',
    exampleInput: "onoo = 85",
    expected: "B",
    hints: [
      "Эхний биелсэн нөхцөл ажиллана. >= 90-ийг эхэлж шалга.",
      "Дараагийн салааг elif onoo >= 80: гэж бичнэ.",
    ],
    requirements: [assign("onoo"), node("If", "Нөхцөл ашигласан")],
    tests: variableCases("onoo", [
      [85, "B"],
      [90, "A"],
      [80, "B"],
      [70, "C"],
      [60, "D"],
      [59, "F"],
      [100, "A"],
    ]),
  },
  {
    id: "temperature",
    module: 2,
    title: "Юу өмсөх вэ?",
    minutes: 5,
    level: "Дадлага",
    steps: [
      'hem < 0 бол "Зузаан хувцаслаарай.", 0–19 бол "Хүрэм өмсөөрэй.", 20 ба түүнээс их бол "Нимгэн хувцаслаарай." гэж хэвлэ.',
      "Яг 0 болон 20 хэмийг шалгаарай.",
    ],
    starter: "hem = -5\n\n",
    solution:
      'hem = -5\nif hem < 0:\n    print("Зузаан хувцаслаарай.")\nelif hem < 20:\n    print("Хүрэм өмсөөрэй.")\nelse:\n    print("Нимгэн хувцаслаарай.")\n',
    exampleInput: "hem = -5",
    expected: "Зузаан хувцаслаарай.",
    hints: [
      "Гурван ангилалд if / elif / else тохирно.",
      "Эхлээд hem < 0, дараа нь hem < 20 шалга.",
    ],
    requirements: [assign("hem"), node("If", "Нөхцөл ашигласан")],
    tests: variableCases("hem", [
      [-5, "Зузаан хувцаслаарай."],
      [0, "Хүрэм өмсөөрэй."],
      [19, "Хүрэм өмсөөрэй."],
      [20, "Нимгэн хувцаслаарай."],
    ]),
  },
  {
    id: "ticket",
    module: 2,
    title: "Киноны тасалбар",
    minutes: 5,
    level: "Дадлага",
    steps: [
      "nas < 6 бол үнэ 0, 6–17 бол 5000, 18 ба түүнээс их бол 10000.",
      "Зөвхөн тасалбарын үнийг хэвлэ.",
    ],
    starter: "nas = 16\n\n",
    solution:
      "nas = 16\nif nas < 6:\n    print(0)\nelif nas < 18:\n    print(5000)\nelse:\n    print(10000)\n",
    exampleInput: "nas = 16",
    expected: "5000",
    hints: [
      "Эхлээд хамгийн бага насны ангиллыг шалга.",
      "elif nas < 18: гэсэн салаа хэрэгтэй.",
    ],
    requirements: [assign("nas"), node("If", "Нөхцөл ашигласан")],
    tests: variableCases("nas", [
      [16, "5000"],
      [5, "0"],
      [6, "5000"],
      [17, "5000"],
      [18, "10000"],
    ]),
  },
  {
    id: "entry",
    module: 3,
    title: "Орох эрхтэй юу?",
    minutes: 5,
    level: "Дадлага",
    steps: [
      'Нас 15 ба түүнээс их БӨГӨӨД гишүүн бол "Орох эрхтэй", бусад үед "Орох эрхгүй" гэж хэвлэ.',
      "nas, gishuun хувьсагч болон and ашигла.",
    ],
    starter: "nas = 16\ngishuun = True\n\n",
    solution:
      'nas = 16\ngishuun = True\nif nas >= 15 and gishuun:\n    print("Орох эрхтэй")\nelse:\n    print("Орох эрхгүй")\n',
    exampleInput: "nas = 16\ngishuun = True",
    expected: "Орох эрхтэй",
    hints: [
      "Хоёр нөхцөл хоёулаа үнэн байх хэрэгтэй.",
      "if nas >= 15 and gishuun: гэж шалга.",
    ],
    requirements: [
      assign("nas"),
      assign("gishuun"),
      node("And", "and ашигласан"),
    ],
    tests: [
      {
        label: "15 настай гишүүн",
        variables: { nas: 15, gishuun: true },
        expected: "Орох эрхтэй",
      },
      {
        label: "14 настай гишүүн",
        variables: { nas: 14, gishuun: true },
        expected: "Орох эрхгүй",
      },
      {
        label: "16 настай, гишүүн биш",
        variables: { nas: 16, gishuun: false },
        expected: "Орох эрхгүй",
      },
    ],
  },
  {
    id: "delivery",
    module: 3,
    title: "Хүргэлт үнэгүй юу?",
    minutes: 5,
    level: "Дадлага",
    steps: [
      'Дүн 50000 ба түүнээс их ЭСВЭЛ VIP гишүүн бол "Үнэгүй", бусад үед "5000" гэж хэвлэ.',
      "dun, vip хувьсагч болон or ашигла.",
    ],
    starter: "dun = 30000\nvip = True\n\n",
    solution:
      'dun = 30000\nvip = True\nif dun >= 50000 or vip:\n    print("Үнэгүй")\nelse:\n    print(5000)\n',
    exampleInput: "dun = 30000\nvip = True",
    expected: "Үнэгүй",
    hints: [
      "Аль нэг нөхцөл үнэн байхад хүргэлт үнэгүй.",
      "if dun >= 50000 or vip: гэж шалга.",
    ],
    requirements: [assign("dun"), assign("vip"), node("Or", "or ашигласан")],
    tests: [
      {
        label: "VIP гишүүн",
        variables: { dun: 30000, vip: true },
        expected: "Үнэгүй",
      },
      {
        label: "Хязгаарын дүн",
        variables: { dun: 50000, vip: false },
        expected: "Үнэгүй",
      },
      {
        label: "Ердийн хүргэлт",
        variables: { dun: 49999, vip: false },
        expected: "5000",
      },
    ],
  },
  {
    id: "homework",
    module: 3,
    title: "Даалгавраа сануулъя",
    minutes: 4,
    level: "Эхлэл",
    steps: [
      'hiisen нь False бол "Даалгавраа хийгээрэй.", True бол "Сайн байна!" гэж хэвлэ.',
      "not ашиглан нөхцөлийг урвуул.",
    ],
    starter: "hiisen = False\n\n",
    solution:
      'hiisen = False\nif not hiisen:\n    print("Даалгавраа хийгээрэй.")\nelse:\n    print("Сайн байна!")\n',
    exampleInput: "hiisen = False",
    expected: "Даалгавраа хийгээрэй.",
    hints: ["not False нь True болно.", "if not hiisen: гэж эхлүүл."],
    requirements: [assign("hiisen"), node("Not", "not ашигласан")],
    tests: variableCases("hiisen", [
      [false, "Даалгавраа хийгээрэй."],
      [true, "Сайн байна!"],
    ]),
  },
  {
    id: "for-intro",
    module: 4,
    title: "Таван удаа мэндэлье",
    minutes: 4,
    level: "Эхлэл",
    steps: [
      'for давталтаар "Сайн уу!" гэж яг 5 удаа, тус тусдаа мөрөнд хэвлэ.',
      "range() ашигла. Давталтын доторх мөрийг 4 зайгаар доголлуул.",
    ],
    starter:
      "# Нэг print(), таван мэндчилгээ.\nfor i in range(5):\n    # Энд мэндчилгээг хэвлээрэй.\n    pass\n",
    solution: 'for i in range(5):\n    print("Сайн уу!")\n',
    exampleInput: "range(5) → 0, 1, 2, 3, 4",
    expected: Array(5).fill("Сайн уу!").join("\n"),
    hints: [
      "Догол мөр доторх код алхам бүрд ажиллана.",
      'pass-ийг print("Сайн уу!") гэж солиорой.',
    ],
    requirements: [node("For", "for давталт ашигласан"), call("range")],
    tests: [
      {
        label: "Яг 5 мэндчилгээ",
        expected: Array(5).fill("Сайн уу!").join("\n"),
      },
    ],
  },
  {
    id: "range",
    module: 4,
    title: "1-ээс N хүртэл",
    minutes: 5,
    level: "Эхлэл",
    steps: [
      "n тоог input()-ээр ав. 1-ээс n хүртэлх бүх тоог тус тусдаа мөрөнд хэвлэ.",
      "n нь 1 ба түүнээс их. Төгсгөлийн n утгыг оруулахаа мартав аа.",
    ],
    starter: "n = int(input())\n\n# Давталтаа бичээрэй.\n",
    solution: "n = int(input())\nfor i in range(1, n + 1):\n    print(i)\n",
    inputs: ["5"],
    exampleInput: "5",
    expected: "1\n2\n3\n4\n5",
    hints: [
      "range()-ийн төгсгөлийн утга орохгүй.",
      "range(1, n + 1) ашиглаарай.",
    ],
    requirements: [call("input"), node("For", "for ашигласан"), call("range")],
    tests: inputCases([
      [["5"], "1\n2\n3\n4\n5"],
      [["1"], "1"],
      [["3"], "1\n2\n3"],
    ]),
  },
  {
    id: "times-table",
    module: 4,
    title: "Өөрийн үржүүлэх хүрд",
    minutes: 6,
    level: "Дадлага",
    steps: [
      "Гараас нэг бүхэл тоо ав.",
      'Тэр тоог 1–10-аар үржүүл. "7 x 1 = 7" хэлбэрээр мөр бүрийг хэвлэ.',
    ],
    starter: "too = int(input())\n\n",
    solution:
      'too = int(input())\nfor i in range(1, 11):\n    print(too, "x", i, "=", too * i)\n',
    inputs: ["7"],
    exampleInput: "7",
    expected: Array.from(
      { length: 10 },
      (_, i) => `7 x ${i + 1} = ${7 * (i + 1)}`,
    ).join("\n"),
    hints: [
      "range(1, 11) нь 1–10 гэсэн утгууд өгнө.",
      'print(too, "x", i, "=", too * i) гэж хэвлэж болно.',
    ],
    requirements: [call("input"), node("For", "for ашигласан")],
    tests: [2, 7, 0].map((n) => ({
      label: `${n}-ын хүрд`,
      inputs: [String(n)],
      expected: Array.from(
        { length: 10 },
        (_, i) => `${n} x ${i + 1} = ${n * (i + 1)}`,
      ).join("\n"),
    })),
  },
  {
    id: "evens",
    module: 4,
    title: "Тэгш тоонуудыг олъё",
    minutes: 6,
    level: "Дадлага",
    steps: [
      "n тоог input()-ээр ав. 1-ээс n хүртэлх тэгш тоонуудыг тус тусдаа мөрөнд хэвлэ.",
      "for дотор if ашиглан тэгш эсэхийг шалга.",
    ],
    starter: "n = int(input())\n\n",
    solution:
      "n = int(input())\nfor i in range(1, n + 1):\n    if i % 2 == 0:\n        print(i)\n",
    inputs: ["10"],
    exampleInput: "10",
    expected: "2\n4\n6\n8\n10",
    hints: [
      "i % 2 == 0 бол тэгш.",
      "if мөр нь for дотор, print мөр нь if дотор байна.",
    ],
    requirements: [
      call("input"),
      node("For", "for ашигласан"),
      node("If", "if ашигласан"),
    ],
    tests: inputCases([
      [["10"], "2\n4\n6\n8\n10"],
      [["5"], "2\n4"],
      [["1"], ""],
    ]),
  },
  {
    id: "sum-loop",
    module: 4,
    title: "Нийлбэрийг цуглуулъя",
    minutes: 7,
    level: "Дадлага",
    steps: [
      "n тоог input()-ээр ав. 1-ээс n хүртэлх тоонуудын нийлбэрийг ол.",
      "for ашигла. Нийлбэрийг зөвхөн нэг удаа, давталтын дараа хэвлэ.",
    ],
    starter: "n = int(input())\nniit = 0\n\n",
    solution:
      "n = int(input())\nniit = 0\nfor i in range(1, n + 1):\n    niit += i\nprint(niit)\n",
    inputs: ["5"],
    exampleInput: "5",
    expected: "15",
    hints: [
      "niit = 0-ийг давталтын гадна эхлүүлнэ.",
      "Дотор нь niit += i, гадна нь print(niit) бич.",
    ],
    requirements: [call("input"), node("For", "for ашигласан")],
    tests: inputCases([
      [["5"], "15"],
      [["1"], "1"],
      [["10"], "55"],
      [["0"], "0"],
    ]),
  },
  {
    id: "while-count",
    module: 5,
    title: "while-аар тоолъё",
    minutes: 5,
    level: "Эхлэл",
    steps: [
      "n тоог input()-ээр ав. 1-ээс n хүртэлх тоонуудыг while ашиглан хэвлэ.",
      "Тоолуураа алхам бүрд нэм. n нь 1 ба түүнээс их.",
    ],
    starter: "n = int(input())\ni = 1\n\n",
    solution:
      "n = int(input())\ni = 1\nwhile i <= n:\n    print(i)\n    i += 1\n",
    inputs: ["5"],
    exampleInput: "5",
    expected: "1\n2\n3\n4\n5",
    hints: [
      "while i <= n: гэж нөхцөлөө бич.",
      "print(i)-ийн дараа i += 1 хэрэгтэй.",
    ],
    requirements: [call("input"), node("While", "while ашигласан")],
    tests: inputCases([
      [["5"], "1\n2\n3\n4\n5"],
      [["1"], "1"],
      [["3"], "1\n2\n3"],
    ]),
  },
  {
    id: "countdown",
    module: 5,
    title: "Хөөрөхөд бэлэн үү?",
    minutes: 5,
    level: "Дадлага",
    steps: [
      "n тооноос 1 хүртэл ухрааж тоол. Тоо бүрийг шинэ мөрөнд хэвлэ.",
      'Дараа нь "Хөөрлөө!" гэж хэвлэ. while ашиглаарай. n нь 0 эсвэл эерэг байна.',
    ],
    starter: "n = int(input())\n\n",
    solution:
      'n = int(input())\nwhile n > 0:\n    print(n)\n    n -= 1\nprint("Хөөрлөө!")\n',
    inputs: ["3"],
    exampleInput: "3",
    expected: "3\n2\n1\nХөөрлөө!",
    hints: [
      "Алхам бүрд n-ийг нэгээр бууруулна.",
      "n -= 1 гэж бичнэ. Сүүлийн print давталтын гадна байна.",
    ],
    requirements: [call("input"), node("While", "while ашигласан")],
    tests: inputCases([
      [["3"], "3\n2\n1\nХөөрлөө!"],
      [["1"], "1\nХөөрлөө!"],
      [["0"], "Хөөрлөө!"],
    ]),
  },
  {
    id: "guess",
    module: 5,
    title: "Нууц тоог таагаарай",
    minutes: 8,
    level: "Сорилт",
    steps: [
      "Нууц тоо 7. Зөв таах хүртэл input()-ээр дахин тоо ав.",
      'Таалт 7-оос бага бол "Их тоо", их бол "Бага тоо", зөв бол "Зөв!" гэж хэвлэ.',
      "while ашигла. Туршихдаа оролтын талбарт таалт бүрийг шинэ мөрөнд оруул.",
    ],
    starter: "nuuts = 7\ntaalt = 0\n\n",
    solution:
      'nuuts = 7\ntaalt = 0\nwhile taalt != nuuts:\n    taalt = int(input())\n    if taalt < nuuts:\n        print("Их тоо")\n    elif taalt > nuuts:\n        print("Бага тоо")\n    else:\n        print("Зөв!")\n',
    inputs: ["3", "9", "7"],
    exampleInput: "3\n9\n7",
    expected: "Их тоо\nБага тоо\nЗөв!",
    hints: [
      "while taalt != nuuts: гэсэн нөхцөл тохирно.",
      "Шинэ таалтыг давталт дотроо ав. if / elif / else-ээр харьцуул.",
    ],
    requirements: [
      call("input"),
      node("While", "while ашигласан"),
      node("If", "Нөхцөл ашигласан"),
    ],
    tests: inputCases([
      [["3", "9", "7"], "Их тоо\nБага тоо\nЗөв!"],
      [["7"], "Зөв!"],
      [["10", "7"], "Бага тоо\nЗөв!"],
    ]),
  },
  {
    id: "password",
    module: 5,
    title: "Гурван оролдлого",
    minutes: 8,
    level: "Сорилт",
    steps: [
      'Нууц үг "python10". Хамгийн ихдээ 3 удаа input()-ээр асуу.',
      'Зөв бол "Нэвтэрлээ" гэж хэвлээд break-ээр зогсоо. Буруу бүрд "Буруу" гэж хэвлэ.',
      "for эсвэл while ашиглаж болно. Зөв таасны дараа дахин оролт авч болохгүй.",
    ],
    starter: "# 3 оролдлого, зөв бол зогсоно.\n",
    solution:
      'for i in range(3):\n    ug = input()\n    if ug == "python10":\n        print("Нэвтэрлээ")\n        break\n    print("Буруу")\n',
    inputs: ["hello", "python10"],
    exampleInput: "hello\npython10",
    expected: "Буруу\nНэвтэрлээ",
    hints: [
      "for i in range(3): гэж 3 удаа давтаж болно.",
      'if ug == "python10": салаанд хэвлээд break бич.',
    ],
    requirements: [call("input"), node("Break", "break ашигласан")],
    tests: inputCases([
      [["hello", "python10"], "Буруу\nНэвтэрлээ"],
      [["python10"], "Нэвтэрлээ"],
      [["a", "b", "c", "python10"], "Буруу\nБуруу\nБуруу"],
    ]),
  },
  {
    id: "continue",
    module: 6,
    title: "Гурвын үржвэрийг алгасъя",
    minutes: 6,
    level: "Дадлага",
    steps: [
      "1-ээс n хүртэл давт. 3-т хуваагддаг тоонуудыг continue ашиглан алгас.",
      "Үлдсэн тоонуудыг тус тусдаа мөрөнд хэвлэ.",
    ],
    starter: "n = int(input())\n\n",
    solution:
      "n = int(input())\nfor i in range(1, n + 1):\n    if i % 3 == 0:\n        continue\n    print(i)\n",
    inputs: ["7"],
    exampleInput: "7",
    expected: "1\n2\n4\n5\n7",
    hints: [
      "i % 3 == 0 үед алгасна.",
      "continue-ийн дараах print ажиллахгүй, дараагийн i рүү орно.",
    ],
    requirements: [call("input"), node("Continue", "continue ашигласан")],
    tests: inputCases([
      [["7"], "1\n2\n4\n5\n7"],
      [["3"], "1\n2"],
      [["1"], "1"],
    ]),
  },
  {
    id: "grid",
    module: 6,
    title: "Мөр ба багана",
    minutes: 7,
    level: "Дадлага",
    steps: [
      "Гараас мөрийн тоо, баганын тоог тус тус ав.",
      "Давхар for ашиглан мөр, баганын дугаарыг 1-ээс эхлүүлж хосоор хэвлэ.",
    ],
    starter: "mur = int(input())\nbagana = int(input())\n\n",
    solution:
      "mur = int(input())\nbagana = int(input())\nfor i in range(1, mur + 1):\n    for j in range(1, bagana + 1):\n        print(i, j)\n",
    inputs: ["2", "3"],
    exampleInput: "2\n3",
    expected: "1 1\n1 2\n1 3\n2 1\n2 2\n2 3",
    hints: [
      "Гадна давталт мөр, дотор давталт баганаар явна.",
      "print(i, j) нь хоёр давталтын дотор байна.",
    ],
    requirements: [
      call("input"),
      { kind: "nested", name: "For", label: "Давхар for ашигласан" },
    ],
    tests: inputCases([
      [["2", "3"], "1 1\n1 2\n1 3\n2 1\n2 2\n2 3"],
      [["1", "2"], "1 1\n1 2"],
      [["2", "1"], "1 1\n2 1"],
    ]),
  },
  {
    id: "stars",
    module: 6,
    title: "Одоор шат зуръя",
    minutes: 8,
    level: "Сорилт",
    steps: [
      "n мөртэй одон шат хэвлэ. Эхний мөр 1 од, дараагийн мөр 2 од гэх мэт.",
      'Давхар for ашигла. print("*", end="") нэг мөрөнд хэвлэнэ, print() шинэ мөр эхлүүлнэ.',
    ],
    starter: "n = int(input())\n\n",
    solution:
      'n = int(input())\nfor i in range(1, n + 1):\n    for j in range(i):\n        print("*", end="")\n    print()\n',
    inputs: ["4"],
    exampleInput: "4",
    expected: "*\n**\n***\n****",
    hints: [
      "i-р мөрөнд дотор давталт i удаа ажиллана.",
      'Дотор нь print("*", end=""), дотор давталтын дараа print() бич.',
    ],
    requirements: [
      call("input"),
      { kind: "nested", name: "For", label: "Давхар for ашигласан" },
    ],
    tests: inputCases([
      [["4"], "*\n**\n***\n****"],
      [["1"], "*"],
      [["3"], "*\n**\n***"],
    ]),
  },
  {
    id: "times-grid",
    module: 6,
    title: "Бүх хүрдийг бүтээе",
    minutes: 9,
    level: "Сорилт",
    steps: [
      "n тоог ав. 1-ээс n хүртэлх тоо бүрийн 1-ээс n хүртэлх хүрдийг хэвлэ.",
      'Давхар for ашигла. Мөр бүр "1 x 1 = 1" хэлбэртэй байна.',
    ],
    starter: "n = int(input())\n\n",
    solution:
      'n = int(input())\nfor i in range(1, n + 1):\n    for j in range(1, n + 1):\n        print(i, "x", j, "=", i * j)\n',
    inputs: ["2"],
    exampleInput: "2",
    expected: "1 x 1 = 1\n1 x 2 = 2\n2 x 1 = 2\n2 x 2 = 4",
    hints: [
      "Гадна ба дотор range хоёулаа 1-ээс n хүртэл.",
      'print(i, "x", j, "=", i * j) гэж хэвлэ.',
    ],
    requirements: [
      call("input"),
      { kind: "nested", name: "For", label: "Давхар for ашигласан" },
    ],
    tests: [1, 2, 3].map((n) => ({
      label: `${n} × ${n} хүрд`,
      inputs: [String(n)],
      expected: Array.from({ length: n }, (_, i) =>
        Array.from(
          { length: n },
          (_, j) => `${i + 1} x ${j + 1} = ${(i + 1) * (j + 1)}`,
        ).join("\n"),
      ).join("\n"),
    })),
  },
];

export const findExercise = (id: string) =>
  exercises.find((exercise) => exercise.id === id);
