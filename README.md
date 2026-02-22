# AdmitConnect

AdmitConnect is an MVP marketplace for international applicants to book 1-on-1 paid sessions with U.S. scholarship/financial-aid success mentors.

## Current status

This repository now includes a runnable **Next.js app scaffold** with:

- Home landing page
- Mentor directory (seeded mentors)
- Mentor profile pages
- Pricing page with fixed session menu
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

Then open `http://localhost:3000`.


## Implemented API endpoints (current milestone)

The following App Router endpoints are now available with seed/in-memory data:

- `GET /api/mentors` (supports `major`, `language`, `tag`, `q` query filters)
- `GET /api/mentors/:id`
- `GET /api/mentors/:id/reviews`
- `GET /api/mentors/:id/availability`
- `POST /api/mentors/onboard`
- `POST /api/reviews`

Example:

```bash
curl "http://localhost:3000/api/mentors?language=english"
```

## MVP scope guardrails

Not included in first release:

- Complex mentor matching algorithm
- In-app chat
- Multi-currency
- Mobile apps
- AI essay review
- Subscriptions
