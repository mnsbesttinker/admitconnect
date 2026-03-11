export default function BookingSuccessPage({ params }: { params: { id: string } }) {
  return (
    <div className="container">
      <h1>Booking confirmed</h1>
      <section className="card">
        <p>Your booking was created successfully.</p>
        <p><strong>Booking ID:</strong> {params.id}</p>
        <p>Confirmation emails were sent to student and tutor. Meeting link will be sent shortly.</p>
      </section>
    </div>
  );
}
