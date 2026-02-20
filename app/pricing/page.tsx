import { sessionTypes } from "@/lib/mentors";

export default function PricingPage() {
  return (
    <div className="container">
      <h1>Pricing</h1>
      <p className="muted">Fixed session menu for MVP. Platform fee (20%) is included in listed prices.</p>
      <div className="grid">
        {sessionTypes.map((session) => (
          <article key={session.id} className="card">
            <h3 style={{ marginTop: 0 }}>{session.name}</h3>
            <p className="muted">{session.minutes} minutes</p>
            <p style={{ fontSize: "1.4rem", fontWeight: 700 }}>${session.priceUsd}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
