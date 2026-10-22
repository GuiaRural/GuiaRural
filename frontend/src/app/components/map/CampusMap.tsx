"use client";

import {
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type Ref,
  type MouseEvent,
} from "react";
import { useLanguage } from "../../context/LanguageContext";
import { MAP_HEIGHT, MAP_WIDTH, type Point } from "../../lib/geo";

// Mapa mock do campus desenhado em SVG. Mantém o contrato (marcadores, seleção, rota, pin) para a troca
// por Leaflet + OpenStreetMap (RF01) sem mudar quem o usa.

export type MapMarker = { id: string; label: string; point: Point; kind: "place" | "gate" };

export type CampusMapHandle = { centerOn: (point: Point, scale?: number) => void };

type View = { cx: number; cy: number; scale: number };

const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;
const DRAG_THRESHOLD = 5;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// Árvores em posições fixas (decorativas).
const TREES: Point[] = Array.from({ length: 70 }, (_, i) => ({
  x: (i * 137.5) % MAP_WIDTH,
  y: ((i * 89.3) % (MAP_HEIGHT - 40)) + 20,
})).filter((p) => Math.abs(p.y - 380) > 25);

export default function CampusMap({
  markers,
  selectedId,
  onSelectMarker,
  onBackgroundClick,
  route,
  pin,
  onPinMove,
  initialCenter,
  initialScale = 1,
  ref,
}: {
  markers: MapMarker[];
  selectedId?: string | null;
  onSelectMarker?: (id: string) => void;
  onBackgroundClick?: () => void;
  route?: Point[] | null;
  pin?: Point | null;
  onPinMove?: (point: Point) => void;
  initialCenter?: Point;
  initialScale?: number;
  ref?: Ref<CampusMapHandle>;
}) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({
    cx: initialCenter?.x ?? MAP_WIDTH / 2,
    cy: initialCenter?.y ?? MAP_HEIGHT / 2,
    scale: initialScale,
  });
  const drag = useRef<{ x: number; y: number; cx: number; cy: number; moved: boolean; pin: boolean } | null>(null);
  const suppressClick = useRef(false);

  useImperativeHandle(
    ref,
    () => ({
      centerOn: (point, scale) =>
        setView((v) => ({ cx: point.x, cy: point.y, scale: clamp(scale ?? Math.max(v.scale, 1.3), MIN_SCALE, MAX_SCALE) })),
    }),
    [],
  );

  function toMapPoint(clientX: number, clientY: number): Point {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
      x: clamp(view.cx + (clientX - rect.left - rect.width / 2) / view.scale, 0, MAP_WIDTH),
      y: clamp(view.cy + (clientY - rect.top - rect.height / 2) / view.scale, 0, MAP_HEIGHT),
    };
  }

  function zoom(factor: number) {
    setView((v) => ({ ...v, scale: clamp(v.scale * factor, MIN_SCALE, MAX_SCALE) }));
  }

  function pan(dx: number, dy: number) {
    setView((v) => ({ ...v, cx: clamp(v.cx + dx, 0, MAP_WIDTH), cy: clamp(v.cy + dy, 0, MAP_HEIGHT) }));
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("[data-map-control]")) return;
    suppressClick.current = false;
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      cx: view.cx,
      cy: view.cy,
      moved: false,
      pin: Boolean((e.target as HTMLElement).closest("[data-map-pin]")),
    };
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      d.moved = true;
      containerRef.current?.setPointerCapture(e.pointerId);
    }
    if (d.pin && onPinMove) {
      onPinMove(toMapPoint(e.clientX, e.clientY));
    } else {
      setView((v) => ({
        ...v,
        cx: clamp(d.cx - dx / v.scale, 0, MAP_WIDTH),
        cy: clamp(d.cy - dy / v.scale, 0, MAP_HEIGHT),
      }));
    }
  }

  function handlePointerUp() {
    if (drag.current?.moved) suppressClick.current = true;
    drag.current = null;
  }

  function handleClickCapture(e: MouseEvent) {
    if (suppressClick.current) {
      suppressClick.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  }

  function handleBackgroundClick(e: MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    if (target.closest("[data-map-marker], [data-map-control], [data-map-pin]")) return;
    if (onPinMove) onPinMove(toMapPoint(e.clientX, e.clientY));
    // FE-02.01: clique fora de um marcador fecha o cartão e mantém a navegação livre.
    else onBackgroundClick?.();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    const step = 40 / view.scale;
    const moves: Record<string, [number, number]> = {
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
    };
    if (moves[e.key]) {
      e.preventDefault();
      pan(...moves[e.key]);
    } else if (e.key === "+" || e.key === "=") zoom(1.25);
    else if (e.key === "-") zoom(0.8);
  }

  const s = view.scale;

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label={t.map.label}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClickCapture={handleClickCapture}
      onClick={handleBackgroundClick}
      onWheel={(e) => zoom(e.deltaY < 0 ? 1.1 : 0.9)}
      onKeyDown={handleKeyDown}
      className={`absolute inset-0 touch-none select-none overflow-hidden bg-[#dce7cf] outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-brand-yellow ${
        onPinMove ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"
      }`}
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{ transform: `translate(${-view.cx * s}px, ${-view.cy * s}px)` }}
      >
        <svg aria-hidden width={MAP_WIDTH * s} height={MAP_HEIGHT * s} viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="block">
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} rx="24" fill="#e6efdc" />
          <path d="M0 520 C 120 470, 180 600, 320 640 S 520 700, 600 700 L 0 700 Z" fill="#cfe0bd" />
          <path d="M760 0 C 820 120, 980 120, 1000 200 L 1000 0 Z" fill="#cfe0bd" />
          {/* Campo e pista de atletismo */}
          <rect x="120" y="140" width="170" height="110" rx="55" fill="none" stroke="#3b82c4" strokeWidth="10" />
          <rect x="140" y="158" width="130" height="74" rx="37" fill="#b9dca0" />
          {/* Vias */}
          <g stroke="#fbf8f1" strokeLinecap="round" fill="none">
            <path d="M40 380 H 970" strokeWidth="20" />
            <path d="M90 380 V 690" strokeWidth="16" />
            <path d="M540 110 V 640" strokeWidth="14" />
            <path d="M900 140 V 690" strokeWidth="14" />
            <path d="M330 380 V 470 M720 380 V 400 M610 260 V 380 M360 230 V 380 M470 330 V 380" strokeWidth="9" />
          </g>
          {TREES.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="7" fill="#7aa36a" opacity="0.8" />
          ))}
          {/* Prédios */}
          {markers
            .filter((m) => m.kind === "place")
            .map((m) => (
              <rect
                key={m.id}
                x={m.point.x - 48}
                y={m.point.y - 26}
                width="96"
                height="52"
                rx="6"
                fill={m.id === selectedId ? "#1b2f6e" : "#24366e"}
                opacity={m.id === selectedId ? 1 : 0.85}
              />
            ))}
          {route && route.length > 1 && (
            <g fill="none" strokeLinejoin="round" strokeLinecap="round">
              <polyline points={route.map((p) => `${p.x},${p.y}`).join(" ")} stroke="#ffffff" strokeWidth="12" />
              <polyline points={route.map((p) => `${p.x},${p.y}`).join(" ")} stroke="#2563eb" strokeWidth="7" />
              <circle cx={route[0].x} cy={route[0].y} r="10" fill="#2563eb" stroke="#fff" strokeWidth="4" />
            </g>
          )}
        </svg>

        {markers.map((m) => {
          const selected = m.id === selectedId;
          return (
            <button
              key={m.id}
              type="button"
              data-map-marker
              aria-label={m.label}
              aria-pressed={selected}
              onClick={() => onSelectMarker?.(m.id)}
              className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center focus-visible:outline-none"
              style={{ left: m.point.x * s, top: m.point.y * s }}
            >
              <span
                className={`grid place-items-center rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-110 group-focus-visible:ring-4 group-focus-visible:ring-navy-900 ${
                  m.kind === "gate" ? "size-5 bg-emerald-600" : "size-6 bg-brand-yellow"
                } ${selected ? "scale-125 ring-4 ring-brand-yellow/50" : ""}`}
              />
              <span
                className={`mt-1 whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-bold shadow-sm ${
                  selected ? "bg-navy-900 text-brand-yellow" : "bg-white/90 text-navy-900"
                }`}
              >
                {m.label}
              </span>
            </button>
          );
        })}

        {pin && (
          <div
            data-map-pin
            role="img"
            aria-label="Pin do local"
            className="absolute -translate-x-1/2 -translate-y-full cursor-move"
            style={{ left: pin.x * s, top: pin.y * s }}
          >
            <svg aria-hidden className="size-10 drop-shadow-lg" viewBox="0 0 24 24">
              <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
              <circle cx="12" cy="9" r="2.5" fill="#fff" />
            </svg>
          </div>
        )}
      </div>

      <div data-map-control className="absolute bottom-4 right-4 z-10 flex flex-col overflow-hidden rounded-lg bg-white shadow-lg">
        <button type="button" aria-label={t.map.zoomIn} title={t.map.zoomIn} onClick={() => zoom(1.25)} className="grid size-10 place-items-center text-lg font-bold text-navy-900 hover:bg-slate-100">
          +
        </button>
        <button type="button" aria-label={t.map.zoomOut} title={t.map.zoomOut} onClick={() => zoom(0.8)} className="grid size-10 place-items-center border-t border-slate-200 text-lg font-bold text-navy-900 hover:bg-slate-100">
          −
        </button>
        <button
          type="button"
          aria-label={t.map.recenter}
          title={t.map.recenter}
          onClick={() => setView({ cx: MAP_WIDTH / 2, cy: MAP_HEIGHT / 2, scale: 1 })}
          className="grid size-10 place-items-center border-t border-slate-200 text-navy-900 hover:bg-slate-100"
        >
          <svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
