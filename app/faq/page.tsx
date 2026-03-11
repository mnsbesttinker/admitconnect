export default function FaqPage() {
  return (
    <div className="container">
      <h1>FAQ</h1>
      <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
        <section className="card">
          <h3 style={{ marginTop: 0 }}>Do you guarantee admission or financial aid?</h3>
          <p>No. AdmitConnect provides mentorship and strategy support only. No mentor or platform can guarantee outcomes.</p>
        </section>

        <section className="card">
          <h3 style={{ marginTop: 0 }}>What happens after I book?</h3>
          <p>
            You select a mentor and slot, complete payment, and receive a confirmed session. Post-session, you can leave a review.
          </p>
        </section>

        <section className="card">
          <h3 style={{ marginTop: 0 }}>Will mentors write essays for me?</h3>
          <p>No. Mentors can guide and review direction, but they do not ghostwrite essays or submit applications for students.</p>
        </section>

        <section className="card">
          <h3 style={{ marginTop: 0 }}>How are mentors verified?</h3>
          <p>
            Mentors submit school and aid/scholarship proof plus a short strategy summary, then require admin approval before being listed.
          </p>
        </section>
      </div>
    </div>
  );
}
