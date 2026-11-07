type GoogleCalendarEvent = {
  title: string;
  year?: number;
  month: string;
  date: string;
  time: string;
  location: string;
  description: string;
  sourceUrl?: string;
};

const monthIndexes: Record<string, number> = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
};

function formatGoogleDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}00`;
}

function parseEventTimes(event: GoogleCalendarEvent) {
  const monthIndex = monthIndexes[event.month];
  const timeMatches = [...event.time.matchAll(/(\d{1,2}):(\d{2})\s*(AM|PM)/gi)];

  if (monthIndex === undefined || !timeMatches.length) {
    throw new Error("This event does not have a valid date and time.");
  }

  const toHoursAndMinutes = (match: RegExpMatchArray) => {
    const meridiem = match[3].toUpperCase();
    const hours = (Number(match[1]) % 12) + (meridiem === "PM" ? 12 : 0);
    return { hours, minutes: Number(match[2]) };
  };

  const startTime = toHoursAndMinutes(timeMatches[0]);
  const endTime = timeMatches[1] ? toHoursAndMinutes(timeMatches[1]) : null;
  const start = new Date(
    event.year ?? 2026,
    monthIndex,
    Number(event.date),
    startTime.hours,
    startTime.minutes,
  );
  const end = endTime
    ? new Date(
        event.year ?? 2026,
        monthIndex,
        Number(event.date),
        endTime.hours,
        endTime.minutes,
      )
    : new Date(start.getTime() + 60 * 60 * 1000);

  if (end <= start) end.setDate(end.getDate() + 1);

  return { start, end };
}

export function createGoogleCalendarUrl(event: GoogleCalendarEvent) {
  const { start, end } = parseEventTimes(event);
  const details = event.sourceUrl
    ? `${event.description}\n\nEvent organizer: ${event.sourceUrl}`
    : event.description;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
    details,
    location: event.location,
    ctz: "America/New_York",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
