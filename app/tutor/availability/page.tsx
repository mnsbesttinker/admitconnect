"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type Slot = {
  id: string;
  startTimeUtc: string;
  endTimeUtc: string;
  isBooked: boolean;
};

const datetimeClassName =
  "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export default function TutorAvailabilityPage() {
  const [status, setStatus] = useState("Ready");
  const [slots, setSlots] = useState<Slot[]>([]);

  async function loadSlots() {
    const response = await fetch("/api/availability", { cache: "no-store" });
    const payload = await response.json();

    if (!response.ok) {
      setSlots([]);
      setStatus(payload.error || "Failed to load slots");
      return;
    }

    setSlots(payload.data as Slot[]);
  }

  useEffect(() => {
    void loadSlots();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const startLocal = String(form.get("startLocal") || "");
    const endLocal = String(form.get("endLocal") || "");

    const startUtc = new Date(startLocal).toISOString();
    const endUtc = new Date(endLocal).toISOString();

    const response = await fetch("/api/availability", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ startTimeUtc: startUtc, endTimeUtc: endUtc })
    });

    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error || "Failed to create slot");
      return;
    }

    setStatus("Slot created");
    event.currentTarget.reset();
    await loadSlots();
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Card className="mx-auto max-w-4xl bg-white">
        <CardHeader>
          <CardTitle>Tutor availability</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="startLocal">Start local datetime</Label>
              <input id="startLocal" type="datetime-local" name="startLocal" required className={datetimeClassName} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endLocal">End local datetime</Label>
              <input id="endLocal" type="datetime-local" name="endLocal" required className={datetimeClassName} />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" className="w-full md:w-auto">
                Add slot
              </Button>
            </div>
          </form>

          <p className="text-sm">
            <span className="font-semibold">Status:</span> {status}
          </p>

          <section className="grid gap-3 rounded-lg border bg-muted/20 p-4">
            <h3 className="text-lg font-semibold">Open slots ({slots.length})</h3>
            {slots.length === 0 && <p className="text-muted-foreground text-sm">No slots created yet.</p>}
            {slots.map((slot) => (
              <p key={slot.id} className="text-sm">
                {new Date(slot.startTimeUtc).toLocaleString()} → {new Date(slot.endTimeUtc).toLocaleTimeString()}
              </p>
            ))}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
