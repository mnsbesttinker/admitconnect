import Link from "next/link";

export default function ApplicantDashboardPage() {
  return (
    <div className="container">
      <h1>Applicant Dashboard</h1>
      <p className="muted">In this MVP stage, use your student session to inspect your own bookings.</p>

      <section className="card">
        <h3 style={{ marginTop: 0 }}>Quick check</h3>
        <p>
          After creating bookings from <Link href="/book">Book a Session</Link>, test:
        </p>
        <pre style={{ whiteSpace: "pre-wrap" }}>
{`GET /api/bookings/my`}
        </pre>
      </section>
    </div>
  );
}
