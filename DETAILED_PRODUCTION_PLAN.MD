Production-ready priorities (in the order I’d do them)
1) Add real Auth + RBAC (this is #1)

Right now, anyone can hit:

/api/admin/... approve/reject

/api/payments/webhook

/api/chat/...

/api/bookings/...

What to do

Add NextAuth (Auth.js) or Supabase Auth.

Enforce roles (applicant/student, mentor/tutor, admin) on every API route.

Replace “studentName” / “senderName” identity checks with session user id.

Concrete repo changes

Add middleware.ts for route protection (especially /admin/*, /mentor/*).

Add helper like requireRole(request, role) used in route handlers.

Update chat rules: thread creation must be student role only (you already enforce this logically, but it’s not secure without auth).

2) Replace the in-memory store with Prisma + Postgres

Right now your backend logic lives in lib/store.ts. In production, that file should become database queries.

What to do

Install Prisma and client:

prisma, @prisma/client

Add lib/prisma.ts singleton client.

Implement migrations + seed data.

API route rewrites needed

Replace calls like:

submitMentorOnboarding(...)

createBooking(...)

createPaymentIntent(...)

createStudentInitiatedThread(...)

…with Prisma CRUD and transactional logic.

Important DB fixes

Your schema currently doesn’t fully match your product:

Tutor hourly rate exists in onboarding payload (hourlyRateUsd) but not in Prisma MentorProfile.

Add hourlyRateUsd Int (or Decimal).

Upload requires bookingId, but tutor verification uploads happen before bookings.

Change uploads so they can attach to either:

mentorUserId (verification docs)

bookingId (session docs)

Decide whether sessions are:

fixed packages (15/45/90) OR

hourly rate chosen by tutor

(Right now you have both concepts floating around.)

3) Make uploads real (and safe)

Currently onboarding accepts Files but only stores file names.

What to do

Use S3 / Supabase Storage for uploads.

Store fileUrl, fileType, size, ownerUserId, and what it’s attached to.

Generate signed upload URLs (client uploads directly to storage).

Ensure documents are private (admins only for verification docs).

4) Stripe payments: do it “real”, not mocked

Right now:

/api/payments/create-intent returns a mock clientSecret

/api/payments/webhook accepts arbitrary JSON and marks payment “paid”
This is a huge production blocker.

What to do

Install Stripe SDK.

Create PaymentIntents server-side with the real amount.

Webhook must:

use raw request body

verify stripe-signature

be idempotent (don’t double-confirm)

Store Stripe IDs (payment_intent, charge, etc.)

Ensure booking confirmation happens only after verified webhook.

5) Data integrity & concurrency (marketplaces break here)

Your in-memory booking logic “locks” a slot by setting isBooked = true, but in production you need DB-level safety.

What to do

Use a DB transaction:

check slot is available

create booking

mark slot booked

commit

Add uniqueness constraints / indexes to prevent double booking:

e.g. (mentorUserId, startTimeUtc) unique (or similar)

6) Input validation, error handling, rate limiting

Most routes do basic checks, but production needs consistency.

What to do

Use zod schemas per route for request validation.

Add rate limiting to:

onboarding submission

chat message posting

login/signup

Standardize API responses and errors.

7) Observability + operations (you’ll want this on day 1)
What to add

Logging (pino or structured logs)

Error tracking (Sentry)

Health endpoint (/api/health)

Basic analytics events (mentor approved, booking paid, etc.)

8) Deployment readiness (minimum checklist)

Add these repo files:

.env.example (DATABASE_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STORAGE keys, AUTH keys)

Dockerfile (optional but helpful)

CI pipeline (GitHub Actions):

lint

typecheck

test

prisma migrate deploy (on deploy step)

Production headers in next.config.mjs (security headers)

Ensure secrets never leak to client (audit env usage)

The fastest “production-ready” path for THIS repo

If you want the shortest route without overbuilding:

Auth + RBAC

Prisma wired into your existing routes

Storage uploads (signed URLs)

Stripe PaymentIntent + verified webhook

Slot booking transaction safety

Admin verification uses DB + secure doc access

That gets you to a real, deployable MVP.
