# Information Technology curriculum coverage

The 2026–2027 Oyunlag workbook has 83 topic rows for Grades 7, 8, 10 and 11. The KodLab curriculum follows each selected sheet in row order. Each lesson page shows its source row and the workbook’s **Цаг** value.

| Grade | Workbook rows | Reused | Extended | Added |
| --- | --- | ---: | ---: | ---: |
| 7 | Sheet 7, rows 9–24 | 0 | 1 | 15 |
| 8 | Sheet 8, rows 9–24 | 0 | 0 | 16 |
| 10 | Sheet 10, rows 9–39 | 4 | 5 | 22 |
| 11 | Sheet 11, rows 9–28 | 1 | 4 | 15 |
| **Total** | **83 topics** | **5** | **10** | **68** |

## What KodLab already taught

- **Grade 7.** The shared JavaScript lab already taught conditional branches and compound conditions through `adventure` and `ride`. Row 20 extends those exercises into a quiz with a scoring function and boundary tests. Rows 9–19 and 21–24 add loops, objects, forms, Flexbox, DOM projects and the remaining Cambridge Computing 8 topics.
- **Grade 8.** All 16 topics add grade-specific instruction. Existing JavaScript practice supplies prerequisites for these lessons. The additions cover functions, arrays, browser events, validation, responsive Grid, local storage, Cambridge Computing 9 and the capstone.
- **Grade 10.** Rows 9–11 and 13 reuse Python practice for types and input, Boolean conditions, `elif` and nested loops. Rows 12 and 14–17 extend prior practice with multi-input pricing, a guessing counter, comparing loops, combining `break` with `continue`, and computing statistics from repeated inputs. Rows 18–39 add strings, lists, dictionaries, functions, errors, files, modules, projects and computer science.
- **Grade 11.** Row 9 reuses Next Classroom setup. Rows 10–12 add real App Router navigation, mapped JSX lists, CSS Modules and public assets to the existing conceptual and component practice. Row 17 applies the existing state work to the research project. Rows 13–16 and 18–28 add the multi-page, research, AI-assisted development and team projects.

## Source timing and delivery

The Grade 8 rows total 72 hours because two workbook rows include lessons 59–62. Both topics and their row values appear in the curriculum. The Grade 10 row values total 32 hours, while the unit headers total 66. Its lesson pages use the row values. The grade pages flag both timing differences for teachers.

Existing practice links open the current classrooms and use their existing progress tracking. The new curriculum pages provide worked examples, ordered practice, deliverables, assessment criteria and self-check answers. The console activities use the existing isolated browser runtimes. HTML, Next.js and multi-period project work is assessed against the lesson criteria. Students can download their work from the console activities.

## Extra practice and formative tests

Every topic now includes six additional authored exercises, arranged as two reinforcement tasks, two application tasks and two advanced challenges. These extend the source topics without adding or changing workbook hours. Each exercise has an observable result or deliverable, and each topic includes a hint. After the six tasks, learners can extend a task with new cases, an alternative solution, another requirement or a new project context. They can also proceed directly to the next lesson's challenges.

| Grade | Lessons | Extra exercises | Practice-test questions |
| --- | ---: | ---: | ---: |
| 7 | 16 | 96 | 32 |
| 8 | 16 | 96 | 32 |
| 10 | 31 | 186 | 62 |
| 11 | 20 | 120 | 40 |
| **Total** | **83** | **498** | **166** |

At `/practice-tests`, students select a grade, unit or lesson. Mixed attempts rotate through all units and contain 12 questions. Smaller scopes use all available questions up to 12; a single lesson has two. Selection favors questions not yet seen in that tab, and choices are shuffled using stable answer identities. After all questions are answered, feedback shows the score, selected and correct answers, explanations and links to the relevant lesson. A missed-topic retry draws only from the missed lessons. Students can retake without a timer or teacher reset and download the result.

Exercise completion is self-marked after checking the stated outcome. Running code is a scratchpad action, not an automatic proof that a project meets its criteria. Multiple-choice practice tests are scored automatically. Code, notes, completion and current test responses use tab-local session storage, with download links and a visible warning if saving fails. They are not student-account records and do not enter teacher grade reports. The separate `/exam` assessment, its historical attempts and its access restrictions continue unchanged.

Validation includes coverage and uniqueness for every lesson, shuffled-answer grading, unit-balanced selection, scoped retries and invalid saved-state handling. The full test suites pass 175 tests; three optional MongoDB integration tests remain skipped. Production build, lint and TypeScript checks pass. Local Chrome checks cover all 83 lesson routes, JavaScript and Python scratchpads, per-exercise drafts, completion, extra challenge variants, result downloads, all four grades, incorrect-answer feedback, missed-topic retry, reload recovery, unavailable storage, unknown routes and 360px layouts. The teacher exam entry and original classroom routes were also checked. No deployment or production-data update was performed.

## Curriculum workspace (November 2026)

Grade pages now offer lesson search and unit filters. Lesson pages keep the grade's topic list beside the reading and practice content, with direct links to understanding the example, the six exercises, and the topic test. The existing exercise drafts and completion tracking remain in the practice components.

The curriculum hub and condition/loop topics include a Motion-powered flow lab. Students choose `if / else`, `for`, or `while`, change the battery level or repetition count, and play, pause, step backward/forward or reset the trace. The active code line, diagram branch, variable and output share one trace. Grade 10 uses Python; JavaScript lessons use JavaScript. These are introductory demonstrations of control flow, not interpreters for arbitrary student code or complete animations of nested loops/elif. Reduced-motion preferences suppress path drawing and fades while retaining all controls.

Validation: 240 tests passed including real MongoDB tests, JavaScript trace comparisons against actual execution, and the existing Python flow checks. Build and lint passed. Browser checks covered 20 combinations of curriculum routes and 1440/1024/768/390px widths, plus playback, step/reset and lesson-search recovery. This change has not been deployed.
