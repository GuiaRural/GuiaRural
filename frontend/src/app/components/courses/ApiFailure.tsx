"use client";

import { useLanguage } from "../../context/LanguageContext";
import { isNotFound } from "../../lib/api";

// Falha ao consultar a API: 404/400 viram "não encontrado"; o resto (rede, 500) oferece tentar de novo.
export default function ApiFailure({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const { t } = useLanguage();

  if (isNotFound(error)) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow">
        <h1 className="text-xl font-bold text-navy-900">{t.courses.notFoundTitle}</h1>
        <p className="mt-2 text-sm text-slate-600">{t.courses.notFoundText}</p>
      </div>
    );
  }

  return (
    <div role="alert" className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
      <h2 className="text-lg font-bold text-navy-900">{t.courses.loadErrorTitle}</h2>
      <p className="mt-1 text-sm text-slate-600">{t.courses.loadErrorText}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-brand-yellow"
      >
        {t.courses.retry}
      </button>
    </div>
  );
}
