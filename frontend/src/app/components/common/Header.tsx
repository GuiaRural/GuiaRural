'use client';

import { useLanguage } from "../../context/LanguageContext";

interface HeaderProps {
  menuId?: string;
  menuOpen?: boolean;
  onToggleMenu?: () => void;
}

export default function Header({
  menuId,
  menuOpen,
  onToggleMenu,
}: HeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="relative z-50 flex h-14 shrink-0 items-center gap-3 bg-[#0B1A30] px-4 text-white">
      <button
        type="button"
        aria-label={menuOpen ? t.sidebar.closeMenu : t.sidebar.openMenu}
        aria-expanded={menuOpen}
        aria-controls={menuId}
        onClick={onToggleMenu}
        className="grid size-9 place-items-center rounded-md hover:bg-white/10 focus-visible:outline-2"
      >
        <svg aria-hidden className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Símbolo do GuiaRural em SVG + Texto */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/30 p-1.5 border border-blue-400/30">
          <svg viewBox="0 0 24 24" fill="none" className="h-full w-full text-blue-400" stroke="currentColor" strokeWidth="2">
            <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" fill="currentColor" fillOpacity="0.2" />
            <circle cx="12" cy="12" r="3" className="fill-blue-400" />
          </svg>
        </div>
        <div className="leading-tight">
          <p className="text-base font-bold tracking-tight text-white">GuiaRural</p>
          <p className="text-[10px] font-medium tracking-wider text-slate-300">UFRPE</p>
        </div>
      </div>

      <span className="mx-1 hidden h-6 w-px bg-white/20 sm:block" />

      <p className="hidden items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs sm:flex">
        <span aria-hidden className="size-2 rounded-full bg-emerald-400" />
        {t.header.publicPlatform}
      </p>
    </header>
  );
}