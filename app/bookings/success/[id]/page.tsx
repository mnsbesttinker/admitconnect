import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BookingSuccessPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Card className="bg-white max-w-2xl">
        <CardHeader>
          <CardTitle>Booking confirmed</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <p>Your booking was created successfully.</p>
          <p><strong>Booking ID:</strong> {params.id}</p>
          <p>Confirmation emails were sent to student and tutor. Meeting link will be sent shortly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
