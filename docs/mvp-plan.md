# AdmitConnect MVP Plan

## 1) Roles

### Applicant
- Browse mentors
- Book sessions
- Upload optional documents
- Pay for sessions
- Receive confirmations and call links
- Leave feedback and ratings

### Mentor
- Submit onboarding profile + verification documents
- Configure availability slots
- Accept bookings
- Join calls
- Optionally add session notes
- Track payout amounts

### Admin
- Approve/reject mentor verification
- Manage disputes and refunds
- Track commissions and payouts
- Feature mentors
- Monitor analytics

## 2) Session Menu

Fixed offerings:

- **15 min Quick Fix** — $20
- **45 min Deep Dive** — $55
- **90 min Full Review** — $100

Revenue split:

- Platform fee: 20%
- Mentor payout: 80%

## 3) User-Facing Pages

### Public
1. Home
2. Mentor Directory (filters)
3. Mentor Profile
4. Pricing
5. FAQ
6. Trust & Safety

### Applicant
7. Signup/Login
8. Checkout
9. Applicant Dashboard

### Mentor
10. Mentor Onboarding
11. Mentor Dashboard

### Admin
12. Admin Panel

## 4) Booking Flow

1. Applicant selects mentor and session type
2. Applicant picks available slot
3. Applicant signs up/logs in
4. Applicant pays
5. Booking confirmed
6. Meeting link generated
7. Automated reminders (24h + 1h)
8. Post-session review + optional mentor notes

## 5) Verification Policy

Mentors must submit:
- School + year
- Proof of scholarship/aid result (redacted allowed)
- Short summary of aid/scholarship strategy

Mentors are visible only after admin approval.

## 6) API Surface (MVP)

### Auth
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /me`

### Mentors
- `GET /mentors`
- `GET /mentors/:id`
- `POST /mentors/onboard`
- `POST /mentors/:id/availability`
- `GET /mentors/:id/availability`

### Booking + Payments
- `POST /bookings`
- `POST /payments/create-intent`
- `POST /payments/webhook`
- `GET /bookings/my`
- `GET /bookings/mentor`
- `POST /bookings/:id/cancel`
- `POST /bookings/:id/complete`

### Reviews
- `POST /reviews`
- `GET /mentors/:id/reviews`

### Admin
- `GET /admin/mentors/pending`
- `POST /admin/mentors/:id/approve`
- `POST /admin/mentors/:id/reject`
- `GET /admin/bookings`
- `POST /admin/bookings/:id/refund`

## 7) Compliance + Trust Copy

Must include:
- No guarantee of admission/aid
- Refund policy
- Privacy policy
- Terms of service
- Mentor verification explanation
- Policy against essay ghostwriting

## 8) Two-Week Build Plan

### Day 1–2
- Repository setup
- Postgres schema + auth
- Static mentor directory + profiles

### Day 3–4
- Mentor onboarding
- Admin approval flow
- Availability CRUD

### Day 5–6
- Booking creation
- Slot locking
- Meeting-link generation
- Applicant dashboard (upcoming sessions)

### Day 7–8
- Stripe checkout + webhooks
- Payment-to-booking confirmation sync

### Day 9–10
- Mentor dashboard (bookings + earnings)
- Reviews flow

### Day 11–14
- UI polish + transactional emails
- FAQ/trust pages
- Observability and deployment

## 9) Metrics (Track from launch)

- Mentor approval conversion
- Applicant-to-booking conversion
- Repeat bookings per applicant
- Average session hours per applicant
- Refund rate
- Mentor rating distribution
