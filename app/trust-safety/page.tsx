import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrustSafetyPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-10">
      <h1 className="text-3xl font-bold">Trust & Safety</h1>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Our commitments</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>No guaranteed admission or aid claims.</li>
            <li>Mentor verification before profiles are publicly visible.</li>
            <li>Mentorship and editing guidance only; no essay ghostwriting.</li>
            <li>Transparent pricing and refund rules.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Policy links</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>
              <Link href="/refund-policy" className="underline">Refund Policy</Link>
            </li>
            <li>
              <Link href="/privacy" className="underline">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms" className="underline">Terms of Service</Link>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
