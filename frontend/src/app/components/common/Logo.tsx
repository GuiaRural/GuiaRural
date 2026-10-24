// Marca do GuiaRural usada nos cabeçalhos público e do painel.
export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg aria-hidden className="size-8 text-white" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="16" cy="16" r="11" strokeDasharray="1.5 2" />
        <path d="M16 2 18.2 13.8 30 16 18.2 18.2 16 30 13.8 18.2 2 16 13.8 13.8Z" fill="currentColor" stroke="none" />
        <path d="m7 7 9 9 9-9M7 25l9-9 9 9" strokeLinecap="round" />
      </svg>
      <div className="leading-tight">
        <p className="text-base font-semibold">GuiaRural</p>
        <p className="text-[10px] tracking-wide text-slate-300">UFRPE</p>
      </div>
    </div>
  );
}
