import type { ReactNode } from "react";

export default function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export const primaryButton =
  "inline-flex items-center gap-1 rounded-lg bg-brand-yellow px-4 py-2 text-sm font-bold text-navy-900 shadow-sm hover:brightness-95 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-navy-900";
export const secondaryButton =
  "inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60";
export const inputClass =
  "h-10 w-full rounded-md border bg-white px-3 text-sm text-slate-900 outline-none focus:border-navy-700 focus:ring-2 focus:ring-brand-yellow";
