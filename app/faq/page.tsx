import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqItems = [
  {
    q: "Do you guarantee admission or financial aid?",
    a: "No. AdmitConnect provides mentorship and strategy support only. No mentor or platform can guarantee outcomes."
  },
  {
    q: "What happens after I book?",
    a: "You select a mentor and slot, complete payment, and receive a confirmed session. Post-session, you can leave a review."
  },
  {
    q: "Will mentors write essays for me?",
    a: "No. Mentors can guide and review direction, but they do not ghostwrite essays or submit applications for students."
  },
  {
    q: "How are mentors verified?",
    a: "Mentors submit school and aid/scholarship proof plus a short strategy summary, then require admin approval before being listed."
  }
];

export default function FaqPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-10">
      <h1 className="text-3xl font-bold">FAQ</h1>
      <div className="grid gap-3">
        {faqItems.map((item) => (
          <Card key={item.q} className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">{item.q}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6">{item.a}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
