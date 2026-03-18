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


## SHADCN MIGRATION EXECUTION PLAN (IN-PLACE)

This branch is dedicated to migrating the UI to Tailwind + shadcn/ui without changing Prisma, API routes, auth flow, or booking logic.

### Current migration status
- ✅ Tailwind + postcss setup is present.
- ✅ shadcn `components.json` exists and theme variables are in `app/globals.css`.
- ✅ Initial shadcn migration started for root layout, top navigation, and login page.
- 🔄 Remaining pages/components still use legacy CSS utility classes and inline styles.

### Working agreement (Agent vs Manual)

#### Part A — Completed by agent in this commit
1. Add first reusable shadcn-style primitives in `components/ui`:
   - `badge.tsx`
   - `card.tsx`
   - `input.tsx`
   - `label.tsx`
2. Migrate initial trust-surface files:
   - `app/layout.tsx`
   - `components/top-nav.tsx`
   - `app/login/page.tsx`
3. Keep backward compatibility by retaining old CSS classes in `app/globals.css` while migration is in progress.

#### Part B — Manual tasks for founder/team (required human decisions)
1. **Design direction lock-in**
   - Confirm final shadcn style direction (`radix-vega` already initialized).
   - Confirm color tone and brand voice (neutral vs higher-contrast tweaks).
2. **Navigation IA/content review**
   - Validate menu labels and grouping for conversion trust.
   - Confirm logged-in chip wording and what should be visible to guests.
3. **Copywriting polish**
   - Provide final copy for login/signup, landing sections, FAQ, legal pages.
4. **Visual QA on real devices**
   - Test desktop/tablet/mobile nav behavior and dropdown ergonomics.
   - Log any spacing/overflow/usability regressions for follow-up fixes.
5. **Acceptance sign-off per phase**
   - Sign off each phase below before old CSS is removed.

### Phase progress snapshot
- Phase 1 — Auth + Global Shell: **80%** (4/5 checklist items complete).
- Phase 2 — Marketplace trust surfaces: **75%** (3/4 checklist items complete).
- Phase 3 — Onboarding and dashboard forms: **100%** (6/6 checklist items complete).
- Phase 4 — Booking + admin operations: **100%** (4/4 checklist items complete).
- Phase 5 — Static/legal cleanup: **100%** (6/6 checklist items complete).
- Phase 6 — Legacy CSS retirement: **0%** (0/3 checklist items complete).

### Readability QA tracker (current sprint)
- [x] Landing page readability pass: stronger hierarchy, larger title/body line-height, and high-contrast primary CTA.
- [x] Tutor directory readability pass: larger heading typography, clearer metadata spacing, stronger price/CTA contrast.
- [x] Mentor profile readability pass: split "About" vs "Available slots" into clearly separated sections with better spacing.
- [x] Student onboarding readability pass: clearer two-column structure on desktop and stronger status/action legibility.

### Phased migration checklist (continue from here)

#### Phase 1 — Auth + Global Shell (in progress)
- [x] Root layout converted to Tailwind classes.
- [x] Top nav converted away from old `.top-nav`/`.nav-*` classes.
- [x] Login page migrated to shadcn primitives.
- [x] Signup page migration (`app/signup/page.tsx`).
- [ ] Remove auth-related legacy CSS rules no longer referenced.

#### Phase 2 — Marketplace trust surfaces
- [x] `app/page.tsx` (landing credibility sections)
- [x] `app/mentors/page.tsx`
- [x] `app/mentors/[id]/page.tsx`
- [ ] Introduce consistent card grid spacing tokens.

#### Phase 3 — Onboarding and dashboard forms
- [x] `app/tutor/onboarding/page.tsx`
- [x] `app/tutor/apply/page.tsx`
- [x] `app/student/onboarding/page.tsx`
- [x] `app/tutor/availability/page.tsx`
- [x] `app/messages/student/page.tsx`
- [x] `app/messages/tutor/page.tsx`

#### Phase 4 — Booking + admin operations
- [x] Remove legacy MVP booking/payment tester UI from `app/book/page.tsx`
- [x] `app/book/page.tsx`
- [x] `app/admin/verification/page.tsx`
- [x] Add `table`, `alert`, `skeleton`, `dialog` components when needed.

#### Phase 5 — Static/legal cleanup
- [x] `app/faq/page.tsx`
- [x] `app/privacy/page.tsx`
- [x] `app/terms/page.tsx`
- [x] `app/refund-policy/page.tsx`
- [x] `app/trust-safety/page.tsx`
- [x] `app/pricing/page.tsx`

#### Phase 6 — Legacy CSS retirement
- [ ] Remove unused `.container`, `.card`, `.btn`, `.badge`, `.muted`, `.form-grid`, `.nav-*` rules from `app/globals.css`.
- [ ] Keep only Tailwind import + shadcn tokens + truly global base styles.
- [ ] Run final regression sweep across all pages.

### Practical migration rule for each file
1. Replace inline `style={{...}}` with Tailwind classes.
2. Replace old utility classes with shadcn component + Tailwind composition.
3. Preserve functionality and API interactions exactly as-is.
4. Run lint/build after every batch.
5. Commit in small feature slices (`migrate auth`, `migrate mentors`, etc.).
