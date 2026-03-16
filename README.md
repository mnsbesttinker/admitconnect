# AdmitConnect

AdmitConnect is a mentorship platform for international applicants seeking U.S. admissions and financial-aid guidance from verified tutors.

## What changed

This project now uses a **real Prisma + PostgreSQL database path only** for auth users, tutor profiles, availability slots, and bookings.

- No file-backed Prisma mock fallback in `lib/prisma.ts`
- Tutor discovery and tutor availability endpoints are DB-backed
- Booking creation reads slot records from PostgreSQL with transactional slot-claim logic
- The service account integration was abandoned since it's unsuitable for AdmitConnect's booking flow.

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
RESEND_API_KEY="" 
RESEND_FROM_EMAIL="" 
GOOGLE_CALENDAR_ID=""
GOOGLE_OAUTH_CLIENT_ID=""
GOOGLE_OAUTH_CLIENT_SECRET=""
GOOGLE_OAUTH_REFRESH_TOKEN=""
```
## CURRENT PRIORITIES 

Further development of my marketplace will be using the following priority order. Optimize for early conversion, trust, and real-world usability for the first 5–10 users, not for overengineering or scale.

Current state:
- signup/auth works
- tutor/student onboarding works
- database works
- tutors can create availability
- students can book
- Google Meet link and calendar invite generation works

Goal:
Improve the platform in the order that most increases the chance of getting and retaining the first few real users.

Priority Tier 1 — Build now
1. Landing page trust upgrade
   - Show real tutors on landing page
   - Tutor cards with school, major, scholarship tags, SAT tags if relevant
   - Testimonials section
   - “How it works” section
   - Short founder/mission block

2. About page
   - Explain why peer mentors who actually secured scholarships are different from expensive consultancies
   - Clarify who the platform is for
   - Clarify what users should expect

3. Better profile system
   - Replace current split with:
     - Profile
     - My Onboarding
     - My Availability (tutors)
     - My Bookings (students)
     - My Slots / Active Bookings (tutors)
   - Make student onboarding visible to tutors for booked sessions

4. Tutor verification workflow
   - Tutors can submit profile and enter pending status
   - Admin can approve or deny
   - Only approved tutors are publicly visible/bookable
   - For now, document submission can remain manual through email, but the platform should support verification status clearly

5. Email verification enforcement
   - Require verified email before full account usage

Priority Tier 2 — Build after first sessions
6. Review system
   - Students can rate tutors after sessions
   - Tutor profile shows rating and reviews

7. Search/filter system
   - Filter tutors by tags like:
     - merit scholarship
     - need-based scholarship
     - athlete
     - 1550+ SAT
     - hourly rate

8. Payment system
   - Student pays through platform
   - Platform commission tracked
   - Tutor payout flow prepared

Priority Tier 3 — Later / polish
9. shadcn/ui migration for major UI surfaces
10. Admin dashboard
11. Security hardening / UX polish

Priority Tier 4 — Do not build now
12. AI matching algorithm

Implementation principles:
- Every feature should increase trust or conversion for the first users
- Prefer simple, clean, working solutions over overengineering
- Keep current booking and session flow intact
- If a feature can be done manually for now, don’t over-automate it
- Focus especially on landing page, tutor profiles, verification state, and usability


## Google Meet links for bookings

Bookings create a Google Meet space (Meet API) with `OPEN` access and include the returned Meet URL in both student/tutor confirmation emails.

If Meet generation fails, booking creation now returns an error payload with a `detail` field and releases the slot so the student can retry after configuration is fixed.


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

## Production DB quick-check

After setting `DATABASE_URL` on Vercel production and redeploying, open:

- `https://<your-domain>/api/health/db`

Expected response:

```json
{ "ok": true, "databaseReachable": true, "userTableExists": true }
```

If `ok` is false, the `error` field will tell you whether it is auth/network/migration related.




### Common gotchas

- Using an unverified sender address will block delivery.
- Using `www.yourdomain.com` instead of root domain in Resend can cause DNS mismatch.
- Forgetting to redeploy after adding env vars means the runtime may still have old values.
