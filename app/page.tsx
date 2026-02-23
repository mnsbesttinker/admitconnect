import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <section className="card" style={{ padding: "2rem" }}>
        <h1 style={{ marginTop: 0 }}>Affordable 1-on-1 mentorship from U.S. scholarship admits</h1>
        <p className="muted">
          Get practical application and financial-aid strategy sessions from verified mentors who secured scholarships and aid.
        </p>
        <div style={{ marginTop: "1rem" }}>
          <Link href="/mentors" className="btn">Find a mentor</Link>
        </div>
      </section>
    </div>
  );
}
