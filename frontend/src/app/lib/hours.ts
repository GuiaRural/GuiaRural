// Interpreta horários no formato "07:00-18:00" ou "11:00-14:00, 17:30-19:30" (dias úteis).
function toMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const [h, min] = [Number(m[1]), Number(m[2])];
  return h <= 23 && min <= 59 ? h * 60 + min : null;
}

// O campus funciona no horário de Recife, independente do fuso de quem acessa (ex.: estudante ainda no exterior).
const RECIFE_CLOCK = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Recife",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function isOpenNow(hours: string, now = new Date()): boolean {
  const parts = Object.fromEntries(RECIFE_CLOCK.formatToParts(now).map((p) => [p.type, p.value]));
  const day = WEEKDAY_INDEX[parts.weekday];
  if (day === 0 || day === 6) return false;
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  return hours.split(",").some((range) => {
    const [start, end] = range.split(/[-–]/).map(toMinutes);
    return start !== null && end !== null && minutes >= start && minutes < end;
  });
}

export function isValidHours(hours: string): boolean {
  return hours.split(",").every((range) => {
    const [start, end] = range.split(/[-–]/).map(toMinutes);
    return start !== null && end !== null && start < end;
  });
}
