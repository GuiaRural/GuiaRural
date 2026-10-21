import Icon from "./Icon";
import LanguageSwitcher from "./LanguageSwitcher";

export default function PageFooter({
  brand,
  tagline,
  institution,
  scale,
}: {
  brand: string;
  tagline: string;
  institution: string;
  scale: string;
}) {
  return (
    <>
      <footer className="mt-12 flex flex-wrap items-start justify-between gap-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        <p className="max-w-md">
          <span className="text-navy-900">{brand}</span> {tagline}
        </p>
        <p className="max-w-sm sm:text-right">{institution}</p>
      </footer>
      <div className="fixed bottom-4 right-4 z-10 flex flex-col items-end gap-2">
        <p className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 shadow">
          <Icon name="map" className="size-3" />
          {scale}
        </p>
        <LanguageSwitcher />
      </div>
    </>
  );
}
