import Link from "next/link";
import type { GuideTip, RecifeGuide } from "../../data/mockGuide";
import Icon from "./Icon";

function TipCard({ tip }: { tip: GuideTip }) {
  const linkContent = (
    <>
      {tip.link.label}
      <Icon name="arrow" className="size-3" />
    </>
  );
  const linkClass = "mt-3 inline-flex items-center gap-1 text-xs font-bold text-navy-900";

  return (
    <article className="flex flex-col rounded-xl bg-sand-100 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-navy-900">
        <Icon name={tip.icon} className="size-4" />
        {tip.title}
      </h3>
      <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-600">{tip.text}</p>
      {tip.link.href ? (
        <a href={tip.link.href} className={`${linkClass} hover:underline`}>
          {linkContent}
        </a>
      ) : (
        <p className={linkClass}>{linkContent}</p>
      )}
    </article>
  );
}

export default function GuideTipsSection({
  id,
  title,
  subtitle,
  partnerships,
  tips,
  support,
}: {
  id: string;
  title: string;
  subtitle: string;
  partnerships: string;
  tips: GuideTip[];
  support: RecifeGuide["support"];
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mt-12 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-yellow text-navy-900">
            <Icon name="bus" className="size-5" />
          </span>
          <div>
            <h2 id={`${id}-title`} className="text-xl font-bold tracking-tight text-navy-900">
              {title}
            </h2>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-600">
          <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
          {partnerships}
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {tips.map((tip) => (
          <TipCard key={tip.id} tip={tip} />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-100 px-4 py-3 text-xs text-slate-600">
        <p className="flex items-center gap-2">
          <Icon name="headset" className="size-4 shrink-0 text-navy-900" />
          <span>
            {support.before}
            <strong className="text-navy-900">{support.bold}</strong>
            {support.after}
          </span>
        </p>
        <Link
          href="/contato"
          className="rounded-md bg-white px-3 py-1.5 font-bold text-navy-900 shadow-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-navy-700"
        >
          {support.cta}
        </Link>
      </div>
    </section>
  );
}
