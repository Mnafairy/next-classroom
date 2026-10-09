import type { Exercise, Files, Module } from "./types";

export const BUTTON = "/app/components/Button.tsx";
export const CARD = "/app/components/Card.tsx";
export const PAGE = "/app/page.tsx";
export const COMMANDS = "/terminal.sh";
export const modules: Module[] = [
  {
    title: "Get set up",
    subtitle: "Your Mac, ready to build",
    icon: "terminal",
  },
  { title: "Meet Next.js", subtitle: "The bigger picture", icon: "layers" },
  {
    title: "Build a component",
    subtitle: "Small pieces, real interfaces",
    icon: "component",
  },
  {
    title: "Use props",
    subtitle: "One component, many possibilities",
    icon: "sliders",
  },
  {
    title: "Build a Card",
    subtitle: "Combine components and pass props",
    icon: "component",
  },
  {
    title: "Handle clicks",
    subtitle: "Pass functions as props",
    icon: "component",
  },
  {
    title: "Remember with state",
    subtitle: "Counters and independent Likes",
    icon: "sliders",
  },
];

const page = (jsx: string) =>
  `import Button from "./components/Button";\n\nexport default function Home() {\n  return (\n    <main>\n      ${jsx}\n    </main>\n  );\n}\n`;
const simple = `export default function Button() {\n  return <button>Click me</button>;\n}\n`;
const purple = `export default function Button() {\n  return (\n    <button\n      style={{\n        backgroundColor: "#6D28D9",\n        color: "white",\n        padding: "12px 24px",\n        border: "none",\n        borderRadius: "8px",\n      }}\n    >\n      Click me\n    </button>\n  );\n}\n`;
const labelButton = `export default function Button({ label }) {\n  return <button>{label}</button>;\n}\n`;
export const colorButton = `export default function Button({ label, color }) {\n  return (\n    <button\n      style={{\n        backgroundColor: color,\n        color: "white",\n        padding: "12px 24px",\n        border: "none",\n        borderRadius: "8px",\n      }}\n    >\n      {label}\n    </button>\n  );\n}\n`;
const files = (button: string, jsx = "<Button />"): Files => ({
  [BUTTON]: button,
  [PAGE]: page(jsx),
});
const commandSolution = `node --version\nnpm --version\nnpx create-next-app@latest my-first-app\ncd my-first-app\ncode .\nnpm run dev`;

const staticCard = `import Button from "./Button";

export default function Card() {
  return (
    <article style={{
      border: "1px solid #d1d5db",
      borderRadius: "12px",
      padding: "24px",
      width: "280px",
    }}>
      <h2>React basics</h2>
      <p>Build your first component.</p>
      <Button label="Start lesson" color="blue" />
    </article>
  );
}
`;
export const propsCard = staticCard
  .replace("Card()", "Card({ title, description, buttonLabel, color })")
  .replace("<h2>React basics</h2>", "<h2>{title}</h2>")
  .replace("<p>Build your first component.</p>", "<p>{description}</p>")
  .replace(
    'label="Start lesson" color="blue"',
    "label={buttonLabel} color={color}",
  );
const cardPage = (jsx: string) => page(jsx).replaceAll("Button", "Card");
const cardFiles = (card: string, jsx = "<Card />"): Files => ({
  [CARD]: card,
  [BUTTON]: colorButton,
  [PAGE]: cardPage(jsx),
});
const firstCard = {
  title: "React basics",
  description: "Build your first component.",
  buttonLabel: "Start lesson",
  color: "blue",
};
const firstCardJsx = `<Card
        title="React basics"
        description="Build your first component."
        buttonLabel="Start lesson"
        color="blue"
      />`;
const secondCardJsx = `<Card
        title="Next.js pages"
        description="Create your first page."
        buttonLabel="Open lesson"
        color="green"
      />`;

const eventButton = colorButton
  .replace("{ label, color }", "{ label, color, onClick }")
  .replace("<button\n", "<button\n      onClick={onClick}\n");
const clickButton =
  '"use client";\n\n' +
  colorButton
    .replace(
      "  return (",
      '  function handleClick() {\n    alert("Button clicked!");\n  }\n\n  return (',
    )
    .replace("<button\n", "<button\n      onClick={handleClick}\n");
const eventCard = propsCard
  .replace("buttonLabel, color }", "buttonLabel, color, onClick }")
  .replace(
    "<Button label={buttonLabel} color={color} />",
    `<Button
        label={buttonLabel}
        color={color}
        onClick={onClick}
      />`,
  );
const clickCardPage = `"use client";

import Card from "./components/Card";

export default function Home() {
  function handleOpen(title) {
    alert("Opening " + title);
  }

  return (
    <main>
      ${firstCardJsx.replace('color="blue"', 'color="blue"\n        onClick={() => handleOpen("React basics")}')}
    </main>
  );
}
`;
const twoClickCards = clickCardPage.replace(
  "    </main>",
  "      " +
    secondCardJsx.replace(
      'color="green"',
      'color="green"\n        onClick={() => handleOpen("Next.js pages")}',
    ) +
    "\n    </main>",
);
const eventFiles = (
  card = eventCard,
  button = eventButton,
  home = clickCardPage,
): Files => ({
  [CARD]: card,
  [BUTTON]: button,
  [PAGE]: home,
});
const counterPage = `"use client";

import { useState } from "react";
import Button from "./components/Button";

export default function Home() {
  const [count, setCount] = useState(0);

  function handleIncrease() {
    setCount(count + 1);
  }

  return (
    <main>
      <section>
        <p>Count: {count}</p>
        <Button
          label="Increase"
          color="blue"
          onClick={handleIncrease}
        />
      </section>
    </main>
  );
}
`;
const resetCounterPage = counterPage
  .replace(
    "  return (",
    "  function handleReset() {\n    setCount(0);\n  }\n\n  return (",
  )
  .replace(
    "      </section>",
    '        <Button\n          label="Reset"\n          color="red"\n          onClick={handleReset}\n        />\n      </section>',
  );
const counterFiles = (home: string): Files => ({
  [BUTTON]: eventButton,
  [PAGE]: home,
});
const likeCard =
  '"use client";\n\nimport { useState } from "react";\n' +
  propsCard
    .replace(
      "  return (",
      "  const [likes, setLikes] = useState(0);\n\n  function handleLike() {\n    setLikes(likes + 1);\n  }\n\n  return (",
    )
    .replace(
      "<Button label={buttonLabel} color={color} />",
      '<Button\n        label={"Likes: " + likes}\n        color={color}\n        onClick={handleLike}\n      />',
    )
    .replace("description, buttonLabel, color", "description, color");
const likeCardsPage = cardPage(
  firstCardJsx + "\n      " + secondCardJsx,
).replace(/\s+buttonLabel="[^"]+"/g, "");
const likeFiles = (card: string): Files => ({
  [CARD]: card,
  [BUTTON]: eventButton,
  [PAGE]: likeCardsPage,
});

export const exercises: Exercise[] = [
  {
    id: "setup",
    module: 0,
    shortTitle: "Your development toolkit",
    title: "Set up your development tools",
    duration: "6 min",
    eyebrow: "01 / THE SETUP",
    kind: "quiz",
    starter: {},
    solution: {},
    paragraphs: [
      "A browser shows your website. VS Code is where you write it. Terminal runs the commands that create your project and start it on your Mac.",
      "First install Node.js LTS and Visual Studio Code using the official links below. Node includes npm, the package manager you will use to install and run your project.",
    ],
    concept: {
      title: "Three tools. Three different jobs.",
      body: "VS Code → write files. Terminal + Node.js → run your project. Browser → see the result.",
    },
    example: "node --version\nnpm --version",
    exampleFile: "Terminal",
    task: "Check your toolkit. Choose the right tool for each job, then complete the real setup checklist on your Mac.",
    questions: [
      {
        id: "runtime",
        prompt: "What makes JavaScript run outside the browser?",
        choices: ["VS Code", "Node.js", "Finder"],
        answer: "Node.js",
        explanation:
          "Node.js runs JavaScript on your computer. npm is installed alongside it.",
      },
      {
        id: "editor",
        prompt: "Where do you edit page.tsx?",
        choices: ["VS Code", "Safari's address bar", "The Node installer"],
        answer: "VS Code",
        explanation:
          "VS Code is your code editor. Open the entire project folder there.",
      },
    ],
    checklist: [
      "Install Node.js LTS from nodejs.org and VS Code from code.visualstudio.com.",
      "Open Terminal and run node --version and npm --version. Next.js requires Node 20.9 or newer.",
      "In VS Code, press ⌘⇧P and run Shell Command: Install 'code' command in PATH. Restart Terminal.",
    ],
    hints: [
      "An editor changes files; a runtime executes JavaScript.",
      "Node.js is the runtime. VS Code is the editor.",
    ],
  },
  {
    id: "commands",
    module: 0,
    shortTitle: "Create & open your project",
    title: "Create and run your first app",
    duration: "8 min",
    eyebrow: "01 / THE SETUP",
    kind: "commands",
    paragraphs: [
      "create-next-app creates the project folder and installs its dependencies. Run these commands in order in a location where you keep school projects.",
      "When asked, choose TypeScript, ESLint, Tailwind CSS, and App Router. Choose No for the src/ directory so your files match our examples. Keep the default import alias. You can keep the remaining defaults.",
    ],
    concept: {
      title: "Open the folder, not just one file.",
      body: "cd my-first-app moves Terminal into your project. code . opens that same folder in VS Code. The dot means “the current folder.”",
    },
    example: commandSolution,
    exampleFile: "Terminal",
    task: "Fill the four command gaps. Check your answer, then run the complete commands in your Mac's Terminal.",
    starter: {
      [COMMANDS]:
        "node --version\nnpm --version\n__CREATE__ create-next-app@latest my-first-app\n__CD__ my-first-app\n__CODE__ .\nnpm run __DEV__",
    },
    solution: { [COMMANDS]: commandSolution },
    blanks: [
      {
        token: "__CREATE__",
        label: "Project creation command",
        answer: "npx",
        width: 6,
      },
      {
        token: "__CD__",
        label: "Change directory command",
        answer: "cd",
        width: 5,
      },
      {
        token: "__CODE__",
        label: "Open VS Code command",
        answer: "code",
        width: 7,
      },
      {
        token: "__DEV__",
        label: "Development script",
        answer: "dev",
        width: 6,
      },
    ],
    checklist: [
      "Visit http://localhost:3000 after the server starts; use the port Terminal prints if 3000 is busy.",
      "Edit app/page.tsx in VS Code, save, and watch the browser refresh.",
      "Stop the development server with Control-C. Restart it with npm run dev.",
      "If code is not found, install its PATH command in VS Code. If node is not found, install Node and reopen Terminal.",
    ],
    hints: [
      "npx runs create-next-app. npm run starts a script from package.json.",
      "The four missing words are npx, cd, code, and dev.",
    ],
  },
  {
    id: "what-is-next",
    module: 1,
    shortTitle: "React + a framework",
    title: "React builds the pieces. Next.js brings them together.",
    duration: "5 min",
    eyebrow: "02 / THE BIGGER PICTURE",
    kind: "quiz",
    starter: {},
    solution: {},
    paragraphs: [
      "React is a library for building interfaces from components. Next.js is a framework built on React: it gives your application a place for pages, routing, server rendering, and more.",
      "File-based routes make pages easier to organize. Server rendering can deliver useful HTML before browser JavaScript finishes loading. Built-in image and font tools help you manage those assets. Good performance and discoverability still depend on how you build the app.",
    ],
    concept: {
      title: "Your Button is React. Your app is Next.js.",
      body: "A component describes a piece of UI. The framework connects those pieces into an application with pages and routes.",
    },
    example:
      "React\n  ↳ components, JSX, props\n\nNext.js\n  ↳ React + pages, routes, server rendering",
    exampleFile: "The relationship",
    task: "Connect each feature to the tool that provides it.",
    questions: [
      {
        id: "components",
        prompt: "Components, JSX, and props come from…",
        choices: ["React", "Finder", "npm"],
        answer: "React",
        explanation:
          "Next.js uses React components; it does not replace React.",
      },
      {
        id: "routing",
        prompt: "Which tool organizes routes using app/page.tsx files?",
        choices: ["VS Code", "Next.js", "CSS"],
        answer: "Next.js",
        explanation:
          "The Next.js App Router maps your app folders and page files to URLs.",
      },
    ],
    hints: [
      "Think of React as the UI building blocks and Next.js as the application framework.",
    ],
  },
  {
    id: "file-map",
    module: 1,
    shortTitle: "Find your way around",
    title: "Find your project files",
    duration: "4 min",
    eyebrow: "02 / THE BIGGER PICTURE",
    kind: "quiz",
    starter: {},
    solution: {},
    paragraphs: [
      "app/page.tsx defines the page at /. app/layout.tsx provides its shared outer structure, including the document's html and body. globals.css contains shared styles.",
      "A components folder is a convention for reusable pieces, not a special Next.js route. We will create app/components/Button.tsx and import it into our page.",
    ],
    concept: {
      title: "Folders help you find things.",
      body: "Next.js recognizes page.tsx and layout.tsx. You choose where to organize ordinary component files.",
    },
    example:
      "app/\n├── components/\n│   └── Button.tsx\n├── globals.css\n├── layout.tsx\n└── page.tsx",
    exampleFile: "Your project",
    task: "Choose the correct file for each job.",
    questions: [
      {
        id: "home",
        prompt: "Which file defines the home page at /?",
        choices: ["app/page.tsx", "app/components/Button.tsx", "package.json"],
        answer: "app/page.tsx",
        explanation: "A page.tsx file makes its route accessible.",
      },
      {
        id: "layout",
        prompt: "Where does the shared html/body structure belong?",
        choices: ["app/globals.css", "app/layout.tsx", "node_modules"],
        answer: "app/layout.tsx",
        explanation:
          "The root layout wraps your pages in the document structure.",
      },
      {
        id: "button",
        prompt: "Where will our reusable Button live?",
        choices: [
          ".next/Button.tsx",
          "app/components/Button.tsx",
          "public/page.tsx",
        ],
        answer: "app/components/Button.tsx",
        explanation:
          "Keep your source in app/components, not the generated .next folder.",
      },
    ],
    hints: [
      "page is the page, layout is the shared wrapper, and components stores reusable UI.",
    ],
  },
  {
    id: "first-component",
    module: 2,
    shortTitle: "Your first Button",
    title: "Create a Button component",
    duration: "6 min",
    eyebrow: "03 / BUILDING BLOCKS",
    kind: "code",
    starter: files(
      simple
        .replace("export default", "__EXPORT__ __DEFAULT__")
        .replace("return", "__RETURN__"),
    ),
    solution: files(simple),
    paragraphs: [
      "You already know that a JavaScript function can return a value. A React component returns a description of UI, written in JSX. Here, our Button function returns a button element.",
      "Component names start with a capital letter. export default lets another file import this component. The .tsx extension lets us use TypeScript and JSX together.",
    ],
    concept: {
      title: "A component is a reusable piece of your interface.",
      body: "Button() describes the UI. <Button /> asks React to display it. The lowercase <button> is the browser's built-in HTML element.",
    },
    example: simple,
    exampleFile: "app/components/Button.tsx",
    task: "Complete the default export and return statement. Run your code to see your first button on the right.",
    blanks: [
      {
        token: "__EXPORT__",
        label: "Export keyword",
        answer: "export",
        width: 8,
      },
      {
        token: "__DEFAULT__",
        label: "Default export keyword",
        answer: "default",
        width: 9,
      },
      {
        token: "__RETURN__",
        label: "Return keyword",
        answer: "return",
        width: 8,
      },
    ],
    expected: [{ label: "Click me", color: "" }],
    hints: [
      "The declaration starts with export default function Button().",
      "A function sends its JSX back using return.",
    ],
  },
  {
    id: "inline-style",
    module: 2,
    shortTitle: "Style your button",
    title: "Style your Button",
    duration: "6 min",
    eyebrow: "03 / BUILDING BLOCKS",
    kind: "code",
    starter: files(
      purple
        .replace('"#6D28D9"', "__BACKGROUND__")
        .replace('"white"', "__TEXT__")
        .replace('"12px 24px"', "__PADDING__"),
    ),
    solution: files(purple),
    styled: true,
    paragraphs: [
      "In JSX, style takes a JavaScript object. The outer braces enter JavaScript; the inner braces create the object. CSS property names use camelCase: background-color becomes backgroundColor.",
      "String values such as colors and spacing need quotes. We will keep the text white and use padding to give the label room.",
    ],
    concept: {
      title: "Two braces, two jobs.",
      body: 'style={{ backgroundColor: "#6D28D9" }} means: enter JavaScript, then pass an object containing a CSS property.',
    },
    example: purple,
    exampleFile: "app/components/Button.tsx",
    task: 'Fill the style values: "#6D28D9" for the background, "white" for the text, and "12px 24px" for padding. Include quotes.',
    blanks: [
      {
        token: "__BACKGROUND__",
        label: "Purple background value",
        answer: '"#6D28D9"',
        width: 13,
      },
      {
        token: "__TEXT__",
        label: "Text color value",
        answer: '"white"',
        width: 10,
      },
      {
        token: "__PADDING__",
        label: "Padding value",
        answer: '"12px 24px"',
        width: 14,
      },
    ],
    expected: [{ label: "Click me", color: "#6D28D9" }],
    hints: [
      "Each missing value is a JavaScript string, so wrap it in quotes.",
      "Use backgroundColor, not background-color, inside the style object.",
    ],
  },
  {
    id: "import-component",
    module: 2,
    shortTitle: "Bring it into your page",
    title: "Import and render your component",
    duration: "5 min",
    eyebrow: "03 / BUILDING BLOCKS",
    kind: "code",
    starter: {
      [BUTTON]: purple,
      [PAGE]: page("<Button />")
        .replace(
          'import Button from "./components/Button";',
          '__IMPORT__ Button from "__PATH__";',
        )
        .replace("<Button />", "<__COMPONENT__ />"),
    },
    solution: files(purple),
    styled: true,
    paragraphs: [
      "Button.tsx exports the component. page.tsx imports it and uses <Button /> in its returned JSX. The import path is relative to the file doing the importing.",
      "From app/page.tsx, ./components/Button means: start in app, go into components, and find Button.tsx. You do not need to include the .tsx extension.",
    ],
    concept: {
      title: "Export → import → render.",
      body: 'export default makes the component available. import Button from "./components/Button" brings it in. <Button /> renders an instance.',
    },
    example: page("<Button />"),
    exampleFile: "app/page.tsx",
    task: "Switch to page.tsx. Complete the import, relative file path, and component name.",
    blanks: [
      {
        token: "__IMPORT__",
        label: "Import keyword",
        answer: "import",
        width: 8,
      },
      {
        token: "__PATH__",
        label: "Button import path",
        answer: "./components/Button",
        width: 23,
      },
      {
        token: "__COMPONENT__",
        label: "Component name",
        answer: "Button",
        width: 8,
      },
    ],
    expected: [{ label: "Click me", color: "#6D28D9" }],
    hints: [
      "The path starts with ./ because components is next to page.tsx.",
      "Use Button with a capital B in both the import and JSX.",
    ],
  },
  {
    id: "reuse-component",
    module: 2,
    shortTitle: "Reuse the same component",
    title: "One definition. Three instances.",
    duration: "5 min",
    eyebrow: "03 / BUILDING BLOCKS",
    kind: "code",
    starter: files(
      purple,
      "<Button />\n      {/* Add two more Button instances here. */}",
    ),
    solution: files(purple, "<Button />\n      <Button />\n      <Button />"),
    styled: true,
    paragraphs: [
      "A component is a definition, not a single object on the page. Each time you write <Button />, React renders another instance using the same definition.",
      "Change the shared Button style and every instance uses the new style. This is why reusable components help keep an interface consistent.",
    ],
    concept: {
      title: "Reuse the component, not a copy of its code.",
      body: "Three <Button /> instances all use one Button.tsx definition. You maintain that definition in one place.",
    },
    example: page("<Button />\n      <Button />\n      <Button />"),
    exampleFile: "app/page.tsx",
    task: "Edit page.tsx so it renders exactly three Button instances. Keep their labels and purple styles.",
    expected: Array.from({ length: 3 }, () => ({
      label: "Click me",
      color: "#6D28D9",
    })),
    hints: [
      "Add two more <Button /> lines inside main.",
      "All three components must be inside the same returned parent element.",
    ],
  },
  {
    id: "read-props",
    module: 3,
    shortTitle: "Read your first prop",
    title: "Read the label prop",
    duration: "6 min",
    eyebrow: "04 / PROPS IN PRACTICE",
    kind: "code",
    starter: files(
      labelButton.replace("{label}", "{__LABEL__}"),
      '<Button label="Hello, Next.js!" />',
    ),
    solution: files(labelButton, '<Button label="Hello, Next.js!" />'),
    props: "label",
    paragraphs: [
      'Props are inputs to a component, like arguments to a function. Writing <Button label="Hello, Next.js!" /> passes an object containing a label value to Button.',
      "Destructuring reads that property: function Button({ label }). This is the same JavaScript object destructuring you already know. Inside JSX, {label} displays its value.",
    ],
    concept: {
      title: "JavaScript inputs, expressed in JSX.",
      body: '<Button label="Hello" /> passes { label: "Hello" }. You can read it as props.label or destructure it into label.',
    },
    example: labelButton,
    exampleFile: "app/components/Button.tsx",
    task: "Use the label prop between the button tags. The preview must display the value passed from page.tsx.",
    blanks: [
      {
        token: "__LABEL__",
        label: "Label prop expression",
        answer: "label",
        width: 9,
      },
    ],
    expected: [{ label: "Hello, Next.js!", color: "" }],
    hints: [
      "Braces in JSX display a JavaScript value.",
      'Write {label}, not the string "label".',
    ],
  },
  {
    id: "pass-labels",
    module: 3,
    shortTitle: "Pass different labels",
    title: "Pass different labels",
    duration: "5 min",
    eyebrow: "04 / PROPS IN PRACTICE",
    kind: "code",
    starter: files(
      labelButton,
      '<Button label="Change me" />\n      <Button label="Change me too" />',
    ),
    solution: files(
      labelButton,
      '<Button label="Save" />\n      <Button label="Cancel" />',
    ),
    props: "label",
    paragraphs: [
      "Each component instance receives its own props. One Button can say Save while another says Cancel, even though both use the same Button.tsx file.",
      'Pass strings with quotes: label="Save". Use braces for a JavaScript expression: label={buttonText}. Props describe the instance; the child reads them without changing them.',
    ],
    concept: {
      title: "The parent chooses. The child displays.",
      body: "page.tsx supplies a label for each instance. Button.tsx decides how that label appears.",
    },
    example: page('<Button label="Save" />\n      <Button label="Cancel" />'),
    exampleFile: "app/page.tsx",
    task: 'Change the first label to "Save" and the second to "Cancel" in page.tsx. Keep Button reusable.',
    expected: [
      { label: "Save", color: "" },
      { label: "Cancel", color: "" },
    ],
    hints: [
      "Edit each instance's label prop in page.tsx.",
      "Keep {label} inside Button; hard-coding Save would make both buttons identical.",
    ],
  },
  {
    id: "color-props",
    module: 3,
    shortTitle: "Blue & red with inline style",
    title: "Set button colors with props",
    duration: "8 min",
    eyebrow: "04 / PROPS IN PRACTICE",
    kind: "code",
    starter: files(
      colorButton.replace(
        "backgroundColor: color",
        'backgroundColor: "#6D28D9"',
      ),
      '<Button label="Blue button" color="purple" />\n      <Button label="Red button" color="purple" />',
    ),
    solution: files(
      colorButton,
      '<Button label="Blue button" color="blue" />\n      <Button label="Red button" color="red" />',
    ),
    props: "color",
    styled: true,
    paragraphs: [
      'Props can change a component\'s style as well as its text. Pass color="blue" and color="red" from your page, then use that value in the Button\'s style object.',
      'backgroundColor: color reads the variable. backgroundColor: "color" is a literal string. Keep color: "white" as the text color while the background comes from the prop.',
    ],
    concept: {
      title: "A color travels from the page to the style.",
      body: '<Button color="blue" /> → { color } → style={{ backgroundColor: color }} → a blue background.',
    },
    example: colorButton,
    exampleFile: "app/components/Button.tsx",
    task: 'In page.tsx, pass "blue" and "red" to the two buttons. In Button.tsx, replace the fixed purple background with the color prop. Keep white text and 12px 24px padding.',
    expected: [
      { label: "Blue button", color: "blue" },
      { label: "Red button", color: "red" },
    ],
    hints: [
      "There are changes in both files: two prop values in page.tsx and one style value in Button.tsx.",
      "Use backgroundColor: color without quotes around the variable.",
      "Read both inputs by destructuring them: function Button({ label, color }).",
    ],
  },
  {
    id: "button-lab",
    module: 3,
    shortTitle: "The final Button lab",
    title: "Build three buttons with props",
    duration: "10 min",
    eyebrow: "04 / YOUR FINAL LAB",
    kind: "code",
    starter: files(
      colorButton
        .replace("backgroundColor: color", 'backgroundColor: "gray"')
        .replace("{label}", "Build me"),
      '<Button label="Edit me" color="gray" />',
    ),
    solution: files(
      colorButton,
      '<Button label="Continue" color="blue" />\n      <Button label="Delete" color="red" />\n      <Button label="Learn more" color="#6D28D9" />',
    ),
    props: "color",
    styled: true,
    paragraphs: [
      "You have created a component, exported it, imported it, reused it, and customized it through props. Now use all of those skills in one small interface.",
      "Keep the Button reusable: read label and color from its inputs, then pass different values from each Button in your page.",
    ],
    concept: {
      title: "Combine label and color props",
      body: "One Button definition. Three instances. Three labels. Three background colors. Your page supplies the data; your component turns it into UI.",
    },
    example: page(
      '<Button label="Continue" color="blue" />\n      <Button label="Delete" color="red" />\n      <Button label="Learn more" color="#6D28D9" />',
    ),
    exampleFile: "app/page.tsx",
    task: "Render three buttons, in order: Continue (blue), Delete (red), and Learn more (#6D28D9). Use the label and color props in Button.tsx, with white text and 12px 24px padding.",
    expected: [
      { label: "Continue", color: "blue" },
      { label: "Delete", color: "red" },
      { label: "Learn more", color: "#6D28D9" },
    ],
    hints: [
      "First make Button display {label} and use backgroundColor: color.",
      "Then render three Button instances with different label and color values in page.tsx.",
      'Use a JavaScript parameter default such as color = "blue". Our lab passes every value explicitly.',
    ],
  },
  {
    id: "create-card",
    module: 4,
    shortTitle: "Put Button inside Card",
    title: "Build a Card with your Button",
    duration: "6 min",
    eyebrow: "05 / COMBINE COMPONENTS",
    kind: "code",
    activeFile: CARD,
    starter: cardFiles(
      staticCard
        .replace('"./Button"', '"__IMPORT__"')
        .replace("<Button label=", "<__COMPONENT__ label="),
    ),
    solution: cardFiles(staticCard),
    paragraphs: [
      "Create Card.tsx in app/components beside Button.tsx. A component can return ordinary HTML and other components together.",
      'Import Button from "./Button" because the files are in the same folder. Place Button inside the article and reuse the label and color props from Module 4.',
    ],
    concept: {
      title: "Components inside components",
      body: "page.tsx renders Card. Card renders the Button you already built.",
    },
    task: 'Complete the Button import and component name in Card.tsx. The card should show React basics, its description, and a blue "Start lesson" button.',
    example: staticCard,
    exampleFile: "app/components/Card.tsx",
    blanks: [
      {
        token: "__IMPORT__",
        label: "Button import path",
        answer: "./Button",
        width: 12,
      },
      {
        token: "__COMPONENT__",
        label: "Nested component name",
        answer: "Button",
        width: 10,
      },
    ],
    expected: [{ label: "Start lesson", color: "blue" }],
    expectedCards: [firstCard],
    props: "color",
    styled: true,
    hints: [
      'The import path is "./Button". Both components are in app/components.',
      "Use <Button /> inside the article. Keep the existing Button.tsx file.",
    ],
  },
  {
    id: "card-props",
    module: 4,
    shortTitle: "Send props to Card",
    title: "Pass props from the page to Card",
    duration: "8 min",
    eyebrow: "05 / PASS PROPS",
    kind: "code",
    activeFile: CARD,
    starter: cardFiles(
      propsCard
        .replace("{title}", "{__TITLE__}")
        .replace("{description}", "{__DESCRIPTION__}")
        .replace("{buttonLabel}", "{__LABEL__}")
        .replace("color={color}", "color={__COLOR__}"),
      firstCardJsx,
    ),
    solution: cardFiles(propsCard, firstCardJsx),
    paragraphs: [
      "Like Button, Card receives a JavaScript object of props. Read title, description, buttonLabel, and color with object destructuring.",
      "Card displays title and description, then forwards buttonLabel as Button's label prop and color as its color prop. Each component reads only the inputs it needs.",
    ],
    concept: {
      title: "Pass values through components",
      body: "Page → Card → Button. Card displays its text and passes the button's label and color onward.",
    },
    task: "Fill the four prop expressions in Card.tsx. Read the values sent from page.tsx and pass buttonLabel and color to Button.",
    example: propsCard,
    exampleFile: "app/components/Card.tsx",
    blanks: [
      {
        token: "__TITLE__",
        label: "Card title prop",
        answer: "title",
        width: 9,
      },
      {
        token: "__DESCRIPTION__",
        label: "Card description prop",
        answer: "description",
        width: 15,
      },
      {
        token: "__LABEL__",
        label: "Prop to pass as Button label",
        answer: "buttonLabel",
        width: 15,
      },
      {
        token: "__COLOR__",
        label: "Prop to pass as Button color",
        answer: "color",
        width: 9,
      },
    ],
    expected: [{ label: "Start lesson", color: "blue" }],
    expectedCards: [firstCard],
    cardProps: true,
    props: "color",
    styled: true,
    hints: [
      "Display {title} in h2 and {description} in p.",
      "Use label={buttonLabel} and color={color} on Button. The prop names can differ between components.",
    ],
  },
  {
    id: "card-lab",
    module: 4,
    shortTitle: "Reuse Card with new props",
    title: "Build two cards with different props",
    duration: "10 min",
    eyebrow: "05 / CARD PRACTICE",
    kind: "code",
    activeFile: PAGE,
    starter: cardFiles(propsCard, firstCardJsx),
    solution: cardFiles(propsCard, firstCardJsx + "\n      " + secondCardJsx),
    paragraphs: [
      "Reuse Card just as you reused Button. Each Card gets its own content and passes its own button props to the same Button component.",
      "Keep the components unchanged. Add another Card in page.tsx and choose its title, description, buttonLabel, and color.",
    ],
    concept: {
      title: "Reuse the whole card",
      body: "One Card component can display different content and buttons by receiving different props.",
    },
    task: 'Keep the React basics card. Add a second Card with title "Next.js pages", description "Create your first page.", buttonLabel "Open lesson", and color "green".',
    example: cardPage(firstCardJsx + "\n      " + secondCardJsx),
    exampleFile: "app/page.tsx",
    expected: [
      { label: "Start lesson", color: "blue" },
      { label: "Open lesson", color: "green" },
    ],
    expectedCards: [
      firstCard,
      {
        title: "Next.js pages",
        description: "Create your first page.",
        buttonLabel: "Open lesson",
        color: "green",
      },
    ],
    cardProps: true,
    props: "color",
    styled: true,
    hints: [
      "Add the second <Card /> inside main, after the first.",
      "Pass all four props to each Card. Card forwards buttonLabel and color to Button.",
    ],
  },
  {
    id: "handle-click",
    module: 5,
    shortTitle: "Handle your first click",
    title: "Make Button respond to a click",
    duration: "6 min",
    eyebrow: "06 / CLICK HANDLERS",
    kind: "code",
    activeFile: BUTTON,
    clientFile: BUTTON,
    starter: files(
      clickButton.replace("onClick={handleClick}", "onClick={__HANDLER__}"),
      '<Button label="Click me" color="blue" />',
    ),
    solution: files(clickButton, '<Button label="Click me" color="blue" />'),
    paragraphs: [
      "A React event handler is a JavaScript function. Pass handleClick to the button's onClick prop so React calls it when the user clicks.",
      'Use onClick={handleClick}, without parentheses. Writing handleClick() runs the function while rendering. In Next.js, put "use client" at the top of this interactive component, before imports. Its imported components belong to the same client tree.',
      "In this preview, alert messages appear below your component. In your own project, alert opens a browser dialog.",
    ],
    concept: {
      title: "Run a function on click",
      body: "onClick={handleClick} gives React a function to call when Button is clicked.",
    },
    task: 'Fill the handler expression in Button.tsx. Clicking Click me should show "Button clicked!", once per click and never before a click.',
    example: clickButton,
    exampleFile: "app/components/Button.tsx",
    blanks: [
      {
        token: "__HANDLER__",
        label: "Click handler function",
        answer: "handleClick",
        width: 15,
      },
    ],
    expected: [{ label: "Click me", color: "blue" }],
    props: "color",
    styled: true,
    interactions: [
      { button: 0, alerts: ["Button clicked!"] },
      { button: 0, alerts: ["Button clicked!"] },
    ],
    hints: [
      "Pass the function name: handleClick.",
      "Do not add (). React calls the function when the button is clicked.",
    ],
  },
  {
    id: "event-props",
    module: 5,
    shortTitle: "Pass a function through Card",
    title: "Send a click handler through Card to Button",
    duration: "8 min",
    eyebrow: "06 / FUNCTION PROPS",
    kind: "code",
    activeFile: CARD,
    clientFile: PAGE,
    starter: eventFiles(
      eventCard.replace("onClick={onClick}", "onClick={__FORWARD__}"),
      eventButton.replace("onClick={onClick}", "onClick={__HANDLER__}"),
    ),
    solution: eventFiles(),
    paragraphs: [
      "Props can contain functions as well as strings. The page chooses the action, Card receives it as onClick, and Button attaches it to the HTML button.",
      'Keep onClick={onClick} in both Card and Button. The page uses an arrow function so handleOpen receives the card title when clicked. Here the page has "use client" because it defines the handler; Card and Button are inside its client tree.',
    ],
    concept: {
      title: "Functions travel through props",
      body: "Page → Card → Button → onClick. The page chooses what happens when the user clicks.",
    },
    task: 'Fill the onClick expressions in Card.tsx and Button.tsx. Start lesson should show "Opening React basics" only when clicked.',
    example: eventCard,
    exampleFile: "app/components/Card.tsx",
    blanks: [
      {
        token: "__FORWARD__",
        label: "Handler to pass from Card",
        answer: "onClick",
        width: 12,
      },
      {
        token: "__HANDLER__",
        label: "Handler to attach in Button",
        answer: "onClick",
        width: 12,
      },
    ],
    expected: [{ label: "Start lesson", color: "blue" }],
    expectedCards: [firstCard],
    props: "color",
    cardProps: true,
    styled: true,
    forwardClick: "card",
    interactions: [
      { button: 0, alerts: ["Opening React basics"] },
      { button: 0, alerts: ["Opening React basics"] },
    ],
    hints: [
      "Fill {onClick} in Card, then open the Button.tsx tab and fill {onClick} there too.",
      "Keep the handler as a function prop. Do not call it while forwarding it.",
    ],
  },
  {
    id: "card-actions",
    module: 5,
    shortTitle: "Give each Card an action",
    title: "Make each Card open its own lesson",
    duration: "10 min",
    eyebrow: "06 / CLICK PRACTICE",
    kind: "code",
    activeFile: PAGE,
    clientFile: PAGE,
    starter: eventFiles(
      eventCard,
      eventButton,
      twoClickCards.replace(
        'handleOpen("Next.js pages")',
        'handleOpen("React basics")',
      ),
    ),
    solution: eventFiles(eventCard, eventButton, twoClickCards),
    paragraphs: [
      "Both cards reuse the same components but receive different functions. An arrow function can call handleOpen with the title for that instance.",
      'Use onClick={() => handleOpen("Next.js pages")} for the second Card. The arrow function waits for a click before passing the title to handleOpen.',
    ],
    concept: {
      title: "Choose an action for each instance",
      body: "Each Card receives its own click handler, just as it receives its own title and color.",
    },
    task: 'Fix the second Card handler in page.tsx. Start lesson must show "Opening React basics"; Open lesson must show "Opening Next.js pages".',
    example: twoClickCards,
    exampleFile: "app/page.tsx",
    expected: [
      { label: "Start lesson", color: "blue" },
      { label: "Open lesson", color: "green" },
    ],
    expectedCards: [
      firstCard,
      {
        title: "Next.js pages",
        description: "Create your first page.",
        buttonLabel: "Open lesson",
        color: "green",
      },
    ],
    props: "color",
    cardProps: true,
    styled: true,
    forwardClick: "card",
    interactions: [
      { button: 0, alerts: ["Opening React basics"] },
      { button: 1, alerts: ["Opening Next.js pages"] },
      { button: 0, alerts: ["Opening React basics"] },
    ],
    hints: [
      "Change the title passed inside the second arrow function.",
      "Keep the arrow function. Passing handleOpen(title) directly would run during rendering.",
    ],
  },
  {
    id: "state-counter",
    module: 6,
    shortTitle: "Build a counter",
    title: "Remember a count with useState",
    duration: "8 min",
    eyebrow: "07 / STATE",
    kind: "code",
    activeFile: PAGE,
    clientFile: PAGE,
    stateFile: PAGE,
    starter: counterFiles(
      counterPage
        .replace("useState(0)", "useState(__INITIAL__)")
        .replace("setCount(count + 1)", "setCount(__NEXT__)")
        .replace("Count: {count}", "Count: {__COUNT__}"),
    ),
    solution: counterFiles(counterPage),
    paragraphs: [
      "A normal variable does not tell React to update the screen. useState gives your component a remembered value and a function that changes it: const [count, setCount] = useState(0). This uses the JavaScript array destructuring you already know.",
      "count is the current value; setCount requests an updated value and another render. handleIncrease calls setCount(count + 1), and {count} displays the latest value.",
      'Import useState from "react". Keep "use client" at the top of page.tsx because this page uses state and event handlers.',
    ],
    concept: {
      title: "Remember and update a value",
      body: "useState(0) starts the count at zero. setCount changes it and React updates the screen.",
    },
    task: "Start at 0, display count, and increase it by 1 on each click. Reuse Button with the onClick prop from Module 6.",
    example: counterPage,
    exampleFile: "app/page.tsx",
    blanks: [
      { token: "__INITIAL__", label: "Initial count", answer: "0", width: 5 },
      {
        token: "__NEXT__",
        label: "Next count value",
        answer: "count + 1",
        width: 13,
      },
      {
        token: "__COUNT__",
        label: "Count to display",
        answer: "count",
        width: 9,
      },
    ],
    expected: [{ label: "Increase", color: "blue" }],
    initialText: "Count: 0",
    props: "color",
    styled: true,
    forwardClick: "button",
    interactions: [
      { button: 0, text: "Count: 1" },
      { button: 0, text: "Count: 2" },
      { button: 0, text: "Count: 3" },
    ],
    hints: [
      "Fill 0 as the initial value and {count} in the paragraph.",
      "Pass count + 1 to setCount. Do not change count directly.",
    ],
  },
  {
    id: "reset-counter",
    module: 6,
    shortTitle: "Add a Reset button",
    title: "Reset the counter",
    duration: "8 min",
    eyebrow: "07 / UPDATE STATE",
    kind: "code",
    activeFile: PAGE,
    clientFile: PAGE,
    stateFile: PAGE,
    starter: counterFiles(counterPage),
    solution: counterFiles(resetCounterPage),
    paragraphs: [
      "Different event handlers can update the same state. Increase adds one; Reset sets the value back to zero.",
      'Add handleReset with setCount(0), then pass it to a second Button. Use label="Reset" and color="red". The count must still increase after a reset.',
    ],
    concept: {
      title: "Two actions, one value",
      body: "Increase and Reset use the same setCount function to update the same count.",
    },
    task: "Add a red Reset Button after Increase. Its handler must reset count to 0, and Increase must continue working afterward.",
    example: resetCounterPage,
    exampleFile: "app/page.tsx",
    expected: [
      { label: "Increase", color: "blue" },
      { label: "Reset", color: "red" },
    ],
    initialText: "Count: 0",
    props: "color",
    styled: true,
    forwardClick: "button",
    interactions: [
      { button: 0, text: "Count: 1" },
      { button: 0, text: "Count: 2" },
      { button: 1, text: "Count: 0" },
      { button: 0, text: "Count: 1" },
      { button: 1, text: "Count: 0" },
    ],
    hints: [
      "Define handleReset inside Home, alongside handleIncrease.",
      "Call setCount(0), then use onClick={handleReset} on the Reset Button.",
    ],
  },
  {
    id: "like-cards",
    module: 6,
    shortTitle: "Give each Card its own Likes",
    title: "Keep a separate Like count in each Card",
    duration: "10 min",
    eyebrow: "07 / STATE PRACTICE",
    kind: "code",
    activeFile: CARD,
    clientFile: CARD,
    stateFile: CARD,
    starter: likeFiles(
      likeCard
        .replace("setLikes(likes + 1)", "setLikes(__NEXT__)")
        .replace('"Likes: " + likes', '"Likes: " + __LIKES__'),
    ),
    solution: likeFiles(likeCard),
    paragraphs: [
      "Put useState inside Card so each rendered Card remembers its own likes. Reusing a component reuses its code; it does not share its state between instances.",
      'handleLike updates the current Card with setLikes(likes + 1). Its Button displays "Likes: " + likes and receives handleLike through onClick.',
      'Card has "use client" because it owns the state and handler. The page only passes ordinary text and color props, so it can remain a Server Component in your Next.js project.',
    ],
    concept: {
      title: "Each instance remembers separately",
      body: "State inside Card belongs to that Card. Liking one card leaves the other card unchanged.",
    },
    task: "Display likes in the Button label and add 1 in handleLike. Both Cards start at Likes: 0 and must increase independently.",
    example: likeCard,
    exampleFile: "app/components/Card.tsx",
    blanks: [
      {
        token: "__NEXT__",
        label: "Next Like count",
        answer: "likes + 1",
        width: 13,
      },
      {
        token: "__LIKES__",
        label: "Like count to display",
        answer: "likes",
        width: 9,
      },
    ],
    expected: [
      { label: "Likes: 0", color: "blue" },
      { label: "Likes: 0", color: "green" },
    ],
    expectedCards: [
      { ...firstCard, buttonLabel: "Likes: 0" },
      {
        title: "Next.js pages",
        description: "Create your first page.",
        buttonLabel: "Likes: 0",
        color: "green",
      },
    ],
    props: "color",
    styled: true,
    forwardClick: "button",
    interactions: [
      { button: 0, labels: ["Likes: 1", "Likes: 0"] },
      { button: 0, labels: ["Likes: 2", "Likes: 0"] },
      { button: 1, labels: ["Likes: 2", "Likes: 1"] },
      { button: 0, labels: ["Likes: 3", "Likes: 1"] },
    ],
    hints: [
      "Use likes + 1 in setLikes, and likes in the label expression.",
      "Keep useState inside Card. Both Card instances use the same code but receive separate state.",
    ],
  },
];

export const findExercise = (id: string) =>
  exercises.find((exercise) => exercise.id === id);
export const initialExercise = exercises[0];
