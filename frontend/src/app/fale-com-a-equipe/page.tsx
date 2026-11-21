"use client";

import AppShell from "../components/common/AppShell";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import ContactForm from "../components/contact/ContactForm";
import { useLanguage } from "../context/LanguageContext";

// UC39: o visitante escreve para a equipe. As mensagens chegam ao painel em /admin/mensagens.
export default function ContactTeamPage() {
  const { t } = useLanguage();

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-navy-900">{t.contact.title}</h1>
              <p className="mt-1 text-sm text-text-2nd">{t.contact.subtitle}</p>
            </div>
            <LanguageSwitcher />
          </div>
          <ContactForm />
        </div>
      </div>
    </AppShell>
  );
}
