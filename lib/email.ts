type BookingEmailInput = {
  recipientEmail: string;
  recipientName: string;
  counterpartName: string;
  startTimeUtcIso: string;
  recipientTimezone: string;
  roleLabel: "student" | "tutor";
  meetLink: string;
};

type SignupEmailInput = {
  recipientEmail: string;
  recipientName: string;
  role: "student" | "tutor";
};

function renderBookingTime(startTimeUtcIso: string, timezone: string) {
  return new Date(startTimeUtcIso).toLocaleString([], { timeZone: timezone, timeZoneName: "short" });
}

async function deliverEmail(payload: { to: string; subject: string; html: string }) {
  const from = process.env.RESEND_FROM_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || !from) {
    console.log("[email:stub]", { to: payload.to, subject: payload.subject });
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend request failed (${response.status}): ${errorBody}`);
  }
}

export async function sendBookingConfirmationEmail(input: BookingEmailInput) {
  const bookingTime = renderBookingTime(input.startTimeUtcIso, input.recipientTimezone);
  const subject = "AdmitConnect booking confirmed";
  const html = `
    <p>Hi ${input.recipientName},</p>
    <p>Your booking is confirmed.</p>
    <p><strong>${input.roleLabel === "student" ? "Tutor" : "Student"}:</strong> ${input.counterpartName}</p>
    <p><strong>Time:</strong> ${bookingTime}</p>
    <p><strong>Meeting:</strong> <a href="${input.meetLink}">${input.meetLink}</a></p>
    <p>Thanks,<br/>AdmitConnect</p>
  `;

  try {
    await deliverEmail({ to: input.recipientEmail, subject, html });
  } catch (error) {
    console.error("[email:booking]", error);
  }
}

export async function sendSignupConfirmationEmail(input: SignupEmailInput) {
  const subject = "Welcome to AdmitConnect";
  const html = `
    <p>Hi ${input.recipientName},</p>
    <p>Your AdmitConnect ${input.role} account has been created successfully.</p>
    <p>You can now sign in and continue with onboarding.</p>
    <p>Thanks,<br/>AdmitConnect</p>
  `;

  try {
    await deliverEmail({ to: input.recipientEmail, subject, html });
  } catch (error) {
    console.error("[email:signup]", error);
  }
}
