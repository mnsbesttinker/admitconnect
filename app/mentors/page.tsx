"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 grid gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Tutor Directory</h1>
        <p className="text-muted-foreground">Browse vetted mentors by school, major, and affordability support focus.</p>
      </div>

      {tutors.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-sm">No tutors are publicly listed yet. Please check back soon.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.map((tutor) => (
            <Card key={tutor.id} className="h-full">
              <CardHeader className="grid gap-2">
                <CardTitle className="text-xl">{tutor.fullName}</CardTitle>
                <p className="text-muted-foreground text-sm">
                  {tutor.school} · {tutor.major}
                </p>
                <Badge variant="secondary">{tutor.timezone}</Badge>
              </CardHeader>
              <CardContent className="grid gap-3">
                <p className="text-sm leading-6">{tutor.bio}</p>
                <p className="text-muted-foreground text-sm">Specialties: {tutor.specialties}</p>
                <p className="font-semibold">${tutor.hourlyRate}/hr</p>
                <Button asChild className="w-full sm:w-auto">
                  <Link href={`/mentors/${tutor.id}`}>View profile</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
