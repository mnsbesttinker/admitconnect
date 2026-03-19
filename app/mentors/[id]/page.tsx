"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Slot = { id: string; startTimeUtc: string; endTimeUtc: string };
type Tutor = {
  id: string;
  fullName: string;
  school: string;
  major: string;
  bio: string;
  specialties: string;
  hourlyRate: number;
  slots: Slot[];
};

type Viewer = { timezone?: string | null; role: "student" | "tutor" | null } | null;

export default function MentorProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [viewer, setViewer] = useState<Viewer>(null);
  const [status, setStatus] = useState("Ready");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const tutorRes = await fetch(`/api/tutors/${params.id}`, { cache: "no-store" });
        const tutorPayload = await tutorRes.json();

        if (!tutorRes.ok) {
          setTutor(null);
          setLoadError(tutorPayload.error || "Failed to load tutor profile.");
          setIsLoading(false);
          return;
        }

        setTutor(tutorPayload.data as Tutor);

        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        if (meRes.ok) {
          const me = (await meRes.json()) as { data: Viewer };
          setViewer(me.data);
        } else {
          setViewer(null);
        }
      } catch {
        setTutor(null);
        setLoadError("Failed to load tutor profile.");
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [params.id]);

  async function bookSlot(slotId: string) {
    setStatus("Booking...");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slotId }),
        signal: controller.signal
      });

      const isJson = (response.headers.get("content-type") || "").includes("application/json");
      const payload = isJson ? (await response.json()) as { error?: string; detail?: string; data?: { id: string } } : null;

      if (!response.ok) {
        const detail = payload?.detail ? ` (${payload.detail})` : "";
        setStatus((payload?.error || `Booking failed (HTTP ${response.status})`) + detail);
        return;
      }

      if (!payload?.data?.id) {
        setStatus("Booking created but server returned an unexpected response shape.");
        return;
      }

      router.push(`/bookings/success/${payload.data.id}`);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setStatus("Booking request timed out after 60s. Please retry; if this persists, verify Google Calendar credentials.");
      } else if (error instanceof Error) {
        setStatus(`Booking failed before completion: ${error.message}`);
      } else {
        setStatus("Booking failed before completion due to an unknown client/network error.");
      }
    } finally {
      window.clearTimeout(timeout);
    }
  }

  const zone = viewer?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <p className="text-muted-foreground text-base">Loading tutor...</p>
      </div>
    );
  }

  if (loadError || !tutor) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <Link href="/mentors" className="text-muted-foreground text-sm hover:underline">
          ← Back to tutors
        </Link>
        <Card className="mt-4 bg-white">
          <CardHeader>
            <CardTitle>Tutor unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{loadError || "Tutor not found."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Link href="/mentors" className="text-muted-foreground text-sm hover:underline">
        ← Back to tutors
      </Link>

      <Card className="mt-5 bg-white">
        <CardHeader className="grid gap-5 border-b pb-6">
          <CardTitle className="text-4xl font-black tracking-tight">{tutor.fullName}</CardTitle>
          <p className="text-muted-foreground text-lg leading-8">
            {tutor.school} · {tutor.major}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="font-semibold">
              ${tutor.hourlyRate}/hr
            </Badge>
            <Badge variant="outline" className="font-semibold">
              {zone}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="grid gap-7 pt-6 lg:grid-cols-[1.2fr_1fr]">
          <section className="grid gap-4">
            <h3 className="text-xl font-bold">About this tutor</h3>
            <p className="text-base leading-8">{tutor.bio}</p>
            <p className="text-base leading-8">
              <span className="font-semibold">Specialties:</span> {tutor.specialties}
            </p>
          </section>

          <section className="grid gap-4 rounded-lg border bg-muted/20 p-4">
            <h3 className="text-xl font-bold">Available slots ({zone})</h3>
            {tutor.slots.length === 0 && <p className="text-muted-foreground text-sm">No slots available right now.</p>}
            <div className="grid gap-3">
              {tutor.slots.map((slot) => (
                <Card key={slot.id} className="bg-background py-4">
                  <CardContent className="grid gap-3 px-4">
                    <p className="text-sm leading-6">
                      {new Date(slot.startTimeUtc).toLocaleString([], { timeZone: zone })} →{" "}
                      {new Date(slot.endTimeUtc).toLocaleTimeString([], { timeZone: zone })}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        disabled={viewer?.role !== "student"}
                        onClick={() => bookSlot(slot.id)}
                        className="bg-blue-600 font-semibold text-white hover:bg-blue-700"
                      >
                        Book this slot
                      </Button>
                      {viewer?.role !== "student" && (
                        <p className="text-muted-foreground text-xs">Only logged-in students can book.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </CardContent>
      </Card>

      <p className="mt-4 text-sm">
        <span className="font-semibold">Status:</span> {status}
      </p>
    </div>
  );
}
