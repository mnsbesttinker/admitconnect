import crypto from "crypto";
import { prisma } from "@/lib/prisma";

type GoogleTokenConfig =
  | { mode: "oauth"; clientId: string; clientSecret: string; refreshToken: string }
  | { mode: "service-account"; clientEmail: string; privateKey: string };

function base64UrlEncode(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function readGoogleCalendarId() {
  return process.env.GOOGLE_CALENDAR_ID || null;
}

function getGoogleTokenConfig(): GoogleTokenConfig | null {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    return { mode: "oauth", clientId, clientSecret, refreshToken };
  }

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey) {
    return { mode: "service-account", clientEmail, privateKey };
  }

  return null;
}

async function getServiceAccountAccessToken(clientEmail: string, privateKey: string) {
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
    throw new Error(`Service-account token request failed (${tokenResponse.status}): ${detail}`);
  }

  const tokenPayload = (await tokenResponse.json()) as { access_token: string };
  return tokenPayload.access_token;
}

async function getOAuthAccessToken(clientId: string, clientSecret: string, refreshToken: string) {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    }).toString()
  });

  if (!tokenResponse.ok) {
    const detail = await tokenResponse.text();
    throw new Error(`OAuth token refresh failed (${tokenResponse.status}): ${detail}`);
  }

  const tokenPayload = (await tokenResponse.json()) as { access_token: string };
  return tokenPayload.access_token;
}

async function getGoogleAccessToken() {
  const tokenConfig = getGoogleTokenConfig();
  if (!tokenConfig) {
    throw new Error(
      "Google Calendar auth is not configured. Set OAuth refresh-token env vars or service-account env vars."
    );
  }

  if (tokenConfig.mode === "oauth") {
    return getOAuthAccessToken(tokenConfig.clientId, tokenConfig.clientSecret, tokenConfig.refreshToken);
  }

  return getServiceAccountAccessToken(tokenConfig.clientEmail, tokenConfig.privateKey);
}

export async function createMeetingLinkForBooking(bookingId: string) {
  const calendarId = readGoogleCalendarId();
  if (!calendarId) {
    throw new Error("GOOGLE_CALENDAR_ID is not configured.");
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
    throw new Error("Booking was not found while creating Google Meet link.");
  }

  const accessToken = await getGoogleAccessToken();
  const requestId = `${booking.id}-${Date.now()}`;

  const eventResponse = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
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
            requestId,
            conferenceSolutionKey: { type: "hangoutsMeet" }
          }
        }
      })
    }
  );

  if (!eventResponse.ok) {
    const detail = await eventResponse.text();
    throw new Error(`Google Calendar event creation failed (${eventResponse.status}): ${detail}`);
  }

  const eventPayload = (await eventResponse.json()) as {
    hangoutLink?: string;
    conferenceData?: { entryPoints?: Array<{ entryPointType?: string; uri?: string }> };
  };

  const meetLink =
    eventPayload.hangoutLink ||
    eventPayload.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ||
    null;

  if (!meetLink) {
    throw new Error("Google Calendar event was created without a Meet video link.");
  }

  return meetLink;
}
