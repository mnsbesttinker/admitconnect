export const SUPPORTED_TIMEZONES = [
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Toronto",
  "America/Halifax",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  "Atlantic/Reykjavik",
  "Europe/Dublin",
  "Europe/London",
  "Europe/Lisbon",
  "Europe/Paris",
  "Europe/Madrid",
  "Europe/Berlin",
  "Europe/Rome",
  "Europe/Warsaw",
  "Europe/Athens",
  "Europe/Helsinki",
  "Europe/Istanbul",
  "Europe/Moscow",
  "Africa/Cairo",
  "Africa/Nairobi",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Jakarta",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Perth",
  "Australia/Adelaide",
  "Australia/Sydney",
  "Pacific/Auckland"
] as const;

export type SupportedTimezone = (typeof SUPPORTED_TIMEZONES)[number];

const timezoneSet = new Set<string>(SUPPORTED_TIMEZONES);

export function isSupportedTimezone(value: string): value is SupportedTimezone {
  return timezoneSet.has(value);
}
