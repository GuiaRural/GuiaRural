"use client";

import { useLanguage } from "../../context/LanguageContext";

// FE-40.01: falha ao carregar o guia, com opção de tentar novamente.
export default function GuideLoadError({ onRetry }: { onRetry: () => void }) {
  const { t } = useLanguage();

  return (
    <div role="alert" className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
      <h2 className="text-lg font-bold text-navy-900">{t.guide.errorTitle}</h2>
      <p className="mt-1 text-sm text-slate-600">{t.guide.errorText}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-brand-yellow"
      >
        {t.guide.retry}
      </button>
    </div>
  );
}
