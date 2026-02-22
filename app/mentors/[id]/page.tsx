import Link from "next/link";
import { notFound } from "next/navigation";
import { getMentorById } from "@/lib/mentors";

export default function MentorProfilePage({ params }: { params: { id: string } }) {
  const mentor = getMentorById(params.id);

  if (!mentor) {
    notFound();
  }

  return (
    <div className="container">
      <Link href="/mentors" className="muted">← Back to mentors</Link>
      <section className="card" style={{ marginTop: "1rem" }}>
        <h1 style={{ marginTop: 0 }}>{mentor.name}</h1>
        <p className="muted">{mentor.university} · Class of {mentor.graduationYear} · {mentor.major}</p>
        <p>{mentor.bio}</p>

        <h3>Credibility</h3>
        <div>
          {mentor.credibilityTags.map((tag) => (
            <span className="badge" key={tag}>{tag}</span>
          ))}
        </div>

        <h3>Languages & Time Zone</h3>
        <p>{mentor.languages.join(", ")} · {mentor.timezone}</p>

        <h3>Session Types</h3>
        <ul>
          {mentor.sessionTypes.map((session) => (
            <li key={session.id}>
              {session.name} — ${session.priceUsd}
            </li>
          ))}
        </ul>

        <div style={{ marginTop: "1rem" }}>
          <button className="btn" type="button">Book (next step)</button>
        </div>
      </section>
    </div>
  );
}
