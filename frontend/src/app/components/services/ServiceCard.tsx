"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLanguage } from "../../context/LanguageContext";
import type { Servico } from "../../services/servicosService";
import Icon from "../common/Icon";

// Card padrão de um serviço, compartilhado entre o painel admin e a página pública /servicos (UC11).
// `actions` (botões Editar/Deletar) só é passado pelo painel admin; `isNew` destaca um serviço recém-criado.
export default function ServiceCard({ servico, actions, isNew = false }: { servico: Servico; actions?: ReactNode; isNew?: boolean }) {
  const { t } = useLanguage();
  const hasDetails = Boolean(servico.requirements || servico.deadline || servico.url);

  return (
    <article className={`rounded-2xl border bg-white p-5 shadow-sm sm:p-6 ${isNew ? "border-emerald-400 ring-2 ring-emerald-100" : "border-slate-200"}`}>
      <div className="flex flex-wrap items-start gap-4">
        <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-navy-700">
          <Icon name="ticket" className="size-5" />
        </span>
        <div className="min-w-0 flex-1 basis-48">
          <h2 className="flex flex-wrap items-center gap-2 font-bold text-navy-900 sm:text-lg">
            {servico.name}
            {isNew && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">{t.serviceCard.newBadge}</span>
            )}
          </h2>
          <p className="text-sm text-slate-600">
            {servico.category} • {servico.sector}
          </p>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>

      <p className="mt-4 text-sm text-slate-700">{servico.description}</p>

      {/* Onde o serviço é prestado: vínculo feito no formulário de local (só locais publicados chegam aqui). */}
      {servico.places.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-navy-700">{t.serviceCard.whereToFind}</span>
          {servico.places.map((place) => (
            <Link
              key={place.slug}
              href={`/locais/${place.slug}`}
              lang="pt"
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-navy-900 hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700"
            >
              {place.name}
            </Link>
          ))}
        </div>
      )}

      <div className={`mt-4 grid gap-4 ${hasDetails ? "lg:grid-cols-3" : ""}`}>
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-700">
            <span aria-hidden className="size-1.5 rounded-full bg-navy-700" />
            {t.serviceCard.howToApply}
          </h3>
          <ol className="mt-3 space-y-2">
            {servico.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full bg-navy-700 text-xs font-bold text-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        {hasDetails && (
          <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {servico.requirements && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy-700">{t.serviceCard.requirements}</h3>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{servico.requirements}</p>
              </div>
            )}
            {servico.deadline && (
              <div>
                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-navy-700">
                  <Icon name="clock" className="size-3.5" />
                  {t.serviceCard.deadline}
                </h3>
                <p className="mt-2 text-sm text-slate-700">{servico.deadline}</p>
              </div>
            )}
            {servico.url && (
              <a
                href={servico.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                <Icon name="link" className="size-4" />
                {t.serviceCard.openLink}
                <span className="sr-only">({t.serviceCard.newTab})</span>
              </a>
            )}
          </section>
        )}
      </div>
    </article>
  );
}
