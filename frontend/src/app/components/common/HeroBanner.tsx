import Icon from "./Icon";

export default function HeroBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 to-navy-700 px-6 py-10 text-white sm:px-8 sm:py-14 lg:min-h-64">
      <Icon
        name="compass"
        className="pointer-events-none absolute -right-6 top-1/2 -z-10 hidden size-56 -translate-y-1/2 text-white/10 sm:block"
      />
      <h1 className="max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-sm text-slate-200">{subtitle}</p>
    </section>
  );
}
