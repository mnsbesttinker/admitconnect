import Link from "next/link";

export default function MentorDashboardPage() {
  return (
    <div className="container">
      <h1>Mentor Dashboard</h1>
      <p className="muted">MVP dashboard stub wired to booking APIs.</p>

      <section className="card">
        <h3 style={{ marginTop: 0 }}>Quick check</h3>
        <p>Query your mentor bookings with:</p>
        <pre style={{ whiteSpace: "pre-wrap" }}>
{`GET /api/bookings/mentor?mentorId=nora-mit`}
        </pre>
        <p>
          You can generate bookings from <Link href="/book">Book a Session</Link> and then check this endpoint.
        </p>
      </section>
    </div>
  );
}
