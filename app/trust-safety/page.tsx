import Link from "next/link";

export default function TrustSafetyPage() {
  return (
    <div className="container">
      <h1>Trust & Safety</h1>
      <section className="card">
        <h3 style={{ marginTop: 0 }}>Our commitments</h3>
        <ul>
          <li>No guaranteed admission or aid claims.</li>
          <li>Mentor verification before profiles are publicly visible.</li>
          <li>Mentorship and editing guidance only; no essay ghostwriting.</li>
          <li>Transparent pricing and refund rules.</li>
        </ul>
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Policy links</h3>
        <ul>
          <li><Link href="/refund-policy">Refund Policy</Link></li>
          <li><Link href="/privacy">Privacy Policy</Link></li>
          <li><Link href="/terms">Terms of Service</Link></li>
        </ul>
      </section>
    </div>
  );
}
