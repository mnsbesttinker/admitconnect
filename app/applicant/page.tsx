import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApplicantDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-4 grid gap-2">
        <h1 className="text-3xl font-bold">Applicant Dashboard</h1>
        <p className="text-muted-foreground text-sm">In this MVP stage, use your student session to inspect your own bookings.</p>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Quick check</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <p className="text-sm">
            After creating bookings from <Link href="/book" className="underline">Book a Session</Link>, test:
          </p>
          <pre className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">{`GET /api/bookings/my`}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
