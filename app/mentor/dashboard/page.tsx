import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MentorDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-4 grid gap-2">
        <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
        <p className="text-muted-foreground text-sm">MVP dashboard stub wired to booking APIs.</p>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Quick check</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <p className="text-sm">Query your mentor bookings with:</p>
          <pre className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">{`GET /api/bookings/mentor?mentorId=nora-mit`}</pre>
          <p className="text-sm">
            You can generate bookings from <Link href="/book" className="underline">Book a Session</Link> and then check this endpoint.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
