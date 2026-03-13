# AdmitConnect

AdmitConnect is a mentorship platform for international applicants seeking U.S. admissions and financial-aid guidance from verified tutors.

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


### Common gotchas

- Using an unverified sender address will block delivery.
- Using `www.yourdomain.com` instead of root domain in Resend can cause DNS mismatch.
- Forgetting to redeploy after adding env vars means the runtime may still have old values.
