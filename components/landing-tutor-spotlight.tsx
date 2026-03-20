"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Tutor = {
  id: string;
  fullName: string;
  school: string;
  major: string;
  hourlyRate: number;
  specialties: string;
  isVerified?: boolean;
  profileImageUrl?: string | null;
};

export default function LandingTutorSpotlight() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTutors() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/tutors?scope=spotlight&limit=8", { cache: "no-store" });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Failed to load tutor spotlight.");
        }

        const items = (payload.data as Tutor[]) ?? [];
        setTutors(items);
        setActiveIndex(0);

        if (items.length === 0) {
          setLoadError("No tutors are available for spotlight yet.");
          return;
        }

        setLoadError(null);
      } catch {
        setLoadError("Tutor spotlight is temporarily unavailable. Please refresh in a moment.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadTutors();
  }, []);

  const activeTutor = useMemo(() => tutors[activeIndex] ?? null, [tutors, activeIndex]);
  const canNavigate = tutors.length > 1;

  function goPrevious() {
    if (!canNavigate) return;
    setActiveIndex((current) => (current - 1 + tutors.length) % tutors.length);
  }

  function goNext() {
    if (!canNavigate) return;
    setActiveIndex((current) => (current + 1) % tutors.length);
  }

  if (isLoading) {
    return (
      <Card className="bg-white">
        <CardContent className="py-8">
          <p className="text-muted-foreground text-sm">Loading tutor spotlight…</p>
        </CardContent>
      </Card>
    );
  }

  if (!activeTutor) {
    return (
      <Card className="bg-white">
        <CardContent className="py-8">
          <p className="text-muted-foreground text-sm">{loadError ?? "Tutor spotlight is unavailable right now."}</p>
        </CardContent>
      </Card>
    );
  }

  const specialties = activeTutor.specialties
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <Card className="overflow-hidden bg-white">
      <div className="grid gap-0 md:grid-cols-[280px_1fr]">
        <div className="relative min-h-64 md:min-h-full">
          {activeTutor.profileImageUrl ? (
            <Image
              src={activeTutor.profileImageUrl}
              alt={`${activeTutor.fullName} profile`}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 280px, 100vw"
            />
          ) : (
            <div className="bg-muted/40 flex h-full min-h-64 items-center justify-center border-r p-6 text-center">
              <div className="space-y-2">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border bg-white text-xl font-bold">
                  {activeTutor.fullName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Tutor profile image</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid content-between gap-5 p-4 sm:p-5 md:p-7">
          <CardHeader className="px-0">
            <div className="flex flex-wrap items-center gap-2">
              {activeTutor.isVerified && <Badge variant="secondary">Verified</Badge>}
              <Badge variant="outline">${activeTutor.hourlyRate}/hr</Badge>
            </div>
            <CardTitle className="mt-2 text-xl font-bold sm:text-2xl">{activeTutor.fullName}</CardTitle>
            <p className="text-muted-foreground text-sm">
              {activeTutor.school} · {activeTutor.major}
            </p>
          </CardHeader>

          <CardContent className="grid gap-4 px-0 pb-0">
            <div className="flex flex-wrap gap-2">
              {specialties.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="grid gap-3 border-t pt-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
              <div className="text-muted-foreground text-sm">
                {tutors.length > 1 ? `Tutor ${activeIndex + 1} of ${tutors.length}` : "Featured tutor"}
              </div>
              <div className="grid grid-cols-[1fr_1fr] gap-2 sm:flex sm:items-center">
                <Button type="button" variant="outline" size="sm" onClick={goPrevious} disabled={!canNavigate} className="h-10">
                  ←
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={goNext} disabled={!canNavigate} className="h-10">
                  →
                </Button>
                <Button asChild size="sm" className="col-span-2 h-10 bg-blue-600 text-white hover:bg-blue-700 sm:col-span-1 sm:h-9">
                  <Link href={`/mentors/${activeTutor.id}`}>View profile</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
