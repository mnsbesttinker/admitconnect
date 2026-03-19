import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Refund Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6">
            MVP placeholder policy: refunds may be issued for technical failure, mentor no-show, or approved disputes according to
            case review.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
