"use client";

import { useLanguage } from "../../context/LanguageContext";
import type { Language } from "../../i18n/dictionaries";

// Avisos de tradução de uma página de conteúdo (local, departamento): tradução automática aguardando revisão
// e conteúdo que ainda não tem tradução no idioma da tela. `lang` é o idioma em que o texto de fato veio.
export default function TranslationNotice({ lang, machineTranslated }: { lang: Language; machineTranslated: boolean }) {
  const { t, language } = useLanguage();
  return (
    <>
      {machineTranslated && (
        <p role="note" className="mt-2 inline-block rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
          {t.common.machineTranslated}
        </p>
      )}
      {language !== "pt" && lang === "pt" && (
        <p role="note" className="mt-2 text-xs text-slate-600">
          {t.common.notTranslated}
        </p>
      )}
    </>
  );
}
