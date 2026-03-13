import crypto from "crypto";
import { prisma } from "@/lib/prisma";

type GoogleTokenConfig =
  | { mode: "oauth"; clientId: string; clientSecret: string; refreshToken: string }
  | { mode: "service-account"; clientEmail: string; privateKey: string };


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
    scope: "https://www.googleapis.com/auth/calendar",
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

async function getGoogleAuthContext() {
  const tokenConfig = getGoogleTokenConfig();
  if (!tokenConfig) {
    throw new Error(
      "Google Calendar auth is not configured. Set OAuth refresh-token env vars or service-account env vars."
    );
  }

  if (tokenConfig.mode === "oauth") {
    return {
      mode: "oauth" as const,
      accessToken: await getOAuthAccessToken(tokenConfig.clientId, tokenConfig.clientSecret, tokenConfig.refreshToken)
    };
  }

  return {
    mode: "service-account" as const,
    accessToken: await getServiceAccountAccessToken(tokenConfig.clientEmail, tokenConfig.privateKey)
  };
}


function extractMeetLinkFromEventPayload(eventPayload: {
  hangoutLink?: string;
  conferenceData?: { entryPoints?: Array<{ entryPointType?: string; uri?: string }> };
}) {
  return (
    eventPayload.hangoutLink ||
    eventPayload.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ||
    null
  );
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
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

  const authContext = await getGoogleAuthContext();
  const requestId = `${booking.id}-${Date.now()}`;

  const eventPayloadBody: Record<string, unknown> = {
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
    conferenceData: {
      createRequest: {
        requestId
      }
    }
  };

  if (authContext.mode === "oauth") {
    eventPayloadBody.attendees = [
      { email: booking.student.email, displayName: booking.student.fullName },
      { email: booking.tutor.email, displayName: booking.tutor.fullName }
    ];
  }

  const eventResponse = await fetchWithTimeout(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authContext.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(eventPayloadBody)
    }
  );

  if (!eventResponse.ok) {
    const detail = await eventResponse.text();
    throw new Error(`Google Calendar event creation failed (${eventResponse.status}): ${detail}`);
  }

  const eventPayload = (await eventResponse.json()) as {
    id?: string;
    hangoutLink?: string;
    conferenceData?: {
      entryPoints?: Array<{ entryPointType?: string; uri?: string }>;
      createRequest?: { status?: { statusCode?: string } };
    };
  };

  let meetLink = extractMeetLinkFromEventPayload(eventPayload);

  if (!meetLink && eventPayload.id) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await wait(1200);
      const pollResponse = await fetchWithTimeout(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventPayload.id)}?conferenceDataVersion=1`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authContext.accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!pollResponse.ok) {
        continue;
      }

      const polledPayload = (await pollResponse.json()) as {
        hangoutLink?: string;
        conferenceData?: { entryPoints?: Array<{ entryPointType?: string; uri?: string }> };
      };

      meetLink = extractMeetLinkFromEventPayload(polledPayload);
      if (meetLink) {
        break;
      }
    }
  }

  if (!meetLink) {
    const statusCode = eventPayload.conferenceData?.createRequest?.status?.statusCode || "unknown";
    throw new Error(`Google Calendar event was created without a Meet video link (conference status: ${statusCode}).`);
  }

  return meetLink;
}
