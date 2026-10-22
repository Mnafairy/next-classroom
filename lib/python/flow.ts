export type FlowMode = "if" | "for" | "while";
export type FlowNode = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  shape: "terminal" | "process" | "decision" | "output";
  label: string[];
};
export type FlowEdge = {
  id: string;
  path: string;
  label?: string;
  x?: number;
  y?: number;
  branch?: boolean;
};
export type FlowFrame = {
  node: string;
  line: number;
  edge?: string;
  message: string;
  variable: string;
  condition: boolean | null;
  output: string[];
};
export type FlowLesson = {
  title: string;
  code: string[];
  nodes: FlowNode[];
  edges: FlowEdge[];
  frames: FlowFrame[];
  height: number;
  variableName: string;
};

export const isFlowMode = (value?: string): value is FlowMode =>
  value === "if" || value === "for" || value === "while";

export function makeFlow(mode: FlowMode, value: number): FlowLesson {
  return mode === "if" ? makeIf(value) : makeLoop(mode, value);
}

function makeIf(battery: number): FlowLesson {
  const condition = battery <= 20;
  const output = condition ? "Цэнэглээрэй" : "Хангалттай";
  const frames: FlowFrame[] = [
    {
      node: "start",
      line: 0,
      message: "Программ эхэллээ. Дараагийн алхмыг таагаарай.",
      variable: "—",
      condition: null,
      output: [],
    },
    {
      node: "init",
      line: 1,
      edge: "start-init",
      message: `battery хувьсагчид ${battery} гэсэн утга хадгаллаа.`,
      variable: String(battery),
      condition: null,
      output: [],
    },
    {
      node: "condition",
      line: 2,
      edge: "init-condition",
      message: `${battery} <= 20 → ${condition ? "True. Тийм салаа руу орно." : "False. Үгүй салаа руу орно."}`,
      variable: String(battery),
      condition,
      output: [],
    },
  ];
  if (!condition)
    frames.push({
      node: "condition",
      line: 4,
      message:
        "if нөхцөл худал тул else салааг сонголоо. if доторх print ажиллахгүй.",
      variable: String(battery),
      condition,
      output: [],
    });
  frames.push(
    {
      node: condition ? "yes" : "no",
      line: condition ? 3 : 5,
      edge: condition ? "condition-yes" : "condition-no",
      message: `Зөвхөн сонгогдсон салааны print ажиллана: «${output}». Нөгөө салааг алгасана.`,
      variable: String(battery),
      condition,
      output: [output],
    },
    {
      node: "after",
      line: 6,
      edge: condition ? "yes-after" : "no-after",
      message:
        "Догол мөрөөс гарлаа. Салааны дараах энэ мөр аль ч тохиолдолд ажиллана.",
      variable: String(battery),
      condition,
      output: [output, "Шалгаж дууслаа"],
    },
    {
      node: "end",
      line: 0,
      edge: "after-end",
      message: "Программ дууслаа. Өөр утга сонгоод нөгөө салааг туршаарай.",
      variable: String(battery),
      condition,
      output: [output, "Шалгаж дууслаа"],
    },
  );
  return {
    title: "if / else — аль замаар явах вэ?",
    variableName: "battery",
    height: 560,
    code: [
      `battery = ${battery}`,
      "if battery <= 20:",
      '    print("Цэнэглээрэй")',
      "else:",
      '    print("Хангалттай")',
      'print("Шалгаж дууслаа")',
    ],
    nodes: [
      {
        id: "start",
        x: 260,
        y: 30,
        w: 112,
        h: 38,
        shape: "terminal",
        label: ["Эхлэх"],
      },
      {
        id: "init",
        x: 260,
        y: 105,
        w: 184,
        h: 46,
        shape: "process",
        label: [`battery = ${battery}`],
      },
      {
        id: "condition",
        x: 260,
        y: 215,
        w: 240,
        h: 104,
        shape: "decision",
        label: ["battery <= 20 ?"],
      },
      {
        id: "yes",
        x: 126,
        y: 340,
        w: 204,
        h: 58,
        shape: "output",
        label: ["print(", '"Цэнэглээрэй")'],
      },
      {
        id: "no",
        x: 394,
        y: 340,
        w: 204,
        h: 58,
        shape: "output",
        label: ["print(", '"Хангалттай")'],
      },
      {
        id: "after",
        x: 260,
        y: 445,
        w: 232,
        h: 54,
        shape: "output",
        label: ['print("Шалгаж дууслаа")'],
      },
      {
        id: "end",
        x: 260,
        y: 525,
        w: 112,
        h: 38,
        shape: "terminal",
        label: ["Дуусах"],
      },
    ],
    edges: [
      { id: "start-init", path: "M260 49 V82" },
      { id: "init-condition", path: "M260 128 V163" },
      {
        id: "condition-yes",
        path: "M140 215 H126 V311",
        label: "Тийм · True",
        x: 80,
        y: 265,
        branch: true,
      },
      {
        id: "condition-no",
        path: "M380 215 H394 V311",
        label: "Үгүй · False",
        x: 445,
        y: 265,
        branch: false,
      },
      { id: "yes-after", path: "M126 369 V445 H144" },
      { id: "no-after", path: "M394 369 V445 H376" },
      { id: "after-end", path: "M260 472 V506" },
    ],
    frames,
  };
}

function makeLoop(mode: "for" | "while", n: number): FlowLesson {
  const isWhile = mode === "while";
  const frames: FlowFrame[] = [
    {
      node: "start",
      line: 0,
      message: "Программ эхэллээ. Давталт хэдэн удаа ажиллахыг таагаарай.",
      variable: "—",
      condition: null,
      output: [],
    },
    {
      node: "init",
      line: 1,
      edge: "start-init",
      message: `n = ${n}. ${isWhile ? "Эхлээд тоолуураа бэлдэнэ." : `range(1, ${n + 1}) нь 1-ээс ${n} хүртэлх утгууд өгнө.`}`,
      variable: "—",
      condition: null,
      output: [],
    },
  ];
  if (isWhile)
    frames.push({
      node: "init",
      line: 2,
      message: "i = 1. Тоолуурыг давталтын өмнө нэг удаа эхлүүлнэ.",
      variable: "1",
      condition: null,
      output: [],
    });
  const output: string[] = [];
  for (let i = 1; i <= n; i++) {
    frames.push(
      {
        node: "condition",
        line: isWhile ? 3 : 2,
        edge: i === 1 ? "init-condition" : "back",
        message: isWhile
          ? `${i} <= ${n} → True. Давталтын бие рүү орно.`
          : `Дараагийн утга ${i} байна. i = ${i} болоод давталтын бие рүү орно.`,
        variable: String(i),
        condition: true,
        output: [...output],
      },
      {
        node: "body",
        line: isWhile ? 4 : 3,
        edge: "condition-body",
        message: `print(i) ажиллаж ${i}-ийг хэвлэлээ. ${i} / ${n} дахь давталт.`,
        variable: String(i),
        condition: true,
        output: [...output, String(i)],
      },
    );
    output.push(String(i));
    if (isWhile)
      frames.push({
        node: "increment",
        line: 5,
        edge: "body-increment",
        message: `i += 1 → ${i} + 1 = ${i + 1}. Одоо нөхцөлийг дахин шалгана.`,
        variable: String(i + 1),
        condition: null,
        output: [...output],
      });
  }
  frames.push(
    {
      node: "condition",
      line: isWhile ? 3 : 2,
      edge: n > 0 ? "back" : "init-condition",
      message: isWhile
        ? `${n + 1} <= ${n} → False. Давталтаас гарна.`
        : `range-ийн бүх утгыг ашиглалаа. Дараагийн утга байхгүй тул давталтаас гарна. i нь ${n > 0 ? n : "утгагүй"} хэвээр.`,
      variable: isWhile ? String(n + 1) : n > 0 ? String(n) : "—",
      condition: false,
      output: [...output],
    },
    {
      node: "after",
      line: isWhile ? 6 : 4,
      edge: "condition-after",
      message: 'Давталтын гаднах print("Дууслаа") нэг удаа ажиллана.',
      variable: isWhile ? String(n + 1) : n > 0 ? String(n) : "—",
      condition: false,
      output: [...output, "Дууслаа"],
    },
    {
      node: "end",
      line: 0,
      edge: "after-end",
      message: `Программ дууслаа. print(i) нийт ${n} удаа, нөхцөл / дараагийн утгын шалгалт ${n + 1} удаа хийгдлээ.`,
      variable: isWhile ? String(n + 1) : n > 0 ? String(n) : "—",
      condition: false,
      output: [...output, "Дууслаа"],
    },
  );
  const afterY = isWhile ? 505 : 425;
  return {
    title: isWhile
      ? "while — нөхцөл үнэн байх хугацаанд"
      : "for — утга бүрээр нэг алхам",
    variableName: "i",
    height: isWhile ? 625 : 545,
    code: isWhile
      ? [
          `n = ${n}`,
          "i = 1",
          "while i <= n:",
          "    print(i)",
          "    i += 1",
          'print("Дууслаа")',
        ]
      : [
          `n = ${n}`,
          "for i in range(1, n + 1):",
          "    print(i)",
          'print("Дууслаа")',
        ],
    nodes: [
      {
        id: "start",
        x: 260,
        y: 30,
        w: 112,
        h: 38,
        shape: "terminal",
        label: ["Эхлэх"],
      },
      {
        id: "init",
        x: 260,
        y: 105,
        w: 194,
        h: 50,
        shape: "process",
        label: isWhile
          ? [`n = ${n}`, "i = 1"]
          : [`n = ${n}`, `range(1, ${n + 1})`],
      },
      {
        id: "condition",
        x: 260,
        y: 215,
        w: 246,
        h: 104,
        shape: "decision",
        label: isWhile ? ["i <= n ?"] : ["Дараагийн утга", "байна уу?"],
      },
      {
        id: "body",
        x: 260,
        y: 325,
        w: 172,
        h: 50,
        shape: "output",
        label: ["print(i)"],
      },
      ...(isWhile
        ? [
            {
              id: "increment",
              x: 260,
              y: 415,
              w: 172,
              h: 48,
              shape: "process" as const,
              label: ["i += 1"],
            },
          ]
        : []),
      {
        id: "after",
        x: 260,
        y: afterY,
        w: 194,
        h: 50,
        shape: "output",
        label: ['print("Дууслаа")'],
      },
      {
        id: "end",
        x: 260,
        y: afterY + 82,
        w: 112,
        h: 38,
        shape: "terminal",
        label: ["Дуусах"],
      },
    ],
    edges: [
      { id: "start-init", path: "M260 49 V80" },
      { id: "init-condition", path: "M260 130 V163" },
      {
        id: "condition-body",
        path: "M260 267 V300",
        label: "Тийм · True",
        x: 317,
        y: 289,
        branch: true,
      },
      ...(isWhile ? [{ id: "body-increment", path: "M260 350 V391" }] : []),
      {
        id: "back",
        path: isWhile ? "M346 415 H445 V215 H383" : "M346 325 H445 V215 H383",
        label: isWhile ? "дахин шалгах" : "дараагийн утга",
        x: 442,
        y: isWhile ? 470 : 380,
      },
      {
        id: "condition-after",
        path: `M137 215 H67 V${afterY} H163`,
        label: "Үгүй · False",
        x: 68,
        y: 286,
        branch: false,
      },
      { id: "after-end", path: `M260 ${afterY + 25} V${afterY + 63}` },
    ],
    frames,
  };
}
