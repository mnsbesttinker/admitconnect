import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Terms of Service</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6">
            MVP placeholder terms: AdmitConnect provides mentorship services only and does not guarantee admissions, scholarships,
            or aid outcomes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
