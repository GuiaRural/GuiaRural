"use client";

import { useLanguage } from "../../context/LanguageContext";

export default function Header({
  menuId,
  menuOpen,
  onToggleMenu,
}: {
  menuId: string;
  menuOpen: boolean;
  onToggleMenu: () => void;
}) {
  const { t } = useLanguage();

  return (
    <header className="relative z-50 flex h-14 shrink-0 items-center gap-3 bg-navy-900 px-4 text-white">
      <button
        type="button"
        aria-label={menuOpen ? t.sidebar.closeMenu : t.sidebar.openMenu}
        aria-expanded={menuOpen}
        aria-controls={menuId}
        onClick={onToggleMenu}
        className="grid size-9 place-items-center rounded-md hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-brand-yellow md:hidden"
      >
        <svg aria-hidden className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="leading-tight">
        <p className="text-base font-semibold">GuiaRural</p>
        <p className="text-[10px] tracking-wide text-slate-300">UFRPE</p>
      </div>
      <span className="mx-1 hidden h-6 w-px bg-white/20 sm:block" />
      <p className="hidden items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs sm:flex">
        <span aria-hidden className="size-2 rounded-full bg-emerald-400" />
        {t.header.publicPlatform}
      </p>
    </header>
  );
}
