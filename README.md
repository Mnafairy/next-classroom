# КодЛаб · Хичээл сонгох

The main page is a Mongolian lesson chooser: Python (Grades 9–10) at `/python`, JavaScript (Grades 6–8) at `/kodlab`, and Next.js at `/next-classroom`. Students choose their lesson before entering the existing lesson experience. All three courses ask for a student ID and synchronize progress through the MongoDB backend. Each lesson has a return link to the chooser.

Existing Python hash bookmarks such as `/python#/visualize/if` forward to `/python#/visualize/if`. Moving Python keeps its storage keys and saved student work on the same origin. The Next.js course instructions remain in [docs/next-classroom.md](docs/next-classroom.md).

## КодЛаб · JavaScript (Grades 6–8)

The Mongolian JavaScript lab is available at **`/kodlab`**, alongside Python at
`/python` and the Next.js course at `/next-classroom`. It includes all 24 exercises,
20 knowledge-test questions, the code playground, and separate student profiles in MongoDB. A new student ID starts fresh; the same ID resumes its saved work on another device once database access is configured.

The source is in [`apps/kodlab`](apps/kodlab/README.md). Root `npm install` or
`npm ci` installs its workspace dependencies. Development startup and production
builds prepare the app automatically; `npm run kodlab:dev` starts its own live
editor at `http://localhost:4173/kodlab/`. Use `npm run kodlab:build` to refresh
the files served by Next.js. `npm test` includes the JavaScript checks.

All JavaScript assets are served locally. Saved work from the public ChatGPT
Site does not transfer automatically to this server's address.

## Run

```sh
npm install
npm run dev
```

Open the address printed by Next.js. If another app uses port 3000, run `npm run dev -- --port 3002`.

For the classroom network, use a production build:

```sh
npm run build
npm run start:lan
```

Share this computer's current local-network address on port 3000. Keep the computer and server running. This is a local implementation; it has not been deployed online. Behind a reverse proxy that changes the host or scheme, set `CLASSROOM_PUBLIC_ORIGIN` to the exact browser-facing origin. Direct LAN hosting uses the request’s Host header.

## Student experience

- 28 exercises across seven modules: variables and types; input and arithmetic; if/elif/else; and/or/not; for; while; continue and nested loops.
- An explicit transition from familiar conditions to single loops before introducing nested loops.
- A Python editor with syntax highlighting, four-space indentation, line numbers, and Command/Ctrl + Enter to run.
- Real Python execution in the browser, input values supplied one per line, output, syntax errors, line numbers, and missing-input feedback.
- Answer checks execute multiple inputs and boundary values, and inspect Python syntax for the requested structures. Comments containing a keyword cannot satisfy a structure check.
- Hints, concept explanations, reference sheets, example solutions, reset confirmation, and `.py` downloads.
- 21 quiz questions, seven topic quizzes and one combined quiz, saved answers, scoring, explanations, and retries.
- A free-code area with its own saved code and inputs.
- Separate MongoDB drafts and progress for each student ID, with a browser fallback copy. Only imported, active student IDs can load/save progress. IDs are classroom identifiers, not authenticated accounts.
- Viewed solutions do not count as independent completion. Reset the exercise before solving independently. Editing a completed exercise invalidates its completion until checked again.
- JSON export of code, progress, and quiz answers. The export is a download. The teacher dashboard at `/admin` shows assigned students, classes, saved work, progress and teacher notes.

## Animated teaching view

Choose **Кодын урсгал** in the main navigation, or the animation link inside a condition/loop exercise.

- `/python#/visualize/if`: battery-level if/else example with distinct True and False paths and a shared statement after the branches.
- `/python#/visualize/for`: range iteration, the current `i`, repeated output, and the final exhausted-iteration check.
- `/python#/visualize/while`: condition checks, output, an explicit counter update, the return path, and the final False check.
- Play/pause, previous/next step, reset, jump to end, speed selection, and a step slider.
- A **Том дэлгэц** teaching view gives the code and diagram more room for a classroom display. Escape returns to the normal view.
- A highlighted Python line, active flowchart node, animated dot along the current arrow, variable cards, output, and an optional trace table stay synchronized.
- Change the battery level or loop length to restart with a new example. Compare battery 20 vs 21, and different loop lengths.
- Motion starts only when requested. Reduced-motion preferences hide the traveling dot while keeping the code, diagram, and step controls available.

These are guided, deterministic examples. The animated flowchart does not interpret arbitrary student code. Exercise code is executed separately by the Python runtime.

## Python runtime

The pinned Pyodide 0.29.2 dependency supplies Python/WebAssembly. `postinstall`, development startup, and production builds copy its runtime files into generated `public/python/runtime/`; those files are intentionally gitignored. The browser fetches the runtime from this app, so it does not require a third-party CDN connection. Package installation still needs internet unless dependencies are already cached.

A disposable web worker runs each request, keeping Python off the interface thread and away from the web server. Execution is limited to six seconds after Python loads, with a separate 45-second loading deadline and a 16,000-character output limit per case. Stop terminates the worker; each new request receives a fresh Python environment. Student Python is never executed by a server API.

Supply all `input()` values in advance, one per line. Input prompts are omitted from the captured output. This is not a live terminal conversation. Builtins and bundled standard-library modules are available; additional scientific packages are not automatically installed.

The checker is practice feedback, not a secure exam grader. Course data and solutions are available in the browser.

## Validation

```sh
npm test
npm run lint
npm run typecheck
npm run build
```

The Python tests execute all supplied solutions and samples through the same harness used by the browser worker. They cover multiple inputs, boundary mistakes, hard-coded output, syntax requirements, input failures, output limits, corrupt saved data, and profile-key separation. Animation tests verify branch selection, iteration and check counts, highlighted lines and graph references, and compare final animated output with real Python output. Running these development tests requires `python3`; students do not need it installed.

The original Next.js course tests continue to run alongside the Python tests.

## Files

- `lib/python/course.ts`: exercises, examples, requirements, solutions, and tests.
- `lib/python/questions.ts`: quiz content.
- `lib/python/flow.ts`: guided flowchart geometry and execution steps.
- `components/python/`: lab, editor, quizzes, dialogs, and animated teaching view.
- `public/python/harness.py`: shared Python runner and checker.
- `public/python/worker.js`: Python worker for the sandboxed exercise frame. The frame runs on an opaque origin and can load only the Python runtime and harness.
- `scripts/prepare-python.mjs`: self-hosted runtime preparation.
- `lib/python/state.ts` and `storage.ts`: student profiles, server synchronization and safe progress restore.

The existing `lib/course/`, `components/learning/`, and `/api/check` remain dedicated to the original Next.js course.

## Grade curriculum

From the home page, open **Анги тус бүрийн хичээл** to find the Grade 7, 8, 10 and 11 Information Technology curriculum at `/curriculum`. Lesson pages include worked examples, practice steps, a deliverable, criteria and a self-check. JavaScript and Python examples run in the browser. HTML and Next.js examples can be downloaded for local practice.

The [curriculum coverage review](docs/curriculum-coverage.md) maps the school workbook to the existing and new lessons.

Every curriculum lesson also has six extra exercises in three levels, including the five lessons that reuse existing classroom content. Each task states a checkable outcome, includes a topic hint, and offers space for a solution or testing notes. JavaScript and Python tasks have a runnable scratchpad. A further challenge section suggests ways to extend a finished task. Draft code, notes and self-marked completion survive reloads in the same browser tab through session storage; downloads provide a lasting copy.

The home page's test link opens `/practice-tests`. Grades 7, 8, 10 and 11 have 166 explained questions linked to all 83 curriculum topics. Students can choose a mixed grade test, a unit or one lesson, answer up to 12 questions, see scored feedback, retry missed topics or start another selection. Answers are shuffled and unseen questions are preferred. These are public formative tests, with answer keys available in the browser and no effect on teacher grades. The existing teacher-code JavaScript exam remains at `/exam`, linked from the test hub, and continues to use its existing access, deadline and grading rules.

## MongoDB and deployment

See [MongoDB setup and hosting](docs/mongodb-deployment.md) for the selected Atlas project, server-only environment variables, save behavior, and Vercel/Sites options. Live Atlas access requires a database user and network permission.
