import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6">
            MVP placeholder policy: we collect only the data required to provide mentor discovery, booking, payment processing,
            and session operations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
