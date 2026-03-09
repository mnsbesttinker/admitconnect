type BookingEmailInput = {
  recipientEmail: string;
  recipientName: string;
  counterpartName: string;
  startTimeUtcIso: string;
  recipientTimezone: string;
  roleLabel: "student" | "tutor";
  meetLink: string | null;
};

function renderBookingTime(startTimeUtcIso: string, timezone: string) {
  return new Date(startTimeUtcIso).toLocaleString([], { timeZone: timezone, timeZoneName: "short" });
}

export async function sendBookingConfirmationEmail(input: BookingEmailInput) {
  const from = process.env.RESEND_FROM_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;

  const bookingTime = renderBookingTime(input.startTimeUtcIso, input.recipientTimezone);
  const subject = "AdmitConnect booking confirmed";
  const html = `
    <p>Hi ${input.recipientName},</p>
    <p>Your booking is confirmed.</p>
    <p><strong>${input.roleLabel === "student" ? "Tutor" : "Student"}:</strong> ${input.counterpartName}</p>
    <p><strong>Time:</strong> ${bookingTime}</p>
    <p><strong>Meeting:</strong> ${input.meetLink || "Meeting link will be sent shortly."}</p>
  `;

  if (!apiKey || !from) {
    console.log("[email:stub]", { to: input.recipientEmail, subject, bookingTime });
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: input.recipientEmail,
      subject,
      html
    })
  });
}
