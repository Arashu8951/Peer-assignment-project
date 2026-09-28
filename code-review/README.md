# PeerReview — Peer Code Review Platform for Students

Problem 10, Feature Set C. Students submit code, classmates are assigned to review it, reviewers leave detailed feedback, and everyone can track review status and history.

## Quick start

Requires Node.js 24 or newer (Node 20.19+ and 22.12+ also work). No database server is needed; data lives in a local SQLite file.

```bash
npm install
npm run setup     # creates dev.db, applies migrations, loads demo data
npm run dev       # http://localhost:3000
```

Run `npm run setup` again at any time to reset the demo data.

## Demo logins

Every account uses the password `password123`.

The demo data has 8 students, 11 submissions across all four statuses, 12 line comments, and a full activity timeline for each submission.

| Email | Own submissions | Reviews to do | Good for showing |
|---|---|---|---|
| `asha@example.com` | Pending, Approved | 0 | Dashboard with two statuses; history with 3 reviews given and 2 received |
| `ravi@example.com` | In review, Changes requested | 2 | Pending reviews on the dashboard; reviewers who disagree (one approves, one does not) |
| `meera@example.com` | Changes requested, Pending | 2 | Line comments pinned to code; a timeline where the author swapped a reviewer by hand |
| `dev@example.com` | Approved | 1 | Writing a review from scratch |
| `nina@example.com` | Approved | 0 | History with 3 reviews given |
| `kabir@example.com` | Changes requested | 1 | Two comments from different reviewers on the same line |
| `sara@example.com` | In review | 2 | Progress bar at 1 of 2 |
| `arjun@example.com` | Pending | 0 | A brand new submission with no feedback yet |

Suggested walkthrough: log in as **Asha** and submit new code to see two reviewers auto-assigned, then add or remove one. Log in as one of those reviewers, click line numbers to comment, fill the rubric, and submit. Log back in as Asha to see the status, inline comments, and timeline update. Finish on `/history`.

You can also register new accounts; they become candidates for assignment straight away.

## Features and where they live

| Requirement | Pages | Code |
|---|---|---|
| Code submission | `/submissions/new` | `src/server/submissions.ts` |
| Peer assignment | Automatic on submit; author can add or remove reviewers on `/submissions/[id]` | `src/server/assign.ts`, `src/server/reviews.ts` |
| Detailed feedback | `/reviews/[id]`: comments on specific lines, a three-part rubric (correctness, readability, structure, each 1–5), written summary, verdict | `src/components/ReviewForm.tsx`, `src/server/reviews.ts` |
| Review status | Badges and progress on `/dashboard` and `/submissions/[id]` | `src/server/status.ts` |
| Code review history | `/history` (reviews given and received, filterable) and the activity timeline on each submission | `src/server/reviews.ts`, `src/server/activity.ts` |

## How it works

**Architecture.** Next.js App Router. Pages are Server Components that read from the database directly; every change goes through a Server Action. The actions are thin: validate input with zod, check the session, call a function in `src/server/`, then revalidate. All rules live in `src/server/` as plain TypeScript with no React in it.

**Peer assignment.** When code is submitted, the two classmates with the lightest load are assigned, where load is the number of reviews a student has been given but not yet finished. Ties are broken randomly. The author is never a candidate. If fewer than two classmates exist, whoever is available is assigned. The author can add reviewers, or remove one who has not reviewed yet. The selection logic is a pure function, `pickReviewers`, separate from the database code.

**Review status.** Status is calculated from the reviews each time and is never stored, so it cannot fall out of step with them.

| Status | Meaning |
|---|---|
| Pending | No reviews submitted yet |
| In review | Some, but not all, reviews submitted |
| Changes requested | All submitted, at least one asks for changes |
| Approved | All submitted, all approve |

**History.** Every submission, assignment, removal, and review writes an activity event in the same database transaction as the change itself, so the timeline always matches the data.

**Access control.** A submission is visible only to its author and its assigned reviewers; anyone else gets a 404. Only the assigned reviewer can write a review, and a review cannot be edited once submitted. Every Server Action re-checks the session and ownership rather than relying on hidden buttons.

**Authentication.** Email and password. Passwords are hashed with bcrypt. The session is a signed JWT (HS256) in an httpOnly cookie. Login gives the same error for an unknown email and a wrong password.

## Data model

`User`, `Submission`, `Review` (one row per assigned reviewer; empty until submitted), `LineComment`, `ActivityEvent`. See `prisma/schema.prisma`.

## Tech stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prisma 7 with SQLite (`better-sqlite3` driver adapter), zod, jose, bcryptjs.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run setup` | Generate the Prisma client, apply migrations, reseed demo data |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` / `npm run lint` | Static checks |

## Not included

File uploads, multi-file submissions, resubmitting revised code, instructor accounts, notifications, syntax highlighting, automated tests, deployment configuration.
