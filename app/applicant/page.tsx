import Link from "next/link";

export default function ApplicantDashboardPage() {
  return (
    <div className="container">
      <h1>Applicant Dashboard</h1>
      <p className="muted">In this MVP stage, use the API to inspect your bookings by applicant name.</p>

      <section className="card">
        <h3 style={{ marginTop: 0 }}>Quick check</h3>
        <p>
          After creating bookings from <Link href="/book">Book a Session</Link>, test:
        </p>
        <pre style={{ whiteSpace: "pre-wrap" }}>
{`GET /api/bookings/my?applicant=Tymur`}
        </pre>
      </section>
    </div>
  );
}
