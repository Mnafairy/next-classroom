# КодЛаб · Багшийн орчин

Production: https://kodlab-two.vercel.app/admin

Багш нар хэсэгт нэр, сургуулийн имэйл, заадаг ангиуд болон тухайн багшийн сурагчдын тоо харагдана. Багш бүр зөвхөн JSON жагсаалтад өөрт нь хуваарилсан сурагч, анги, өөрийн багшийн мэдээллийг харна. Ижил 7А ангид заадаг ч бусад багшийн сурагчид харагдахгүй. Сервер жагсаалт, дэлгэрэнгүй, өөрчлөлт бүр дээр эрхийг шалгана.

- Багш бүр өөрийн нэвтрэх нэр эсвэл сургуулийн имэйл, нууц үгээр нэвтэрнэ. Нэвтрэлт 8 цаг хүчинтэй; «Гарах» товч тухайн нэвтрэлтийг хүчингүй болгоно.
- Сурагч ижил ID-гаар Python, JavaScript, Next.js хичээлд ажиллахад нэг сурагчийн гурван ахиц болж харагдана. ID нь сурагчийг таних түлхүүр; өөр ID-уудыг автоматаар нэгтгэхгүй.
- Зөвхөн импортолсон, идэвхтэй сурагчийн ID хичээлд орох, ахиц унших/хадгалах боломжтой. ID-гаар хуваарилах нь шинэ сурагч үүсгэхгүй.
- Идэвхтэй багш HTML & CSS, Python, JavaScript, Next.js хичээлд бүртгэл дэх овог, нэрээ эсвэл `orgilsaikhan.ch` зэрэг нэвтрэх нэрээ бичиж орно. Том, жижиг үсэг ялгахгүй. Нэр давхцвал нэвтрэх нэрээ ашиглана. Аль алинаар нь ороход өмнөх дадлагын ахиц хэвээр байна. Хичээлд нэрээр орох нь багшийн орчинд нэвтрэх эрх өгөхгүй; `/admin` хэсэг нууц үгээ шаардана. Шалгалт зөвхөн бүртгэлтэй сурагчдад нээлттэй хэвээр.
- Нэг сурагч нэг ангид харьяалагдана. Өөрийн нэмэлт анги үүсгэх, нэр солих, сурагчдыг олноор нь хуваарилах эсвэл ангийг нь солих боломжтой.
- Сурагчийн дэлгэрэнгүйд нэр, анги, багшийн тэмдэглэлээ хадгална. Тэмдэглэл сурагчдад харагдахгүй. Сурагчийн код, ахицад өөрчлөлт хийхгүй.
- Дасгалын дууссан/жишээ үзсэн/эхэлсэн төлөв, хадгалсан код, Next.js хариултууд, Python ба JavaScript сорилын үр дүн, чөлөөт кодыг харж болно.
- Ахиц нь сурагчийн хадгалсан шалгалтын үр дүн; дахин үнэлсэн эсвэл багшаар баталгаажсан дүн биш. «Сүүлд хадгалсан» нь хамгийн сүүлийн өөрчлөлтийн хугацаа; зөвхөн нэвтэрсэн цаг биш.
- Жагсаалт харагдаж байх үед минут тутам шинэчлэгдэнэ. CSV нь тухайн хайлт, шүүлтэд таарсан сурагчдыг экспортолно.

## LMS import and accounts

Dry run: `npx tsx scripts/import-lms-roster.ts /absolute/path/roster.json`. Apply: add `--apply`. The importer validates the entire source first, backs up existing groups/profiles/accounts to an owner-readable ignored `work/` file, merges by stable source IDs/student codes, and preserves exercise progress and teacher notes. Reruns preserve passwords that teachers have chosen. No source JSON or student roster is copied into deployable assets.

Only student codes, display names, class membership, teacher relationships and source IDs are retained for students. Classes retain name, grade and teacher relationships. Teachers retain username, name and school email. Gender, student email, course content, departments, and extra status/enrollment fields are omitted.

Accounts with `setupRequired: true` can enter their school email as the temporary password at `/admin`, then must choose a new password of at least 12 characters before receiving an admin session. Saving the new password removes `setupRequired`, so the email stops working as a temporary password. An email cannot be chosen as the new password. This email-based setup is the school administrator's requested onboarding flow.

The importer also generates an individual one-time setup code for each new teacher and for each existing account whose stored password still equals its email. It writes codes to an owner-readable file in the ignored `work/` directory before updating the corresponding accounts. The import prints the file path. These codes remain usable for setup. Re-importing preserves passwords that teachers have already chosen. On rollout, re-run the importer with the current roster to provision legacy accounts. Earlier admin sessions require a fresh login.

`ADMIN_RATE_LIMIT_KEY` is an independent private environment variable used to hash network addresses in login throttling. Configure it on Vercel from ignored `work/admin-rate-limit-key.txt`. Do not use a NEXT_PUBLIC variable. There is no public account-creation endpoint.

Run `npx tsx scripts/backfill-admin-summaries.ts` for old progress records. It preserves drafts and completion data; future saves update summaries automatically.

## Storage and access

`student_progress` retains learner work and a small server-generated `adminSummary`. `student_profiles` stores names, class IDs, and teacher notes; `student_groups` stores classes. Each admin account has its own password hash. Sessions use cryptographically random opaque cookies; only SHA-256 token digests are stored in `admin_sessions`. Session expiry is enforced on every request. MongoDB TTL indexes clean expired session/rate-limit records. Login is limited to 10 attempts per 15-minute window per network address, stored as a keyed digest, including across Vercel instances.

Admin APIs enforce the database-backed session independently of the page. Cookies are HttpOnly, SameSite Strict, and Secure over HTTPS. Writes validate same-origin requests and bounded JSON. Responses are private/no-store. Student APIs cannot access teacher metadata or session collections. Saved code is rendered as text, never executed in the admin dashboard. CSV cells are escaped against spreadsheet formulas.

The roster currently caps each source collection at 10,001 rows and classes at 500, and shows a warning when the roster limit is reached. Details load one selected exercise at a time. Each student row has a confirmed delete action that archives the profile, hides it and blocks student access while preserving saved work. The notice offers Undo; restore is restricted to the teacher who deleted the profile. Imported class names are maintained through the source import. Unlisted legacy records are reconciled separately with private backups before removal; ambiguous IDs must never be guessed.

## Teacher workspace redesign (2026-10-20)

The roster opens with recently saved work first. Search, class selection, course selection and progress-state tabs use one shared view calculation; choosing a course keeps students with no saved work visible. Counts and CSV exports use the same selected scope. A full roster is paged in groups of 25; per-class totals stay visible.

The sidebar folds into a class menu on phones, and table rows become student cards with all three course summaries. Profile editing is collapsed on smaller screens so the saved work is reached first. Delete uses the dashboard's own named confirmation dialog and provides a Restore action; it does not use a browser confirmation popup.

The existing Vercel project, production domain and server-only environment settings now belong to **orgils-projects-610af89c**. Deploy with `vercel deploy --prod --yes --scope orgils-projects-610af89c` after checking `vercel whoami --format json`. The live hostname stays https://kodlab-two.vercel.app.

## Teacher-managed student enrollment

Teachers can use **Сурагч нэмэх** on `/admin` to enter a student ID, name, and class. The class selector contains only the signed-in teacher's classes and defaults to the current class. After creation, the dashboard shows the new student and a success message.

`POST /api/admin` action `create-student` requires an authenticated teacher and a same-origin request. The server normalizes IDs to uppercase and validates the school format (two digits, Latin S, four digits, such as `20S0452`), a nonempty name up to 80 characters, and ownership of the selected class. New profiles have `sourceId: manual:<ID>`, `manualEnrollment: true`, and only the signed-in teacher in `teacherIds`; caller-supplied teacher IDs are ignored.

Creation does not overwrite or restore existing profiles, progress, or exam attempts. An exact retry for the same teacher's active manual enrollment succeeds without modifying the record. Other duplicate IDs return a conflict. Enrolling a student already assigned to another teacher requires school administrator review.

Verified on 22 October 2026: 165 tests passed without skips, lint and production build passed, and a temporary student was created through the live form. Production checks confirmed class scope, teacher visibility, duplicate handling and lesson access. The test profile was removed afterward.
