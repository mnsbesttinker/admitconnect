import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const trustPoints = [
  {
    title: "Aid-first specialization",
    body: "Mentors focus on scholarship and need-based aid outcomes, not generic admissions advice."
  },
  {
    title: "Verified tutor credibility",
    body: "Tutors apply with identity and credential proof before becoming visible to students."
  },
  {
    title: "Transparent affordability",
    body: "Simple pricing and low platform commission keeps sessions accessible for your target audience."
  }
];

export default function HomePage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-10">
      <Card className="py-0">
        <CardContent className="grid gap-4 p-8">
          <Badge variant="secondary" className="w-fit">
            Built for international applicants
          </Badge>
          <div className="grid gap-3">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Affordable 1-on-1 mentorship from U.S. scholarship admits
            </h1>
            <p className="text-muted-foreground max-w-3xl text-base md:text-lg">
              AdmitConnect is built specifically for international applicants optimizing for aid. We focus where most general
              admissions platforms do not: affordability strategy, aid positioning, and realistic planning for cost-sensitive
              families.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/mentors">Find a mentor</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/tutor/apply">Become a tutor</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        {trustPoints.map((point) => (
          <Card key={point.title}>
            <CardHeader>
              <CardTitle className="text-lg">{point.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-6">{point.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
