import type { OpeningInterval } from "../data/mockPlaces";

// Sempre no horário de Recife, independente do fuso de quem está acessando.
const RECIFE_CLOCK = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Recife",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// null = local sem horário cadastrado (não dá para dizer se está aberto).
export function isOpenAt(hours: OpeningInterval[], date: Date): boolean | null {
  if (hours.length === 0) return null;
  const parts = Object.fromEntries(RECIFE_CLOCK.formatToParts(date).map((p) => [p.type, p.value]));
  const day = WEEKDAY_INDEX[parts.weekday];
  const time = `${parts.hour}:${parts.minute}`;
  // Comparação de texto funciona porque os horários são sempre "HH:MM" com dois dígitos.
  return hours.some((h) => h.days.includes(day) && h.opens <= time && time < h.closes);
}

const LOCALES = { pt: "pt-BR", en: "en", es: "es" } as const;

// Dias abreviados no idioma da interface: sequência contínua vira faixa ("seg.–sex."), senão lista.
export function formatDays(days: number[], language: keyof typeof LOCALES): string {
  const names = new Intl.DateTimeFormat(LOCALES[language], { weekday: "short", timeZone: "UTC" });
  // 2026-10-25 foi um domingo: somar o índice do dia dá a data daquele dia da semana.
  const label = (day: number) => names.format(new Date(Date.UTC(2026, 9, 25 + day)));
  const sorted = [...days].sort((a, b) => a - b);
  const contiguous = sorted.every((d, i) => i === 0 || d === sorted[i - 1] + 1);
  if (contiguous && sorted.length > 2) return `${label(sorted[0])}–${label(sorted[sorted.length - 1])}`;
  return sorted.map(label).join(", ");
}

// Intervalos distintos, sem repetir (ex.: "11:00 às 14:00 · 17:00 às 19:30").
export function formatHours(hours: OpeningInterval[], until: string): string {
  const ranges = hours.map((h) => `${h.opens} ${until} ${h.closes}`);
  return [...new Set(ranges)].join(" · ");
}
