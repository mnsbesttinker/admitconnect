import { sessionTypes } from "@/lib/mentors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-4 grid gap-2">
        <h1 className="text-3xl font-bold">Pricing</h1>
        <p className="text-muted-foreground text-sm">Fixed session menu for MVP. Platform fee (20%) is included in listed prices.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {sessionTypes.map((session) => (
          <Card key={session.id} className="bg-white">
            <CardHeader>
              <CardTitle>{session.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-1">
              <p className="text-muted-foreground text-sm">{session.minutes} minutes</p>
              <p className="text-2xl font-bold">${session.priceUsd}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
