"use client";

import Link from "next/link";
import { useLanguage } from "../../context/LanguageContext";
import type { Dictionary } from "../../i18n/dictionaries";

type NavKey = keyof Dictionary["sidebar"];
type Item = { key: NavKey; href: string; badge?: string; sub?: boolean };

const NAV: Item[] = [
  { key: "map", href: "/", badge: "GPS" },
  { key: "stops", href: "/portarias-e-paradas", sub: true },
  { key: "eat", href: "/onde-comer", sub: true },
  { key: "study", href: "/espacos-de-estudo", sub: true },
  { key: "notices", href: "/avisos", badge: "3" },
  { key: "courses", href: "/cursos" },
  { key: "services", href: "/servicos" },
  { key: "weeklyMenu", href: "/cardapio", sub: true },
];

const WELCOME: Item[] = [
  { key: "culture", href: "/acolhimento/cultura" },
  { key: "documents", href: "/acolhimento/documentos" },
  { key: "freshmanGuide", href: "/acolhimento/calouro" },
  { key: "recifeGuide", href: "/acolhimento/recife" },
];

const SUPPORT: Item[] = [
  { key: "contactTeam", href: "/contato" },
  { key: "accessibility", href: "/acessibilidade" },
  { key: "admin", href: "/admin" },
];

function NavGroup({ items, current }: { items: Item[]; current: string }) {
  const { t } = useLanguage();
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const active = item.href === current;
        return (
          <li key={item.key}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-brand-yellow ${
                item.sub ? "ml-4 text-slate-300" : "text-white"
              } ${active ? "bg-navy-700 font-semibold" : "hover:bg-white/10"}`}
            >
              <span>{t.sidebar[item.key]}</span>
              {item.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    item.badge === "GPS" ? "bg-brand-yellow text-navy-900" : "bg-red-600 text-white"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-1 mt-5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
      {children}
    </h2>
  );
}

export default function Sidebar({ id, open, onClose }: { id: string; open: boolean; onClose: () => void }) {
  const { t } = useLanguage();

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label={t.sidebar.closeMenu}
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}
      <aside
        id={id}
        className={`fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto bg-navy-900 px-3 pb-6 pt-16 text-white transition-transform md:static md:z-auto md:translate-x-0 md:pt-4 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav aria-label={t.sidebar.campusNavigation}>
          <div className="px-3 pb-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.sidebar.campusNavigation}
            </h2>
            <p className="mt-1 font-semibold">{t.sidebar.campusName}</p>
          </div>
          <p className="border-t border-white/10 px-3 pt-3 text-xs text-slate-400">{t.sidebar.cityLabel}</p>
          <div className="mt-2">
            <NavGroup items={NAV} current="/" />
          </div>
          <SectionTitle>{t.sidebar.welcomeSection}</SectionTitle>
          <NavGroup items={WELCOME} current="/" />
          <SectionTitle>{t.sidebar.supportSection}</SectionTitle>
          <NavGroup items={SUPPORT} current="/" />
        </nav>
      </aside>
    </>
  );
}
