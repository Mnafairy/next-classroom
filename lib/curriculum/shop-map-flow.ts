import type { FlowFrame, FlowLesson } from "../python/flow";
import { productSource, shopNumbers, shopProducts } from "./shop-map";

export type ShopMapMode = "map-numbers" | "map-products";

export function shopMapFlow(mode: ShopMapMode, count: number): FlowLesson {
  const products = mode === "map-products";
  const values = products
    ? shopProducts.slice(0, count).map((product) => ({
        input: `{ name: "${product.name}", … }`,
        result: `<li>${product.name} — ${product.price} ₮</li>`,
      }))
    : shopNumbers.slice(0, count).map((number) => ({
        input: String(number),
        result: String(number * 2),
      }));

  const code = products
    ? [
        "const products = [",
        ...shopProducts
          .slice(0, count)
          .map((product) => `  ${productSource(product)},`),
        "];",
        "const items = products.map((product) => (",
        "  <li key={product.id}>{product.name} — {product.price} ₮</li>",
        "));",
        "return <ul>{items}</ul>; // ShopPage компонент дотор",
      ]
    : [
        `const numbers = [${values.map(({ input }) => input).join(", ")}];`,
        "const doubled = numbers.map((number) => {",
        "  return number * 2;",
        "});",
        "console.log(doubled);",
      ];

  const mapLine = products ? count + 3 : 2;
  const variableName = products ? "product" : "number";
  const resultName = products ? "items" : "doubled";
  const output: string[] = [];
  const frames: FlowFrame[] = [
    {
      node: "start",
      line: mapLine,
      message: "map() үр дүн хадгалах шинэ массив бэлдэнэ.",
      variable: "—",
      condition: null,
      output: [],
    },
  ];
  values.forEach(({ input, result }, index) => {
    frames.push(
      {
        node: "next",
        line: mapLine,
        edge: index === 0 ? "start-next" : "back",
        message: `Тийм. ${index + 1} дэх элементийг ${variableName} параметрт өгнө.`,
        variable: input,
        condition: true,
        output: [...output],
      },
      {
        node: "callback",
        line: mapLine + 1,
        edge: "next-callback",
        message: `Arrow function ${result} утгыг буцаана.`,
        variable: input,
        condition: null,
        output: [...output],
      },
      {
        node: "save",
        line: mapLine + 1,
        edge: "callback-save",
        message: `Буцаасан утгыг шинэ массивын [${index}] байрлалд хадгална.`,
        variable: input,
        condition: null,
        output: [...output, result],
      },
    );
    output.push(result);
  });
  frames.push(
    {
      node: "next",
      line: mapLine,
      edge: values.length ? "back" : "start-next",
      message: "Үгүй. Дараагийн элемент байхгүй тул функц дахин дуудагдахгүй.",
      variable: "—",
      condition: false,
      output: [...output],
    },
    {
      node: "end",
      line: code.length,
      edge: "next-end",
      message: products
        ? `map() ${values.length} JSX элементтэй items массив буцаалаа. React түүнийг <ul> дотор дүрсэлнэ.`
        : `map() [${output.join(", ")}] массивыг буцааж, console.log(${resultName}) хэвлэнэ.`,
      variable: "—",
      condition: null,
      output: output.length ? output : ["[]"],
    },
  );

  return {
    title: products
      ? "Бараа бүрийг JSX мөр болгох"
      : "Тоо бүрийг хоёр дахин өсгөх",
    variableName,
    height: 400,
    code,
    frames,
    nodes: [
      {
        id: "start",
        x: 255,
        y: 34,
        w: 200,
        h: 42,
        shape: "terminal",
        label: ["map() эхэлнэ"],
      },
      {
        id: "next",
        x: 255,
        y: 133,
        w: 230,
        h: 100,
        shape: "decision",
        label: ["Дараагийн элемент", "байна уу?"],
      },
      {
        id: "callback",
        x: 255,
        y: 245,
        w: 228,
        h: 53,
        shape: "process",
        label: [
          "Arrow function",
          products ? "<li> буцаана" : "number * 2 буцаана",
        ],
      },
      {
        id: "save",
        x: 255,
        y: 343,
        w: 228,
        h: 55,
        shape: "process",
        label: ["Үр дүнг шинэ", "массивд хадгална"],
      },
      {
        id: "end",
        x: 80,
        y: 230,
        w: 133,
        h: 62,
        shape: "terminal",
        label: ["Шинэ массив", "буцаана"],
      },
    ],
    edges: [
      { id: "start-next", path: "M255 55 V83" },
      {
        id: "next-callback",
        path: "M255 183 V218.5",
        label: "Тийм",
        x: 287,
        y: 203,
      },
      { id: "callback-save", path: "M255 271.5 V315.5" },
      { id: "back", path: "M369 343 H458 V133 H370" },
      {
        id: "next-end",
        path: "M140 133 H80 V199",
        label: "Үгүй",
        x: 56,
        y: 172,
      },
    ],
  };
}
