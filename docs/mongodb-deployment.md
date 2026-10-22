# MongoDB student progress and hosting

All three courses ask for a student ID, load that student's saved progress from
`POST /api/progress`, and autosave drafts, completion, lesson selection and available
quiz state to MongoDB. IDs stay strings (leading zeroes are preserved). Progress
is isolated by course and normalized ID in `kodlab.student_progress`.

This is ID-only classroom access: knowing an ID allows reading and editing its
progress. It is not authenticated school records or an exam grading system. Do
not put names or other personal records in this database. PIN/SSO authentication
would be a separate change for stronger access control.

## Configure

Selected Atlas organization: Orgil's Org - 2024-11-27. Project: **Project 0**
(`6746c887fcdf4d50f88c60c9`). Existing free cluster: **Clusterbot1**.

1. Resume the cluster if paused.
2. Create a database user with `readWrite` on **kodlab**, not all databases.
3. Permit the application's actual egress address(es) in Atlas Network Access.
4. Copy the Node.js connection URI from Atlas Connect. Put the real URI in the
   ignored `.env.local` file for local use, or the hosting provider's secret
   environment settings. Do not commit or paste credentials into chat.

```dotenv
MONGODB_URI=mongodb+srv://<user>:<url-encoded-password>@<atlas-host>/?retryWrites=true&w=majority
MONGODB_DB=kodlab
```

Neither variable uses `NEXT_PUBLIC_`. Credentials stay in the server runtime.
MongoDB creates the database/collection on the first successful save. The `_id`
combines course and student ID, using MongoDB's existing unique index. No migration
or TTL deletion is required. Browser local storage is a fallback copy, not proof
of a successful server save. Login fails visibly when the server cannot load
progress, rather than replacing existing remote work with a blank profile.

Existing ID-specific Python/JavaScript data on the same origin is uploaded only
when the server has no record. Anonymous legacy Next.js work is left untouched
and is not assigned to an arbitrary student. Data from the old ChatGPT Site is
on a different origin and is not automatically migrated.

## Recommended deployment: Vercel

Deploy the repository root as a Next.js app. Install with `npm ci`, build with
`npm run build`, leave the default Next.js output configuration. Build prepares
both the JavaScript lab and the self-hosted Python runtime. Add the two server
variables above for the intended environment and redeploy after changing them.
Select a region near the Atlas cluster and configure Atlas network access for
the chosen deployment's egress networking. Do not automatically open Atlas to
all addresses. A public school URL should have visitor deployment protection
configured to match the intended student audience.

The currently aliased production deployment is exempt from Vercel's old-deployment
retention pruning. This is not a guarantee of service independent of account,
plan, usage limits or policy changes.
https://vercel.com/docs/deployment-retention

## ChatGPT Sites

The installed Sites runtime uses Cloudflare Workers with HTTP external
connections and no raw TCP. The standard MongoDB driver in this app requires
a separately hosted Node.js API if the frontend is moved to Sites. The existing
Next.js application is therefore simpler to deploy intact to Vercel.
The inspected Sites documentation does not specify a guaranteed hosting lifetime;
do not promise permanent hosting or a fixed expiration date.

Atlas free clusters automatically pause after 30 days of inactivity. This affects
database availability, independently of the frontend's hosting lifetime.
https://www.mongodb.com/docs/atlas/pause-terminate-cluster/

## Reliability and checks

Writes are debounced and serialized. A revision comparison rejects an outdated
browser's save with HTTP 409. Unsent edits remain in local storage; a conflict
control downloads them before choosing the newer server copy. Failed saves retry
while the page remains open; after closing, the same browser can recover pending
work. Wait for “Серверт хадгалагдсан” before switching devices. Storage-blocked
browsers cannot preserve unsent work across a browser close.

`npm test` includes API input and sync regression checks. To additionally exercise
real persistence against an isolated temporary local MongoDB:

```sh
MONGODB_TEST_BINARY=/opt/homebrew/bin/mongod npx tsx --test lib/student/mongodb.test.ts
```

This test launches its own loopback database, verifies persistence, isolation and
concurrent writes, shuts it down, then removes only its temporary database files.
It does not connect to Atlas. A live Atlas save/reload and deployment check still
require the real credentials, network access, and a running cluster.

## Verified setup (2026-10-19)

Clusterbot1 was resumed and is active. The `codelab` database user has readWrite
on `kodlab`. Live API save/reload checks passed for Python, JavaScript and Next.js;
the temporary verification records were removed. Local `.env.local` contains the
connection secret and is ignored by Git. The approved current-IP rule expires at
21:07 Ulaanbaatar time on 2026-10-19. No public deployment has been performed.

## Production deployment and follow-up review

Production is now at https://kodlab-two.vercel.app on Vercel Hobby in Seoul.
The user approved a permanent Atlas `0.0.0.0/0` network rule for Vercel dynamic
outbound IPs. Database authentication remains required, using the `codelab` user
restricted to `kodlab`. Live save/reload and Next.js checker verification passed.
See `code-quality-audit.md` and `vercel-capacity.md` for the additional review and
quota assumptions. Earlier local-only and not-yet-deployed notes describe the
initial setup stage.
