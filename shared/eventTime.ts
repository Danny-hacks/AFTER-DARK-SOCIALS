// AFTR events store a free-text date ("Oct 9 2026") and a free-text time
// ("10 PM", "10PM — 4AM", "Doors open 8pm", "22:00"). Parsing the date alone
// gives midnight, which made an event look over on its own day.

const NIGHT_LENGTH_MS = 8 * 60 * 60 * 1000;
const NO_TIME_GRACE_MS = 30 * 60 * 60 * 1000;

function parseStartClock(time: string | null | undefined): { h: number; m: number } | null {
  if (!time) return null;
  // Only the start of a range: "10PM — 4AM" -> "10PM".
  const first = time.split(/[–—]|\s-\s|\s+to\s+/i)[0];
  const match = first.match(/(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3]?.toLowerCase();
  if (meridiem === "pm" && h < 12) h += 12;
  if (meridiem === "am" && h === 12) h = 0;
  if (h > 23 || m > 59) return null;
  return { h, m };
}

/** When the event starts, or null if the date can't be parsed. */
export function eventStartTime(date: string, time: string | null | undefined): Date | null {
  const day = new Date(date);
  if (isNaN(day.getTime())) return null;
  const clock = parseStartClock(time);
  if (clock) day.setHours(clock.h, clock.m, 0, 0);
  return day;
}

/** Time after which the event counts as over (null if the date can't be parsed). */
export function eventEndCutoff(date: string, time: string | null | undefined): number | null {
  const start = eventStartTime(date, time);
  if (!start) return null;
  // Night events run past midnight; with no usable time, keep it open through
  // the whole day and the early hours after.
  return start.getTime() + (parseStartClock(time) ? NIGHT_LENGTH_MS : NO_TIME_GRACE_MS);
}
