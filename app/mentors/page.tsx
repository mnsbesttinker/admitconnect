import Link from "next/link";
import { mentors } from "@/lib/mentors";

export const metadata = {
  title: "Mentor Directory | AdmitConnect"
};

export default function MentorDirectoryPage() {
  return (
    <div className="container">
      <h1>Mentor Directory</h1>
      <p className="muted">MVP static data with core filters to be wired in next iterations.</p>
      <div className="grid">
        {mentors.map((mentor) => (
          <article key={mentor.id} className="card">
            <h3 style={{ marginTop: 0 }}>{mentor.name}</h3>
            <p className="muted" style={{ marginTop: 0 }}>
              {mentor.university} · {mentor.major}
            </p>
            <p style={{ marginBottom: "0.5rem" }}>⭐ {mentor.rating} ({mentor.reviewCount} reviews)</p>
            <div style={{ marginBottom: "0.5rem" }}>
              {mentor.credibilityTags.map((tag) => (
                <span className="badge" key={tag}>{tag}</span>
              ))}
            </div>
            <p className="muted">{mentor.languages.join(" · ")}</p>
            <Link href={`/mentors/${mentor.id}`} className="btn">View profile</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
