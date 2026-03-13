import crypto from "crypto";
import { prisma } from "@/lib/prisma";

type GoogleTokenConfig =
  | { mode: "oauth"; clientId: string; clientSecret: string; refreshToken: string }
  | { mode: "service-account"; clientEmail: string; privateKey: string };

type GoogleAuthContext = { mode: "oauth" | "service-account"; accessToken: string };

const GOOGLE_SCOPE_CALENDAR = "https://www.googleapis.com/auth/calendar";
const GOOGLE_SCOPE_MEET_SPACES = "https://www.googleapis.com/auth/meetings.space.created";

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

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
    scope: `${GOOGLE_SCOPE_CALENDAR} ${GOOGLE_SCOPE_MEET_SPACES}`,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  };

  const unsignedJwt = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(claimSet))}`;
  const signature = crypto.createSign("RSA-SHA256").update(unsignedJwt).sign(privateKey);
  const assertion = `${unsignedJwt}.${base64UrlEncode(signature)}`;

  const tokenResponse = await fetchWithTimeout("https://oauth2.googleapis.com/token", {
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
  const tokenResponse = await fetchWithTimeout("https://oauth2.googleapis.com/token", {
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

async function getGoogleAuthContext(): Promise<GoogleAuthContext> {
  const tokenConfig = getGoogleTokenConfig();
  if (!tokenConfig) {
    throw new Error(
      "Google auth is not configured. Set OAuth refresh-token env vars or service-account env vars."
    );
  }

  if (tokenConfig.mode === "oauth") {
    return {
      mode: "oauth",
      accessToken: await getOAuthAccessToken(tokenConfig.clientId, tokenConfig.clientSecret, tokenConfig.refreshToken)
    };
  }

  return {
    mode: "service-account",
    accessToken: await getServiceAccountAccessToken(tokenConfig.clientEmail, tokenConfig.privateKey)
  };
}

async function createOpenMeetSpace(accessToken: string) {
  const response = await fetchWithTimeout("https://meet.googleapis.com/v2/spaces", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      config: {
        accessType: "OPEN"
      }
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Google Meet space creation failed (${response.status}): ${detail}`);
  }

  const payload = (await response.json()) as { meetingUri?: string };
  if (!payload.meetingUri) {
    throw new Error("Google Meet space was created without a meetingUri.");
  }

  return payload.meetingUri;
}

async function createCalendarEventForBooking(args: {
  accessToken: string;
  calendarId: string;
  authMode: GoogleAuthContext["mode"];
  booking: {
    id: string;
    student: { fullName: string; email: string };
    tutor: { fullName: string; email: string };
    slot: { startTimeUtc: Date; endTimeUtc: Date };
  };
  meetLink: string;
}) {
  const attendees =
    args.authMode === "oauth"
      ? [
          { email: args.booking.student.email, displayName: args.booking.student.fullName },
          { email: args.booking.tutor.email, displayName: args.booking.tutor.fullName }
        ]
      : undefined;

  const response = await fetchWithTimeout(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(args.calendarId)}/events?sendUpdates=${attendees ? "all" : "none"}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        summary: `AdmitConnect session: ${args.booking.student.fullName} & ${args.booking.tutor.fullName}`,
        description: `Booking ID: ${args.booking.id}\nGoogle Meet: ${args.meetLink}`,
        location: args.meetLink,
        start: {
          dateTime: args.booking.slot.startTimeUtc.toISOString(),
          timeZone: "UTC"
        },
        end: {
          dateTime: args.booking.slot.endTimeUtc.toISOString(),
          timeZone: "UTC"
        },
        attendees
      })
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Google Calendar event creation failed (${response.status}): ${detail}`);
  }
}

export async function createMeetingLinkForBooking(bookingId: string) {
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

  const authContext = await getGoogleAuthContext();
  const meetLink = await createOpenMeetSpace(authContext.accessToken);

  const calendarId = readGoogleCalendarId();
  if (calendarId) {
    try {
      await createCalendarEventForBooking({
        accessToken: authContext.accessToken,
        calendarId,
        authMode: authContext.mode,
        booking: {
          id: booking.id,
          student: { fullName: booking.student.fullName, email: booking.student.email },
          tutor: { fullName: booking.tutor.fullName, email: booking.tutor.email },
          slot: { startTimeUtc: booking.slot.startTimeUtc, endTimeUtc: booking.slot.endTimeUtc }
        },
        meetLink
      });
    } catch (error) {
      console.error("[meet:calendar:event]", error);
    }
  }

  return meetLink;
}
