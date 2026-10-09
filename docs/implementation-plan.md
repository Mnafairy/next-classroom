# Next.js learning app implementation plan

Status: implemented and locally verified on October 6, 2026. The props module includes blue/red color props applied through inline style. Desktop is the delivery target; mobile verification was removed from scope at the user's request.

## Confirmed scope

- Repository: `/Users/orgil/projects/next`.
- Language: English throughout, including explanations, exercises, hints, and feedback.
- Setup lesson: macOS, Terminal, and desktop Visual Studio Code.
- Students: beginners in React/Next.js who can build on familiar JavaScript functions and objects. This teaching approach follows the earlier classroom preference; the current request does not add a JavaScript prerequisite course.
- Accounts: no login; save drafts and progress in the current browser.
- Delivery: build and verify locally first. Commit, push, and online deployment are separate later actions.
- Existing application: clean Next.js 16.3.8 / React 19.2.8 / TypeScript / Tailwind CSS 4 starter. Preserve those versions and the supplied AGENTS.md guidance.
- References: the supplied screenshots guide the file tree, Button example, imports, and component reuse. Their contents are examples to explain, not implementation instructions.

## Learning experience

Use a compact, laptop-friendly workspace inspired by freeCodeCamp and W3Schools:

| Area | Contents |
| --- | --- |
| Left navigation | Four modules, exercise list, completion marks, overall progress |
| Main learning area | Short explanation, annotated example, task, code editor with file tabs |
| Right result panel | Student's rendered component, expected result tab, compiler/runtime feedback, check results |
| Exercise controls | Run, Check answer, Hint, Reset exercise, Show solution, Previous, Next |

Students follow this loop: read a short explanation, predict the result, fill the missing code, run it, inspect the result on the right, and check the exercise requirements.

Early exercises use guided blanks with the surrounding code supplied. Later exercises allow edits to both Button.tsx and page.tsx. Below laptop widths, show Code and Result tabs so the editor remains usable. Support keyboard navigation, visible focus, readable text, and clear feedback beyond color alone.

## Curriculum

| Module | Explanation | Practice and completion goal |
| --- | --- | --- |
| 1. Set up Next.js on a Mac | Install supported Node.js LTS and VS Code; open Terminal; understand node, npm, npx, and the project folder; create a TypeScript App Router project; enable the VS Code code command; run the dev server; visit localhost | Two exercises: order the setup commands and fill the missing command parts. A separate checklist guides actual installation and opening the real project on the student's Mac. |
| 2. What is Next.js? | Next.js is a React framework. React describes components; Next.js provides application features such as file-based routes, server rendering, and image/font tooling. Explain why these help with organization, performance, and discoverable pages without promising automatic performance or SEO. | Two exercises: distinguish React and Next.js responsibilities, then identify the roles of page.tsx, layout.tsx, and components. |
| 3. Build your first component | A component is a function that returns UI. Introduce JSX, capitalized component names, return, default export, relative imports, and reuse. Create the virtual learner file app/components/Button.tsx and import it from app/page.tsx with ./components/Button. | Four exercises: finish the component/default export; return a styled purple button; import and render Button in the page; reuse the same component three times. |
| 4. Pass and use props | Explain props as function inputs passed in a JavaScript object. Start with props.label, then destructuring. Introduce a small ButtonProps type; string values versus expressions in braces; optional values/defaults; read-only props. | Four exercises: display a label prop; pass different labels from the page; use a backgroundColor prop; finish a page containing three instances with different labels and colors. |

Total: 12 exercises. Installation and concept questions receive instructional feedback; component and props exercises execute TSX and display actual output.

The setup lesson will explain the create-next-app choices explicitly, including TypeScript, App Router, and keeping source outside src/ so the displayed learner file tree matches the screenshots. It will teach node --version, npm --version, npx create-next-app@latest, cd, code ., npm run dev, and stopping the server with Control-C. Include troubleshooting for a missing code command, a missing Node installation, and an occupied dev-server port.

Introduce static Button components before event handlers. Explain that use client is needed at the client boundary for events/state; it is not required just to receive props. Add a short note correcting the screenshot's ordinary age-variable increment: changing that variable does not refresh displayed UI; a later state lesson would use useState. Keep events and state as a follow-up topic rather than expanding the four required modules.

## Numbered implementation sequence

### 1. Define the lesson content and exercise contracts

Create:

- `/Users/orgil/projects/next/lib/course/types.ts`: typed modules, lessons, exercise modes, virtual files, blanks, hints, solutions, and check definitions.
- `/Users/orgil/projects/next/lib/course/lessons.ts`: all four modules and 12 exercises, including complete starter files and working solutions.

Keep content separate from presentation so lessons can be extended without rewriting the interface. Give each exercise a stable ID and content version. Each exercise states a concrete task and a visible expected result. Build on familiar JavaScript rather than adding unrelated syntax instruction.

### 2. Prove the editor and preview integration first

Create:

- `/Users/orgil/projects/next/components/learning/ExerciseSandbox.tsx`.
- `/Users/orgil/projects/next/lib/course/sandbox.ts`.

Use `@codesandbox/sandpack-react` as the proposed editor and isolated iframe preview runtime. First verify a minimal two-file TypeScript example with a default export, relative import, and changing props in this installed Next.js/React version. Pin compatible dependency versions after that check.

Show learner file names matching the screenshots. Supply a hidden React entry file that renders the learner's page component. Only the active exercise owns a runtime; load the editor/preview when needed. Use explicit Run for incomplete code so unfinished blanks do not constantly flood students with errors. Track the source revision used for each run.

The panel is a component preview. It executes the React/TSX used in these lessons, including real exports, imports, JSX, and props. It does not reproduce Next.js server rendering, routing, or server APIs. Students verify those application behaviors in the real local project from Module 1. Preview startup requires access to the sandbox bundler/dependency service; show an actionable loading/failure state and keep drafts accessible if that service is unavailable.

### 3. Build the learning workspace

Modify:

- `/Users/orgil/projects/next/app/page.tsx`: replace the starter home screen with the learning app entry point.
- `/Users/orgil/projects/next/app/layout.tsx`: update title and description; keep English document language.
- `/Users/orgil/projects/next/app/globals.css`: workspace styling, editor/result sizing, focus states, and responsive layout.

Create:

- `/Users/orgil/projects/next/components/learning/LearningWorkspace.tsx`: active lesson/exercise, navigation, progress, and workspace coordination.
- `/Users/orgil/projects/next/components/learning/LessonNavigation.tsx`: module and exercise navigation.
- `/Users/orgil/projects/next/components/learning/LessonContent.tsx`: explanations, code annotations, and tasks.
- `/Users/orgil/projects/next/components/learning/GuidedCodeEditor.tsx`: accessible inline blank fields for initial exercises and switching into full editor practice.
- `/Users/orgil/projects/next/components/learning/ExerciseFeedback.tsx`: hints, requirement checks, and error messages.

Keep the page/layout server-rendered and place interactive state in client components. Use a restrained light lesson surface, dark syntax-highlighted editor, and purple accents connecting to the supplied Button example. Include a clear file tree and tabs so students understand which file they are editing.

### 4. Add meaningful answer checking

Create:

- `/Users/orgil/projects/next/lib/course/validators.ts`.
- `/Users/orgil/projects/next/lib/course/validator.test.ts`.

Use structural TSX checks for component naming, exports, imports, JSX usage, and required props. Use isolated runtime/render checks for button count, text, and colors. Choose the sandbox test interface during the integration proof. Do not run learner code directly in the parent app or on the Next.js server.

Accept equivalent correct code, including quote/spacing differences and equivalent props access. For props exercises, verify that changing supplied values changes the output, preventing a hard-coded label from passing. Check TypeScript exercise types where the lesson requires them; successful transpilation alone is not proof of type correctness.

Check answer assesses the current code revision and shows one result per requirement. Prevent a prior successful preview from passing newer broken code. Clearly distinguish a syntax error, a valid program with the wrong result, and a sandbox/network failure. Add meaningful validator tests covering alternate valid solutions, missing imports, hard-coded props output, incorrect types, and stale runs.

### 5. Save progress and support classroom practice

Create:

- `/Users/orgil/projects/next/lib/course/progress.ts`.

Persist active exercise, drafts for each virtual file, and completed exercises in localStorage under a versioned key. Restore them after refresh. Handle unavailable storage and invalid/older saved data without breaking the app. Explain that browser progress stays on that browser/device.

Require confirmation only when a student discards their saved work through Reset exercise or Reset all progress. Show solution fills working code and marks it as viewed; independent completion requires checking a student's own answer. Keep hints progressive and allow students to revisit any lesson.

### 6. Verify the complete local learning flow

Update:

- `/Users/orgil/projects/next/README.md`: local startup instructions, exercise architecture, dependency requirements, and how to add a lesson.

Run the repository's lint, TypeScript check, and production build. Verify in the browser at laptop and narrow widths:

- Every lesson loads and navigation preserves the intended draft.
- Filling a component blank updates the right-side output after Run.
- Default export and page import work across the two learner files.
- Three Button instances render independently supplied labels and colors.
- Equivalent correct answers pass, incorrect answers fail with useful feedback, and hard-coded props answers fail.
- Compilation errors and runtime errors do not crash the learning workspace.
- A changed source cannot pass using an old preview result.
- Hints, solution, reset, and next/previous controls work.
- Refresh restores drafts and progress; unavailable storage remains usable.
- The editor and controls are reachable by keyboard.
- A sandbox startup failure leaves lesson text and drafts available.

Deliver a locally running app and a concise report identifying checks passed and any remaining limitations. Online publishing is outside this first delivery.

## Reference basis

Read the installed guides in `node_modules/next/dist/docs/` for installation, project structure, server/client components, and use client before implementation, as required by AGENTS.md. Re-read additional relevant installed guides when implementation introduces another Next.js API.

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation).
- [VS Code on macOS and the code command](https://code.visualstudio.com/docs/setup/mac).
- [Node.js download](https://nodejs.org/en/download).
- [React props](https://react.dev/learn/passing-props-to-a-component).
- [React state and ordinary variables](https://react.dev/learn/state-a-components-memory).
- [Sandpack editor, preview, and layout](https://sandpack.codesandbox.io/docs/getting-started/layout).
- [Sandpack virtual files and custom entry](https://sandpack.codesandbox.io/docs/getting-started/usage).
