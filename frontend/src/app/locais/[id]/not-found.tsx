"use client";

import Link from "next/link";
import AppShell from "../../components/common/AppShell";
import Icon from "../../components/common/Icon";
import { useLanguage } from "../../context/LanguageContext";

// Exibido quando a página chama notFound() (id que não existe em /locais/[id]).
export default function PlaceNotFound() {
  const { t } = useLanguage();

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
            <Icon name="pin" className="mx-auto size-10 text-slate-400" />
            <h1 className="mt-3 text-lg font-bold text-navy-900">{t.place.notFoundTitle}</h1>
            <p className="mt-1 text-sm text-slate-600">{t.place.notFoundText}</p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-brand-yellow"
            >
              <Icon name="arrow" className="size-4 rotate-180" />
              {t.place.backToMap}
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
