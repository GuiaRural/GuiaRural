import type { ReactNode } from "react";
import type { Aviso } from "../../services/avisosService";
import Icon from "../common/Icon";

// Card de um aviso, compartilhado entre o painel admin e a página pública de avisos.
// `latestLabel` marca o card como o aviso mais recente (destaque amarelo + selo).
// `actions` (botões Editar/Deletar) só é passado pelo painel admin.
export default function AvisoCard({
  aviso,
  latestLabel,
  locale = "pt-BR",
  actions,
}: {
  aviso: Aviso;
  latestLabel?: string;
  locale?: string;
  actions?: ReactNode;
}) {
  const date = new Date(aviso.data);
  const latest = latestLabel !== undefined;

  return (
    <article className={`flex overflow-hidden rounded-xl border bg-white shadow-sm ${latest ? "border-brand-yellow" : "border-slate-200"}`}>
      <time
        dateTime={aviso.data}
        className={`flex w-24 shrink-0 flex-col items-center justify-center border-l-4 py-6 text-navy-900 sm:w-36 ${
          latest ? "border-brand-yellow bg-amber-50" : "border-navy-900 bg-sand-100"
        }`}
      >
        <span className="text-3xl font-bold sm:text-4xl">{date.getDate()}</span>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-widest">{date.toLocaleDateString(locale, { month: "long" })}</span>
        <span className="text-xs text-slate-600">{date.getFullYear()}</span>
      </time>

      <div className="flex min-w-0 flex-1 items-start gap-4 p-4 sm:p-6">
        <span
          aria-hidden
          className={`hidden size-10 shrink-0 place-items-center rounded-lg sm:grid ${
            latest ? "bg-brand-yellow text-navy-900" : "bg-slate-100 text-navy-700"
          }`}
        >
          <Icon name="megaphone" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="min-w-0 flex-1 basis-48 font-bold text-navy-900 sm:text-lg">{aviso.nome}</h2>
            {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
          </div>
          {latest && (
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-yellow px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy-900">
              <span aria-hidden className="size-1.5 rounded-full bg-red-600" />
              {latestLabel}
            </span>
          )}
          <p className="mt-2 text-sm text-slate-600">{aviso.descricao}</p>
        </div>
      </div>
    </article>
  );
}
