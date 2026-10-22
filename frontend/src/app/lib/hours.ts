// Interpreta horários no formato "07:00-18:00" ou "11:00-14:00, 17:30-19:30" (dias úteis).
function toMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

export function isOpenNow(hours: string, now = new Date()): boolean {
  const day = now.getDay();
  if (day === 0 || day === 6) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
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
