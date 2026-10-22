# Vercel Hobby capacity estimate

Allowance and benchmark baseline checked 2026-10-19. The project was transferred on 2026-10-20: **kodlab**, team **orgils-projects-610af89c**, production **https://kodlab-two.vercel.app**. The destination team was verified as **Hobby**. Runtime region: **icn1 (Seoul)**, matching the existing Atlas AWS Seoul cluster.

## Current published allowance

| Resource | Hobby allowance |
| --- | ---: |
| Function invocations | 1,000,000 / month |
| CDN requests | 1,000,000 / month |
| Active CPU | 4 CPU-hours / month |
| Provisioned memory | 360 GB-hours / month |
| Fast Data Transfer | 100 GB / month |
| Fast Origin Transfer | 10 GB / month |

Source: https://vercel.com/docs/plans/hobby (page updated 2026-09-14). These are team allowances, not a separate budget for every project. Other projects on the same team share these allowances. Before the account transfer, the CLI usage query returned `Costs not found (404)`; that historical result does not measure remaining allowance in the destination account. Current monthly headroom was not measured after transfer.

Hobby is for personal/non-commercial use. Exceeding limits can pause the affected service until the quota becomes available again; this estimate does not establish that an institutional/commercial use qualifies for Hobby.

## What consumes resources

Python and JavaScript student code executes in the browser. The Next.js rendered sandbox runs through Sandpack. Vercel serves static assets, loads/saves progress, and runs Next.js source checks. MongoDB storage and Atlas limits are separate from Vercel's quotas.

The shared sync client now saves routine changes at most once per five-second interval, skips identical snapshots, and saves on explicit page-leave flushes. Initial record creation and explicit flushes can add calls beyond that routine cadence. Error retries can also add requests.

Measured local asset sizes: Python's runtime is about **12.3 MB raw / 5.5 MB gzip**. All completed solution code is about 3.1 KB for Python, 5.7 KB for JavaScript and 14.0 KB for Next.js, before progress metadata or unusually long student code. A **10 KB average progress snapshot** and **8 MB cold page transfer** are planning assumptions, not billing measurements. HTTP caching reduces repeated transfer.

## One classroom example

Assume **40 students × 45 minutes × 20 school days/month**, one course login per student per session, and 20 Next.js checks per student per session. Python/JavaScript-only classes use fewer checker calls.

| Monthly workload | Typical edits, one save per 30 seconds | Continuous edits, five-second routine cap |
| --- | ---: | ---: |
| Logins | 800 | 800 |
| Progress saves | 72,000 | 432,000 |
| Next.js checker calls | 16,000 | 16,000 |
| Total function invocations, approximate | 88,800 (8.9% of allowance) | 448,800 (44.9%) |
| Progress request bodies at 10 KB each | 0.72 GB | 4.32 GB |
| Cold page transfer at 8 MB per session | 6.4 GB | 6.4 GB |

Request-body numbers are useful for planning origin traffic but are not a complete billed transfer measurement. Responses, headers, other origin traffic, retries and page-leave flushes add usage. At **20 KB** snapshots, the continuous-edit request bodies alone become **8.64 GB**, close to the 10 GB origin allowance. Larger drafts or several classes can therefore hit transfer limits before hitting the invocation limit.

Two equivalent classrooms at the continuous-edit cap approach 900,000 function invocations/month; three exceed one million. This is not a fixed student limit: the actual write rate, snapshot size, course mix and other projects determine usage.

## Checks and limits of the measurements

- A local 15-run checker benchmark used the actual course validator and a valid solution. Warm median: about **108 ms wall time / 179 ms process CPU time**. Local CPU includes the process's worker activity and is not Vercel billing data.
- At that CPU cost, 16,000 checks are about **0.8 CPU-hours**, before progress handlers, cold starts and platform overhead. Vercel hardware can differ.
- A deployed burst of **40 simultaneous progress loads** succeeded. After the final strict-review deployment, client-observed median was **2.78 s**, p95 **2.81 s**. These figures include network/TLS and are not pure function CPU or database latency.
- All three production course APIs saved/reloaded through Atlas. The deployed Next.js checker passed a real solution. Temporary API test records were removed.
- This was a bounded smoke/burst test, not a maximum-throughput benchmark or a sustained soak. Provisioned memory usage and actual current team quota consumption were not measured.

For one class, the normal workload is small relative to the published limits. Review actual Vercel Usage after the first real lesson; do not extrapolate the short burst into a guarantee of unlimited concurrent classes.

## Production configuration

MongoDB secrets are stored as production environment variables. The approved permanent Atlas `0.0.0.0/0` network rule permits Vercel's dynamic outbound IPs; authentication still uses the database user restricted to `kodlab`. This rule applies at the Atlas project network layer. The earlier temporary local-IP rule is no longer needed for production availability.

Static outbound IPs are a paid Pro feature, not part of this Hobby deployment: https://vercel.com/kb/guide/can-i-get-a-fixed-ip-address

The code was deployed from the current working tree. No Git commit or push was created by this task.
