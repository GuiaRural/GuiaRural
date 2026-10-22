"use client";

import { useEffect, useState } from "react";
import AppShell from "../components/common/AppShell";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";
import type { Menu } from "../data/mockMenus";
import { formatMenuDate, getWeekMenus } from "../services/menuService";

const LOCALES = { pt: "pt-BR", en: "en-US", es: "es-ES" } as const;

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Publicação do UC25: cardápios cadastrados no painel aparecem aqui.
export default function WeeklyMenuPage() {
  const { t, language } = useLanguage();
  const [menus, setMenus] = useState<Menu[] | null>(null);

  useEffect(() => {
    getWeekMenus().then(setMenus);
  }, []);

  const days = menus ? [...new Set(menus.map((m) => m.date))] : [];
  const today = todayIso();

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-navy-900">{t.weeklyMenu.title}</h1>
              <p className="mt-1 text-sm text-slate-600">{t.weeklyMenu.subtitle}</p>
            </div>
            <LanguageSwitcher />
          </div>

          {!menus && <p className="mt-6 text-sm text-slate-600">{t.common.loading}</p>}
          {menus && days.length === 0 && <p className="mt-6 rounded-lg bg-white p-4 text-sm text-slate-600 shadow-sm">{t.weeklyMenu.empty}</p>}

          <div className="mt-6 space-y-5">
            {days.map((day) => (
              <section key={day} className="rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-2 font-bold capitalize text-navy-900">
                  {formatMenuDate(day, LOCALES[language], { weekday: "long", day: "2-digit", month: "2-digit" })}
                  {day === today && <span className="rounded-full bg-brand-yellow px-2 py-0.5 text-[11px] normal-case text-navy-900">{t.weeklyMenu.today}</span>}
                </h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {menus!
                    .filter((m) => m.date === day)
                    .map((m) => (
                      <div key={m.id} className="rounded-xl border border-slate-200 p-4">
                        <h3 className="text-xs font-bold uppercase tracking-wide text-amber-700">
                          {m.shift === "almoco" ? t.weeklyMenu.lunch : t.weeklyMenu.dinner}
                        </h3>
                        <dl className="mt-2 space-y-1.5 text-sm">
                          {(
                            [
                              [t.weeklyMenu.main, m.main],
                              [t.weeklyMenu.vegetarian, m.vegetarian],
                              [t.weeklyMenu.sides, m.sides],
                              [t.weeklyMenu.salad, m.salad],
                              [t.weeklyMenu.dessert, m.dessert],
                              [t.weeklyMenu.drink, m.drink],
                            ] as const
                          )
                            .filter(([, value]) => value)
                            .map(([label, value]) => (
                              <div key={label}>
                                <dt className="text-xs text-slate-500">{label}</dt>
                                <dd className="font-medium text-slate-900">{value}</dd>
                              </div>
                            ))}
                        </dl>
                      </div>
                    ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
