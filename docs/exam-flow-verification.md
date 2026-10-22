# Exam flow verification — 22 October 2026

Production: https://kodlab-two.vercel.app/exam
Deployment: kodlab-fft71jb23-orgils-projects-610af89c.vercel.app

## Fixes

- Every exam mutation now requires the student ID and attempt generation to match the current cookie. Old or mismatched pages cannot save, submit, run code, record a departure, or sign out the next student.
- Queued saves remain bound to the student/run that requested them.
- Answer editing, cancelling the submission dialog, and Escape are blocked during submission. A failed submission retains the answers and offers retry.
- Reopening a conflicting browser draft keeps its answers and original baseline visible instead of silently replacing the draft with the server copy.
- If the deadline has passed and the server preserves a rejected submission as a recovery copy, the page shows the finished state and recovery message rather than endlessly attempting to submit.
- Loading saved answers checks the student/run before replacing page state.

## Automated verification

164 tests passed (43 course workspace + 121 app), no skips. Includes a real local MongoDB instance, real API route handlers, and a rendered React workspace with controlled delayed/failed requests. Lint and the production build passed.

Coverage includes all 20 choices and six code responses, resume without extending the deadline, lost acknowledgments, edits during a pending save, failed submission and retry, duplicate submission, expiry recovery, teacher boundaries, resets, logout, stale pages, and a fresh next-student attempt.

Run:

```sh
MONGODB_TEST_BINARY=/opt/homebrew/opt/mongodb-community@7.0/bin/mongod npm test
npm run lint
npm run build
```

## Production verification

Disposable synthetic profiles were created with an explicit verification marker. API checks exercised login, save, resume, lost-acknowledgment retry, submit, duplicate submit, logout, second-student login and rejected stale writes.

In the browser, student A answered all 20 choices and entered six distinct code responses. A fresh exam page reopened all 26 answers. The exam submitted successfully. “Дараагийн сурагч” cleared the login form; student B started with zero answers and a fresh 35-minute timer, then submitted a different answer. Direct database comparison confirmed A's exact 26 responses and B's separate response. No console errors were reported by the second browser page.

Temporary exam profiles, attempts, sessions and recovery copies were removed afterward. No real student attempts were modified. The separately requested roster addition was 20S0424 — А.Танан, Orgilsaikhan's 7Г.

Evidence: `work/exam-full-flow-proof.json`, `work/exam-full-flow-tests.log`, `work/exam-full-flow-deploy.log`, `work/exam-full-flow-next-student.jpg`.

## Limits

This verifies the tested flows, not every possible device or internet failure. Offline work still needs a functioning browser draft store or a successful server backup. Late recovery copies require teacher review and do not automatically change official grades. Students starting a new exam should open a fresh page to receive the updated client.
