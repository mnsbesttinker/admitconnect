import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem", display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "2rem" }}>
        <h1 style={{ marginTop: 0 }}>Affordable 1-on-1 mentorship from U.S. scholarship admits</h1>
        <p className="muted">
          AdmitConnect is built specifically for international applicants optimizing for aid. We focus where most general admissions
          platforms do not: affordability strategy, aid positioning, and realistic planning for cost-sensitive families.
        </p>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.6rem" }}>
          <Link href="/mentors" className="btn">Find a mentor</Link>
          <Link href="/tutor/apply" className="btn" style={{ background: "#163f9c" }}>Become a tutor</Link>
        </div>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
        <article className="card">
          <h3 style={{ marginTop: 0 }}>Aid-first specialization</h3>
          <p className="muted">Mentors focus on scholarship and need-based aid outcomes, not generic admissions advice.</p>
        </article>

        <article className="card">
          <h3 style={{ marginTop: 0 }}>Verified tutor credibility</h3>
          <p className="muted">Tutors apply with identity and credential proof before becoming visible to students.</p>
        </article>

        <article className="card">
          <h3 style={{ marginTop: 0 }}>Transparent affordability</h3>
          <p className="muted">Simple pricing and low platform commission keeps sessions accessible for your target audience.</p>
        </article>
      </section>
    </div>
  );
}
