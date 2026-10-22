What this repo does: KodLab offers Python, JavaScript and Next.js exercises. Students enter an ID, work in a browser, and save their course progress to MongoDB Atlas. This review assumes a classroom of about 40 simultaneous students, not an authenticated school-records system.

Review date: 2026-10-19. Applied Ponytail 5.3.2, pstack 0.15.28 (type-system discipline, domain modeling, reader load and direct verification), and Cursor Team Kit's thermo-nuclear-code-quality-review skill. The audit covered the current working tree, including its existing uncommitted course integration.

## Must fix — resolved

1. **One browser tab could erase another tab's unsent work** (`lib/student/cloud.ts`).
   - **What this is:** The shared sync client keeps drafts locally until MongoDB confirms a save.
   - **Problem:** Both tabs used one backup key. A late acknowledgement could clear the other tab's newer, unsent draft.
   - **Fix:** Each sync session owns its backup. Recovery reads pending copies without letting one tab clear another's key. A regression test reproduces the original loss.
   - **If we skip it:** A student working in two tabs can lose the latest edit after reloading.

2. **Saved JavaScript data could crash the lesson or inject markup** (`apps/kodlab/src/store.js`).
   - **What this is:** The JavaScript lab restores exercise drafts, quiz scores and unfinished quiz attempts.
   - **Problem:** It accepted unchecked score fields and quiz IDs. A string in a numeric score reached HTML; an unknown question ID crashed the quiz screen.
   - **Fix:** Restore only known exercises and quizzes, numeric scores, valid history entries and valid question/answer indexes. Keep valid code drafts. The malformed-data test covers both cases.
   - **If we skip it:** Corrupt or deliberately edited progress can break the learner's page.

3. **The Next.js checker would lose required files in production** (`next.config.ts`, `lib/course/validators.ts`).
   - **What this is:** Server-side exercise checks use TypeScript and React declarations.
   - **Problem:** The original production trace contained no React or TypeScript declaration files. The bundled compiler also needs their actual package location.
   - **Fix:** Include the declarations in the checker function and set the compiler's declaration paths explicitly. The deployed checker passed a real exercise solution.
   - **If we skip it:** The local checker passes but the deployed checker rejects valid work.

4. **Malformed origins could crash the checker; request bodies were read without a streaming bound** (`lib/http/request.ts`, both API routes).
   - **What this is:** These endpoints accept browser-supplied JSON.
   - **Problem:** `Origin: null` threw before error handling. The checker read a whole body before checking its size. The progress endpoint accepted media types merely starting with application/json.
   - **Fix:** Both endpoints use one origin check and one bounded JSON-object reader. Oversized streams are cancelled; malformed origins, non-object JSON and fake media types are rejected. Tests cover the observable HTTP results.
   - **If we skip it:** Bad requests can cause server errors or unnecessary memory usage.

5. **Corrupt pending backups could replace valid server progress** (`lib/student/cloud.ts`).
   - **What this is:** An interrupted session can resume its unsent local copy.
   - **Problem:** Any truthy `pending` value was trusted, including strings.
   - **Fix:** Parse the backup revision and object shape before accepting it. Preserve valid server data when a backup is damaged.
   - **If we skip it:** A damaged browser cache can restore blank work or enter repeated failing saves.

## Should fix — resolved

6. **Autosave could send several requests per second while a student typed** (`lib/student/cloud.ts`).
   - **What this is:** Every edit previously restarted a 400 ms debounce timer.
   - **Problem:** Pauses between keystrokes could create multiple writes per second, and identical snapshots were saved again.
   - **Fix:** Queue routine saves at five-second intervals, skip unchanged snapshots and keep explicit flushes for leaving the page. Stop automatic retries for permanent client rejections. Timing tests enforce the save rate.
   - **If we skip it:** A small class can consume a disproportionate share of the free hosting quota.

7. **Sync behavior had a separate, loose type contract** (`lib/student/cloud.ts`, `lib/student/protocol.ts`).
   - **What this is:** All three courses share one sync implementation and API.
   - **Problem:** JavaScript plus a separate declaration file let the implementation drift from the advertised types. Separate conflict/blocked booleans could disagree; request casts spread boundary assumptions into the route.
   - **Fix:** Use a typed implementation and one parsed, discriminated request contract. A single blocked reason replaces overlapping booleans, and each session owns its timer. Remove the parallel declaration file.
   - **If we skip it:** Later changes can break a course without the compiler identifying the mismatch.

8. **The Python workspace exceeded 1,000 lines** (`components/python/PythonLab.tsx`).
   - **What this is:** The file combined the login screen with lesson navigation, exercises, quizzes and dialogs.
   - **Problem:** Login work pushed an already busy file past the strict review's size threshold.
   - **Fix:** Give the existing login screen its own `StudentLogin` component and share the small brand component. The workspace is now below 900 lines; screen behavior and styles are preserved.
   - **If we skip it:** Unrelated login and exercise changes remain coupled in one large component.

9. **Python's ID form accepted IDs the shared API rejects** (`lib/python/storage.ts`).
   - **What this is:** Python validates an ID before loading progress.
   - **Problem:** IDs starting with a hyphen or underscore passed the form but failed at the server.
   - **Fix:** Require an alphanumeric first character, preserving Python's existing 2–24-character range. A regression test covers the mismatch.
   - **If we skip it:** An ID looks accepted but cannot load its progress.

## Remaining findings

10. **The lint toolchain has an upstream advisory** (`eslint-config-next` → `fast-glob` → `micromatch` → `braces@3.0.3`).
    - **What this is:** Development-only file-pattern matching used by linting.
    - **Problem:** npm reports GHSA-vfj7-8cjw-p6xm and five affected packages through the dependency chain. The registry offered no fixed braces release during this check.
    - **Fix:** Update when the upstream lint dependency has a compatible fix. Do not apply npm's suggested major downgrade to Next.js 14 as a blanket fix.
    - **If we skip it:** The development toolchain retains the pattern-exhaustion advisory. It is not a learner-facing runtime endpoint.

Verdict: The confirmed data-loss, input-validation and production-packaging problems are fixed. Keep the upstream development advisory visible.

Not checked: exhaustive curriculum accuracy, physical classroom Macs, a long-duration production soak, or authenticated ownership. ID-only access remains the user's requested design: knowing an ID permits reading and editing its work. Existing unrelated dirty files were preserved; no Git commit or push was made.

## Final production verification

Deployment `dpl_7ZoWNNZ1Du8Zixm2WEMxCJK1j5wm` is READY and aliased to
https://kodlab-two.vercel.app. Runtime outputs are in `icn1`.
Type checking, lint, 43 JavaScript tests plus 93 root tests, and the production
build passed. Live Atlas save/reload passed for each course, the deployed Next.js
checker accepted a real solution, and 40 concurrent loads all succeeded (latest
p95 about 2.81 seconds from the client). The JavaScript browser exercise passed
and restored its code and completion after reloading.
Python also passed a real browser exercise on the final build. Both browser QA
drafts and completion were checked directly in Atlas, then their temporary
records were removed. The final deployment error-log query returned no entries.
