# Next Classroom

An English, interactive Next.js foundations course for students learning React components, props, events, and state. It includes seven modules and 21 exercises: Mac setup, Next.js concepts, components/imports, props with inline button styles, Cards, click handlers, and counters with independent Like counts.

## Run locally

Install the dependencies and start the app:

```sh
npm install
npm run dev -- --port 3001
```

Open http://localhost:3001. Port 3001 is useful when another project already uses 3000. The course's learner setup instructions use the usual port 3000 and explain how to follow the port printed by Terminal.

Use Node.js 20.9 or newer. The app keeps the installed Next.js 16.3.8 and React 19.2.8 versions. Consult the installed Next.js guides under `node_modules/next/dist/docs/` before changing framework behavior.

## Share with the classroom network

For development, run `npm run dev:lan` and share http://192.168.1.210:3000 with students on the same network. Keep the Mac and its server running. If another server already occupies port 3000, stop that server before starting this one or choose a different port and share that port.

For a classroom session, first stop the development server, then run:

```sh
npm run build
npm run start:lan
```

The development configuration allows the current classroom host `192.168.1.210`. If the Mac's network address changes, update `allowedDevOrigins` in `next.config.ts` and the shared link, then restart the development server. Production mode does not use this development allowlist.

Run identifiers use `crypto.getRandomValues`, which works on plain HTTP network addresses. `crypto.randomUUID` requires a secure context and is not available on ordinary `http://192.168...` pages. Localhost verification alone does not cover this difference. Student progress belongs to each browser and address, so progress saved on localhost does not appear automatically at the network address.

The editor uses Sandpack's React provider, while previews use its public runtime client directly. This avoids the React preview wrapper's `crypto.subtle` ID hashing, which also requires a secure context. Student code still runs in the isolated preview iframe, and each answer check verifies both that iframe and the current run ID.

## Student experience

- Short explanations connect components to JavaScript functions and props to object inputs.
- Early exercises use code gaps; later exercises use an editable component workspace. Module 5 adds Card.tsx beside Button.tsx and page.tsx.
- The exercises use real default exports, relative imports, JSX, and JavaScript props, without lesson type annotations.
- The blue/red exercise passes `color="blue"` and `color="red"` from the page and uses `backgroundColor: color` in the Button's inline style.
- Module 6 teaches click handlers and passing functions through Card to Button. Module 7 teaches useState, a counter with Reset, and independent Like counts inside Cards. Interactive examples include the appropriate Next.js "use client" boundary.
- Run updates the component preview; Check answer checks compilation, component structure, rendered output, fresh prop values, and results after repeated clicks.
- Hints, expected-result examples, reset controls, and solutions support practice.
- Drafts, lesson selection, and completed exercises are saved in the current browser with no account. The storage key is `next-classroom:progress:v1`.
- Viewing a solution does not count as independent completion. Reset and try the exercise yourself to earn completion.

## Preview boundary

Sandpack runs the student's React/TSX in a separate iframe using React 19.2.8. Its browser bundler and package delivery require an internet connection, even when this app runs locally. A preview failure leaves the lesson and drafts usable, with a retry message.

This is a component preview, not a complete Next.js server. Next.js routing and server rendering are taught conceptually and practiced in the real local project from the setup module. Terminal commands shown in the course are instructional and are not executed on the student's Mac by the webpage.

The hidden preview entry renders the page, measures its buttons and Cards, and probes fresh text, colors, and event handlers. For interactive exercises, it clicks a separate hidden copy of the page, verifying repeated updates, reset behavior, and state independence while leaving the visible preview at its initial state. Alerts appear as inline status messages in the preview; alert opens a normal browser dialog in a real student project. The parent accepts reports only from its preview iframe and current run identifier. Editing code invalidates completion feedback; stale preview output cannot pass a new answer.

The local `/api/check` endpoint parses/type-checks the supplied exercise files using the TypeScript compiler and real React declarations. It never executes student code. It checks default exports, the relative component import, component rendering, and inline style usage. Unrelated imports and type-check bypass directives are rejected before program creation.

## Validation

```sh
npm run test
npm run lint
npm run typecheck
npm run build
```

The tests cover all supplied solutions, alternate correct syntax, import failures, prop type errors, broken JSX, hard-coded props, stale runs, output differences, and saved-data recovery. DOM tests render the actual React samples through the same generated preview runner, click buttons, verify counters and independent state, and reject disconnected, doubled, or prematurely called handlers. jsdom is a development-only test dependency.

For a production-mode local server:

```sh
npm run build
npm run start -- --port 3001
```

## Extend the course

- `lib/course/lessons.ts`: modules, explanations, questions, starter/solution files, code gaps, expected output, and hints.
- `lib/course/types.ts`: exercise and progress contracts.
- `lib/course/validators.ts`: structural checks and TypeScript diagnostics.
- `lib/course/runtime-checks.ts`: checks against rendered results.
- `lib/course/sandbox.ts`: isolated preview runner and virtual files.
- `lib/course/progress.ts`: versioned browser storage and safe restore.
- `components/learning/`: workspace, navigation, lesson content, editor, and feedback.

Add a stable exercise ID, starter files, working solutions, hints, and expected output. Props exercises must remain reusable with new values. Run all validations after adding content.

The implementation plan is in `docs/implementation-plan.md`. This delivery is local; no repository push or online deployment is included.
