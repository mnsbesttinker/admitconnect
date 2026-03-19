"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/tutors", { cache: "no-store" });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || "Failed to load tutors.");
        }

        setTutors(payload.data as Tutor[]);
        setLoadError(null);
      } catch {
        setLoadError("We could not load the tutor directory right now. Please refresh shortly.");
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 lg:px-6">
      <header className="mb-8 max-w-3xl space-y-2">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Tutor Directory</h1>
        <p className="text-muted-foreground text-base leading-7 md:text-lg">
          Browse vetted mentors by school, major, and affordability support focus.
        </p>
      </header>

      {isLoading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-sm">Loading tutor directory…</p>
          </CardContent>
        </Card>
      ) : loadError ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-sm">{loadError}</p>
          </CardContent>
        </Card>
      ) : tutors.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-sm">No tutors are publicly listed yet. Please check back soon.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tutors.map((tutor) => (
            <Card key={tutor.id} className="h-full min-h-[24rem] bg-white">
              <CardHeader className="space-y-3">
                <div className="space-y-1">
                  <CardTitle className="text-2xl leading-tight font-extrabold">{tutor.fullName}</CardTitle>
                  <p className="text-muted-foreground text-sm leading-6">
                    {tutor.school} · {tutor.major}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="font-medium">
                    {tutor.timezone}
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground">
                    Open to new students
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grow content-start gap-4">
                <p className="text-sm leading-6 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4] overflow-hidden">
                  {tutor.bio}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tutor.specialties.split(",").map((specialty) => {
                    const label = specialty.trim();
                    if (!label) return null;
                    return (
                      <Badge key={`${tutor.id}-${label}`} variant="outline" className="font-normal">
                        {label}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="mt-auto flex items-center justify-between gap-4 border-t pt-5">
                <p className="text-xl font-black">${tutor.hourlyRate}/hr</p>
                <Button asChild className="bg-blue-600 font-semibold text-white hover:bg-blue-700">
                  <Link href={`/mentors/${tutor.id}`}>View profile</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
