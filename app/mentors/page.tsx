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
      <div className="mb-8 grid max-w-3xl gap-3 md:grid-cols-[1.1fr_1fr] md:gap-8">
        <h1 className="text-4xl font-black tracking-tight">Tutor Directory</h1>
        <p className="text-muted-foreground text-lg leading-8">
          Browse vetted mentors by school, major, and affordability support focus.
        </p>
      </div>

      {tutors.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-sm">No tutors are publicly listed yet. Please check back soon.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.map((tutor) => (
            <Card key={tutor.id} className="h-full bg-white">
              <CardHeader className="grid gap-3">
                <CardTitle className="text-3xl leading-tight font-extrabold">{tutor.fullName}</CardTitle>
                <p className="text-muted-foreground text-base leading-7">
                  {tutor.school} · {tutor.major}
                </p>
                <Badge variant="secondary" className="font-semibold">
                  {tutor.timezone}
                </Badge>
              </CardHeader>
              <CardContent className="grid h-full content-start gap-4">
                <p className="text-base leading-8">{tutor.bio}</p>
                <p className="text-muted-foreground text-sm leading-7">
                  <span className="font-semibold">Specialties:</span> {tutor.specialties}
                </p>
                <p className="text-2xl font-black">${tutor.hourlyRate}/hr</p>
                <Button asChild className="mt-auto w-full bg-blue-600 font-semibold text-white hover:bg-blue-700">
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
