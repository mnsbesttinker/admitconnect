# AdmitConnect

AdmitConnect is a mentorship platform for international applicants seeking U.S. admissions and financial-aid guidance from verified tutors.

## Product direction (updated)

This repository should now prioritize the following functionality:

1. **Tutor onboarding and profile creation**
   - Tutors can sign up, create public profiles, write a service description, and set their own hourly rate.
   - Tutor profile includes positioning for students: background, what they offer, and tutoring focus.

2. **Verification workflow with document uploads**
   - During tutor signup/onboarding, tutors must upload proof documents for credentials/aid outcomes.
   - Any user with `admin` role can review submissions and **approve/reject** tutor verification.
   - Verification status controls whether a tutor is publicly visible/bookable.

3. **Commission model**
   - Tutors set their own hourly price.
   - Platform takes a **5% commission** from each paid session.

4. **Marketing-heavy landing page**
   - Home page should clearly explain:
     - Why AdmitConnect is a better alternative to competitors.
     - Why a financial-aid-first niche allows stronger outcomes for cost-sensitive students.
     - Why pricing can remain affordable for our audience profile.

5. **Student-initiated chat only**
   - Students can directly message tutors they are interested in.
   - Tutors must **not** initiate outreach to students unless the student has initiated contact first.

## Current status

This repository includes a runnable Next.js scaffold with:

- Public pages (home, mentors, pricing, FAQ, trust/policy placeholders)
- Booking flow tester UI (`/book`)
- Tutor application page (`/tutor/apply`) with profile, hourly rate, and credential document submission
- Admin verification page (`/admin/verification`) for approve/reject decisions
- Applicant and mentor dashboard stubs
- Seed/in-memory API routes for mentors, availability, bookings, payments, reviews, onboarding
- Initial Prisma schema baseline in `prisma/schema.prisma`

## Next implementation priorities

1. **Auth + RBAC**
   - Implement real auth and role enforcement (`student`, `tutor`, `admin`).

2. **Tutor onboarding app flow**
   - Build tutor onboarding form with profile fields, bio/offer text, hourly rate, and document attachments.
   - Persist in Postgres via Prisma (replace in-memory state).

3. **Admin verification console**
   - Queue of pending tutor profiles.
   - Document viewer/download links.
   - Approve/reject actions with notes.

4. **Pricing + payouts**
   - Convert current payment mocks to real Stripe flow.
   - Enforce 5% platform fee and record tutor payout amount per booking.

5. **Chat with policy controls**
   - Add thread model where first message must come from student.
   - Block tutor outbound thread creation without prior student message.

6. **Marketing page rewrite**
   - Replace generic hero with conversion-focused messaging aligned to aid-focused international applicants.

## Stack

- Next.js (App Router)
- PostgreSQL + Prisma
- NextAuth/Supabase Auth
- Stripe (payments)
- S3/Supabase Storage (documents)
- Resend/Postmark (notifications)
AdmitConnect is an MVP marketplace for international applicants to book 1-on-1 paid sessions with U.S. scholarship/financial-aid success mentors.

## Current status

This repository now includes a runnable **Next.js app scaffold** with:

- Home landing page
- Mentor directory (seeded mentors)
- Mentor profile pages
- Pricing page with fixed session menu
- FAQ + Trust & Safety + policy placeholders
- Booking flow tester page (`/book`)
- Applicant and mentor dashboard stubs (`/applicant`, `/mentor/dashboard`)
- Initial Prisma schema for core marketplace entities

## MVP goals

- Onboard verified mentors.
- Allow applicants to browse mentors and book fixed session types (15/45/90 min).
- Collect payments with platform commission.
- Track sessions, status, and post-session reviews.

## Stack choice (Option A)

- Next.js (frontend + API routes)
- PostgreSQL
- Prisma ORM
- NextAuth (or Supabase Auth)
- Stripe (payments)
- Resend/Postmark (email)
- S3/Supabase Storage (uploads)

## Repository layout

- `app/` — Next.js App Router pages for public MVP flow.
- `lib/mentors.ts` — seed mentor/session data for directory and profiles.
- `docs/mvp-plan.md` — product requirements, feature scope, and implementation plan.
- `prisma/schema.prisma` — initial database schema for MVP entities.

## Development plan

1. Set up Next.js app and Prisma migration workflow. ✅ (scaffold complete)
2. Implement auth and role-based access.
3. Launch public mentor directory + profile pages. ✅ (seeded static version)
4. Add mentor onboarding and admin approval flow.
5. Implement booking slots, Stripe checkout, and webhook confirmation.
6. Build applicant and mentor dashboards.
7. Add reviews, trust pages, policy pages, and launch metrics.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Existing API surface (currently seed/in-memory)

- `GET /api/mentors`
Then open `http://localhost:3000`.


## Implemented API endpoints (current milestone)

The following App Router endpoints are now available with seed/in-memory data:

- `GET /api/mentors` (supports `major`, `language`, `tag`, `q` query filters)
- `GET /api/mentors/:id`
- `GET /api/mentors/:id/reviews`
- `GET /api/mentors/:id/availability`
- `POST /api/mentors/onboard`
- `GET /api/admin/mentors/pending`
- `POST /api/admin/mentors/:id/approve`
- `POST /api/admin/mentors/:id/reject`
- `POST /api/reviews`
- `POST /api/bookings`
- `GET /api/bookings/my?applicant=...`
- `GET /api/bookings/mentor?mentorId=...`
- `POST /api/bookings/:id/cancel`
- `POST /api/bookings/:id/complete`
- `POST /api/payments/create-intent`
- `POST /api/payments/webhook`

## Notes

- The current booking/availability behavior is still seed-data based in memory and resets on dev-server restart.
- Replacing in-memory stores with database-backed persistence is a top next step.
