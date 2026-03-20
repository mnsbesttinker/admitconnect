import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LandingTutorSpotlight from "@/components/landing-tutor-spotlight";

const valueProps = [
  {
    title: "Mentors who actually won scholarships",
    body: "Get practical essay, school-list, and aid guidance from students who recently earned strong admissions and funding outcomes."
  },
  {
    title: "Built for international applicants",
    body: "Advice is tuned for visa realities, budget planning, and the aid constraints families face outside the U.S."
  },
  {
    title: "Affordable sessions, not $20k packages",
    body: "Book focused support when you need it, without long consulting contracts or bloated overhead."
  }
];

const testimonials = [
  {
    quote: "...genuinely thank you because you just showed me a whole new perspective of writing MY personal statement",
    person: "Anonymous Reddit User"
  },
  {
    quote: "I would also like to thank you so much. You have helped me immensely",
    person: "Anonymous Reddit User"
  },
  {
    quote: "thank you so much! this is really helpful :)",
    person: "Anonymous Reddit User"
  }
];

const differentiationPoints = [
  "Mentors navigated admissions recently, so advice reflects today's essays, timelines, and aid realities.",
  "Scholarship and financial-aid strategy is lived experience, not abstract theory.",
  "Sessions are focused and affordable because there is no large consulting layer between you and your mentor.",
  "You leave with practical action steps, not generic encouragement."
];

const howItWorks = [
  {
    step: "1",
    title: "Choose a mentor",
    body: "Browse mentors by school, major, and outcomes to find someone who matches your goals."
  },
  {
    step: "2",
    title: "Book a session",
    body: "Pick a time that works for your family and only pay for the support you need."
  },
  {
    step: "3",
    title: "Meet on Google Meet",
    body: "Build your essay, school-list, and aid strategy with clear next steps after each call."
  }
];

export default function HomePage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-7 md:gap-14 md:py-10 lg:px-6">
      <section className="grid items-center gap-6 rounded-2xl border bg-white p-5 md:gap-8 md:p-10 lg:grid-cols-2">
        <div className="space-y-6">
          <Badge variant="secondary" className="w-fit text-xs font-semibold tracking-wide">
            Trusted by students pursuing aid-aware admissions
          </Badge>
          <div className="space-y-4">
            <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl">
              You don’t need to pay $20k for college consulting
            </h1>
            <p className="text-muted-foreground max-w-xl text-base leading-7 md:leading-8 md:text-lg">
              Get affordable guidance from students who actually won scholarships and figured the process out themselves
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild className="h-11 w-full bg-blue-600 font-semibold text-white hover:bg-blue-700 sm:w-auto">
              <Link href="/mentors">Find a Mentor</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 w-full font-semibold sm:w-auto">
              <Link href="/faq">How It Works</Link>
            </Button>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border bg-slate-100">
          <div className="relative min-h-72 sm:min-h-80">
            <Image
              src="/landing-hero.jpg"
              alt="Ambitious students reviewing college applications with a mentor"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <Badge className="bg-white/95 text-slate-900 whitespace-normal hover:bg-white">
              Dream school planning • Scholarship outcomes • Human mentorship
            </Badge>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight md:text-3xl">Mentors with real, recent outcomes</h2>
          <p className="text-muted-foreground max-w-3xl text-base leading-7">
            Serious profiles, practical support, and clear proof that these mentors understand both admissions and affordability.
          </p>
        </div>
        <LandingTutorSpotlight />
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight md:text-3xl">What students and parents say</h2>
          <p className="text-muted-foreground text-base leading-7">
            See what people think of our tutors
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.person} className="h-full bg-white">
              <CardContent className="grid h-full content-between gap-5 pt-6">
                <p className="text-base leading-7">“{testimonial.quote}”</p>
                <p className="text-muted-foreground text-sm font-medium">{testimonial.person}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-2xl border bg-white p-5 md:p-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight md:text-3xl">Why AdmitConnect works for cost-conscious families</h2>
          <div className="grid gap-3">
            {differentiationPoints.map((point) => (
              <div key={point} className="flex gap-3">
                <Badge variant="secondary" className="mt-0.5 h-fit">
                  ✓
                </Badge>
                <p className="text-muted-foreground text-sm leading-7 md:text-base">{point}</p>
              </div>
            ))}
          </div>
        </div>
        <Card className="h-fit bg-slate-50">
          <CardHeader>
            <CardTitle className="text-lg font-bold">A calmer alternative to high-cost consulting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6">
            <p><span className="font-semibold">Traditional model:</span> expensive packages, broad advice, unclear value per hour.</p>
            <p><span className="font-semibold">AdmitConnect:</span> focused sessions, relevant mentor experience, transparent pricing.</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight md:text-3xl">How it works</h2>
          <p className="text-muted-foreground text-base leading-7">Simple process, clear expectations, and practical outcomes.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {howItWorks.map((item) => (
            <Card key={item.step} className="h-full bg-white">
              <CardHeader className="space-y-3">
                <Badge variant="outline" className="w-fit">
                  Step {item.step}
                </Badge>
                <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-base leading-7">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {valueProps.map((point) => (
          <Card key={point.title} className="h-full bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold">{point.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-base leading-7">{point.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
