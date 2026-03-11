import crypto from "crypto";
import { prisma } from "@/lib/prisma";

function getGoogleCalendarConfig() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!clientEmail || !privateKey || !calendarId) {
    return null;
  }

  return { clientEmail, privateKey, calendarId };
}

function base64UrlEncode(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getGoogleAccessToken(clientEmail: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  };

  const unsignedJwt = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(claimSet))}`;
  const signature = crypto.createSign("RSA-SHA256").update(unsignedJwt).sign(privateKey);
  const assertion = `${unsignedJwt}.${base64UrlEncode(signature)}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    }).toString()
  });

  if (!tokenResponse.ok) {
    const detail = await tokenResponse.text();
    throw new Error(`Failed to fetch Google access token (${tokenResponse.status}): ${detail}`);
  }

  const tokenPayload = (await tokenResponse.json()) as { access_token: string };
  return tokenPayload.access_token;
}

export async function createMeetingLinkForBooking(bookingId: string) {
  const config = getGoogleCalendarConfig();
  if (!config) {
    return null as string | null;
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      slot: true,
      student: true,
      tutor: true
    }
  });

  if (!booking) {
    return null;
  }

  try {
    const accessToken = await getGoogleAccessToken(config.clientEmail, config.privateKey);
    const eventResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendarId)}/events?conferenceDataVersion=1`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          summary: `AdmitConnect session: ${booking.student.fullName} & ${booking.tutor.fullName}`,
          description: `Booking ID: ${booking.id}`,
          start: {
            dateTime: booking.slot.startTimeUtc.toISOString(),
            timeZone: "UTC"
          },
          end: {
            dateTime: booking.slot.endTimeUtc.toISOString(),
            timeZone: "UTC"
          },
          attendees: [
            { email: booking.student.email, displayName: booking.student.fullName },
            { email: booking.tutor.email, displayName: booking.tutor.fullName }
          ],
          conferenceData: {
            createRequest: {
              requestId: booking.id,
              conferenceSolutionKey: { type: "hangoutsMeet" }
            }
          }
        })
      }
    );

    if (!eventResponse.ok) {
      const detail = await eventResponse.text();
      throw new Error(`Failed to create Google Calendar event (${eventResponse.status}): ${detail}`);
    }

    const eventPayload = (await eventResponse.json()) as {
      hangoutLink?: string;
      conferenceData?: { entryPoints?: Array<{ entryPointType?: string; uri?: string }> };
    };

    return (
      eventPayload.hangoutLink ||
      eventPayload.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ||
      null
    );
  } catch (error) {
    console.error("[meet:create]", error);
    return null;
  }
}
