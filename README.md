# AdmitConnect

AdmitConnect is a mentorship platform for international applicants seeking U.S. admissions and financial-aid guidance from verified tutors.

## SHADCN migration plan (split between Agent + Manual)

This migration will be done in phases so we can keep shipping while gradually replacing the current CSS system.

### Migration principles

- Keep backend/API/Prisma logic unchanged.
- Migrate UI in small, reviewable chunks.
- Keep legacy CSS classes temporarily (`.container`, `.card`, `.btn`, etc.) while pages are being converted.
- Prioritize trust/visibility surfaces first (navigation, auth, mentor discovery).

### Status snapshot

- ✅ **Done by agent (this commit):**
  - Added Tailwind import to global stylesheet (`@import "tailwindcss";`).
  - Added `postcss.config.mjs` configured with `@tailwindcss/postcss`.
  - Added `compilerOptions.baseUrl = "."` in `tsconfig.json` to align with shadcn alias expectations.
- ⏳ **Manual steps still required:** package install + shadcn initialization + phased page/component migration.

### Work split

#### Part 1 — Foundation (manual)

1. Create migration branch:

   ```bash
   git checkout -b feat/shadcn-migration
   ```

2. Install Tailwind packages:

   ```bash
   npm install -D tailwindcss @tailwindcss/postcss
   ```

3. Verify app boots after install:

   ```bash
   npm run dev
   ```

4. Verify PostCSS/Tailwind wiring is active (no build-time PostCSS plugin error):

   ```bash
   npm run build
   ```

#### Part 2 — shadcn init (manual)

1. Initialize shadcn for existing Next.js project:

   ```bash
   npx shadcn@latest init -t next
   ```

2. Recommended init answers:
   - style: `new-york`
   - base color: `slate`
   - css variables: `true`
   - rsc: `true`
   - tsx: `true`
   - global css file: `app/globals.css`
   - components alias path: `@/components/ui`
   - utils alias path: `@/lib/utils`

3. Add first component batch:

   ```bash
   npx shadcn@latest add button card input textarea label select badge checkbox dropdown-menu avatar separator alert skeleton table dialog sheet
   ```

4. Commit this as one isolated checkpoint commit.

#### Part 3 — Navigation + app shell (agent)

- Files:
  - `app/layout.tsx`
  - `components/top-nav.tsx`
- Target:
  - Replace custom nav classes + inline styles with shadcn/Tailwind primitives.
  - Use `Button`, `Badge`, and `DropdownMenu`.

#### Part 4 — Auth pages (agent)

- Files:
  - `app/login/page.tsx`
  - `app/signup/page.tsx`
- Target:
  - Convert to `Card`, `Input`, `Label`, `Button`, `Select`, `Alert`.

#### Part 5 — Marketplace pages (agent)

- Files:
  - `app/page.tsx`
  - `app/mentors/page.tsx`
  - `app/mentors/[id]/page.tsx`
- Target:
  - Use `Card`, `Badge`, `Avatar`, `Button`, `Separator`.

#### Part 6 — Form-heavy tutor/student flows (split)

- Agent migrates structure/components; manual QA validates form behavior for each role.
- Files:
  - `app/tutor/onboarding/page.tsx`
  - `app/tutor/apply/page.tsx`
  - `app/student/onboarding/page.tsx`
  - `app/tutor/availability/page.tsx`
  - `app/messages/student/page.tsx`
  - `app/messages/tutor/page.tsx`

#### Part 7 — Booking/admin utilities (split)

- Files:
  - `components/booking-flow.tsx`
  - `app/book/page.tsx`
  - `app/admin/verification/page.tsx`
- Use `Table`, `Select`, `Card`, `Badge`, `Alert`, `Skeleton`, `Dialog` where useful.

#### Part 8 — Static/legal pages (agent)

- Files:
  - `app/faq/page.tsx`
  - `app/privacy/page.tsx`
  - `app/terms/page.tsx`
  - `app/refund-policy/page.tsx`
  - `app/trust-safety/page.tsx`
  - `app/pricing/page.tsx`

#### Part 9 — Cleanup + hardening (manual + agent)

1. Remove obsolete legacy classes from `app/globals.css` only after all pages are migrated.
2. Run full pass:

   ```bash
   npm run lint
   npm run build
   ```

3. Manual UX pass:
   - desktop + mobile responsive spot-check
   - role-based auth surfaces
   - booking flow end-to-end check

### Manual QA checklist (run after each phase)

- [ ] No broken spacing/layout regressions on desktop.
- [ ] No form submission regressions.
- [ ] Error/success states are still visible and readable.
- [ ] Nav menu and auth actions remain functional.
- [ ] No legacy class removed before all dependent files are migrated.


## What changed

This project now uses a **real Prisma + PostgreSQL database path only** for auth users, tutor profiles, availability slots, and bookings.

- No file-backed Prisma mock fallback in `lib/prisma.ts`
- Tutor discovery and tutor availability endpoints are DB-backed
- Booking creation reads slot records from PostgreSQL with transactional slot-claim logic

## Stack

- Next.js (App Router)
- PostgreSQL + Prisma
- TypeScript
- Resend (optional email integration)

## Required environment variables

Create `.env.local` (or copy from `.env.example`):

```bash
DATABASE_URL="postgresql://admitconnect:admitconnect@localhost:5432/admitconnect?schema=public"
ADMITCONNECT_SESSION_SECRET="replace-with-a-long-random-secret"
RESEND_API_KEY="" # optional
RESEND_FROM_EMAIL="" # optional
GOOGLE_CALENDAR_ID=""
GOOGLE_OAUTH_CLIENT_ID=""
GOOGLE_OAUTH_CLIENT_SECRET=""
GOOGLE_OAUTH_REFRESH_TOKEN=""
GOOGLE_SERVICE_ACCOUNT_EMAIL=""
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=""
```


## Google Meet links for bookings

Bookings create a Google Meet space (Meet API) with `OPEN` access and include the returned Meet URL in both student/tutor confirmation emails.

Choose one auth mode:

1. **OAuth refresh token (recommended):**
   - Set `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REFRESH_TOKEN`.
   - Use a Google account that owns (or can edit) the target calendar.
2. **Service account (advanced):**
   - Set `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`.
   - Share the target Google Calendar with the service-account email (Editor access).
   - Service-account mode creates the event + Meet link **without Calendar attendees** to avoid Google's `forbiddenForServiceAccounts` restriction. Student/tutor receive the Meet URL through Resend confirmation emails.

Set `GOOGLE_CALENDAR_ID` if you also want a companion Calendar event created with the Meet URL in its description/location. Calendar event creation is optional and booking continues even if event creation fails.

If Meet generation fails, booking creation now returns an error payload with a `detail` field and releases the slot so the student can retry after configuration is fixed.


## Run a local PostgreSQL database

```bash
npm run db:up
```

This starts Postgres via `docker-compose.yml` on `localhost:5432`.

## Initialize database schema

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
```

For deployment environments, use:

```bash
npm run prisma:migrate:deploy
```

## Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.


## View and manage database data

### Option A: Prisma Studio (easiest UI)

```bash
npm run prisma:studio
```

Then open the local URL shown in terminal (usually `http://localhost:5555`).

You can:
- browse tables (`User`, `TutorProfile`, `AvailabilitySlot`, `Booking`)
- create rows
- edit rows inline
- delete rows

### Option B: SQL shell (direct Postgres access)

```bash
npm run db:shell
```

Useful commands inside `psql`:

```sql
-- list tables
\dt

-- see users
SELECT id, email, role, timezone, "createdAt" FROM "User" ORDER BY "createdAt" DESC;

-- delete one booking by id
DELETE FROM "Booking" WHERE id = 'REPLACE_WITH_BOOKING_ID';

-- delete one user by email (cascades related profile/slots/bookings)
DELETE FROM "User" WHERE email = 'name@example.com';
```

### Reset all local data

```bash
npm run db:reset
```

This drops and recreates the schema from migrations (destructive).

## API surface (active)

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/tutors`
- `GET /api/tutors/:id`
- `GET /api/mentors`
- `GET /api/mentors/:id`
- `GET /api/mentors/:id/availability`
- `POST /api/profiles/tutor`
- `POST /api/availability`
- `GET /api/availability`
- `POST /api/bookings`
- `GET /api/bookings/my`
- `GET /api/health/db`

## Notes

- Chat/admin verification/review flows still include MVP placeholders and some in-memory logic.
- Core tutor profile + slot + booking flow is now persisted to PostgreSQL.
- Signup confirmations and booking confirmations are delivered through Resend when `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are configured; otherwise they are logged as stubs.


## Troubleshooting

- **`npm error Missing script: "prisma:studio"`**
  - Your local checkout is likely behind the latest `package.json`.
  - Run:

```bash
git pull
npm install
npm run
```

  - Then use either `npm run prisma:studio` or alias `npm run db:studio`.

- **Prisma commands fail with `prisma: command not found`**
  - Run `npm install` first so local binaries are available in `node_modules/.bin`.


## Production DB quick-check

After setting `DATABASE_URL` on Vercel production and redeploying, open:

- `https://<your-domain>/api/health/db`

Expected response:

```json
{ "ok": true, "databaseReachable": true, "userTableExists": true }
```

If `ok` is false, the `error` field will tell you whether it is auth/network/migration related.


- **PrismaClientInitializationError on Vercel about outdated Prisma Client**
  - This repo now runs `prisma generate` automatically in both `postinstall` and `build`.
  - If your deployment was created before this fix, trigger a fresh redeploy so dependencies rebuild and Prisma Client regenerates.

## Vercel domain + Resend setup (step-by-step)

If you already bought a domain in Vercel, you can use that same domain for transactional email (signup + booking confirmations).

### 1) Create your Resend account/dashboard access

1. Go to [https://resend.com](https://resend.com) and sign in (GitHub/Google/email is fine).
2. After login, you are in the **Resend Dashboard**.
3. In the left sidebar, open **Domains**.

> You do not access Resend from the Vercel dashboard directly; they are separate dashboards.

### 2) Add your Vercel-managed domain in Resend

1. In Resend **Domains**, click **Add domain**.
2. Enter your root domain (for example: `yourdomain.com`, not `www.yourdomain.com`).
3. Resend will show the DNS records required for verification (usually SPF + DKIM records).

Keep this page open because you will copy those records into Vercel DNS next.

### 3) Add Resend DNS records in Vercel

1. Open [https://vercel.com/dashboard](https://vercel.com/dashboard).
2. Go to your project (or Team) → **Domains**.
3. Click your domain → **DNS Records**.
4. Add every record exactly as Resend shows it:
   - `TXT` for SPF
   - `CNAME` records for DKIM
   - Any additional `TXT`/`MX` that Resend requests
5. Save each record.

### 4) Verify the domain in Resend

1. Return to Resend **Domains**.
2. Click **Verify DNS Records** (or wait for auto-check).
3. Once verified, create/use a sender like `hello@yourdomain.com`.

If verification is pending, wait a few minutes and retry.

### 5) Add email env vars in Vercel

In Vercel project settings, add:

- `RESEND_API_KEY` = your Resend API key (Resend Dashboard → API Keys)
- `RESEND_FROM_EMAIL` = verified sender (example: `hello@yourdomain.com`)

Set these at least for the **Production** environment, then redeploy.

### 6) Confirm your app is using real delivery

This app sends real email only when both `RESEND_API_KEY` and `RESEND_FROM_EMAIL` exist.
If missing, it falls back to stubbed console logging.

Quick production check:

1. Redeploy after adding env vars.
2. Trigger a flow that sends email (signup confirmation or booking confirmation).
3. In Resend Dashboard, open **Logs** and confirm delivery events.

### 7) End-to-end smoke test

1. Open your production site.
2. Create a fresh user via signup.
3. Confirm signup email appears in the recipient inbox.
4. Book a session and confirm booking email appears.
5. Check Resend logs for both events.

### Common gotchas

- Using an unverified sender address will block delivery.
- Using `www.yourdomain.com` instead of root domain in Resend can cause DNS mismatch.
- Forgetting to redeploy after adding env vars means the runtime may still have old values.
