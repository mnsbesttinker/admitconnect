"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Tutor = {
  id: string;
  fullName: string;
  timezone: string;
  school: string;
  major: string;
  bio: string;
  specialties: string;
  hourlyRate: number;
};

export default function MentorDirectoryPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/tutors", { cache: "no-store" });
      const payload = await response.json();
      if (response.ok) {
        setTutors(payload.data as Tutor[]);
      }
    }

    void load();
  }, []);

  return (
    <div className="container">
      <h1>Tutor Directory</h1>
      <div className="grid">
        {tutors.map((tutor) => (
          <article key={tutor.id} className="card">
            <h3 style={{ marginTop: 0 }}>{tutor.fullName}</h3>
            <p className="muted">{tutor.school} · {tutor.major}</p>
            <p>{tutor.bio}</p>
            <p className="muted">Specialties: {tutor.specialties}</p>
            <p><strong>${tutor.hourlyRate}/hr</strong></p>
            <Link href={`/mentors/${tutor.id}`} className="btn">View profile</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
