export type IconName =
  | "home"
  | "pin"
  | "map"
  | "clock"
  | "bolt"
  | "bookmark"
  | "link"
  | "ticket"
  | "graduation"
  | "star"
  | "alert"
  | "sunset"
  | "card"
  | "network"
  | "phone"
  | "arrow"
  | "compass"
  | "headset"
  | "bus"
  | "pencil"
  | "trash"
  | "plus";

const PATHS: Record<IconName, string[]> = {
  home: ["m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"],
  pin: ["M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z", "M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"],
  map: ["M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z", "M9 3v15", "M15 6v15"],
  clock: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z", "M12 6v6l4 2"],
  bolt: ["M13 2 3 14h9l-1 8 10-12h-9z"],
  bookmark: ["m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"],
  link: [
    "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7",
    "M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7",
  ],
  ticket: [
    "M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z",
    "M13 5v2",
    "M13 17v2",
    "M13 11v2",
  ],
  graduation: ["M22 10 12 5 2 10l10 5z", "M6 12v5c3 2 9 2 12 0v-5"],
  star: ["m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"],
  alert: ["m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3z", "M12 9v4", "M12 17h.01"],
  sunset: [
    "M12 10V2",
    "m4.93 10.93 1.41 1.41",
    "M2 18h2",
    "M20 18h2",
    "m19.07 10.93-1.41 1.41",
    "M22 22H2",
    "m16 6-4 4-4-4",
    "M16 18a4 4 0 0 0-8 0",
  ],
  card: ["M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z", "M2 10h20"],
  network: [
    "M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z",
    "M12 9.5V6",
    "M12 18v-3.5",
    "M9.5 12H6",
    "M18 12h-3.5",
    "M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
    "M12 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
    "M2 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
    "M22 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
  ],
  phone: ["M9 2h6a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z", "M12 18h.01"],
  arrow: ["M5 12h14", "m12 5 7 7-7 7"],
  compass: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z", "m16.2 7.8-2 6.3-6.4 2.1 2-6.3z"],
  headset: [
    "M3 14v-2a9 9 0 0 1 18 0v2",
    "M21 14v3a2 2 0 0 1-2 2h-1v-6h3z",
    "M3 14v3a2 2 0 0 0 2 2h1v-6H3z",
  ],
  bus: [
    "M6 3h12a3 3 0 0 1 3 3v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a3 3 0 0 1 3-3z",
    "M3 11h18",
    "M8 7h.01",
    "M16 7h.01",
    "M7 21v-3",
    "M17 21v-3",
  ],
  pencil: ["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"],
  trash: ["M3 6h18", "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6", "M10 11v6", "M14 11v6"],
  plus: ["M12 5v14", "M5 12h14"],
};

export default function Icon({ name, className = "size-4" }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
