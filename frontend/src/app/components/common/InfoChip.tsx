import type { ReactNode } from "react";
import Icon, { type IconName } from "./Icon";

const TONES = {
  outline: "border border-slate-200 bg-white text-slate-600",
  yellow: "border border-brand-yellow bg-brand-yellow/60 text-navy-900",
} as const;

export default function InfoChip({
  icon,
  tone = "outline",
  href,
  children,
}: {
  icon: IconName;
  tone?: keyof typeof TONES;
  href?: string;
  children: ReactNode;
}) {
  const className = `inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${TONES[tone]}`;
  const content = (
    <>
      <Icon name={icon} className="size-3.5" />
      {children}
    </>
  );

  return href ? (
    <a href={href} className={`${className} focus-visible:outline-2 focus-visible:outline-navy-700`}>
      {content}
    </a>
  ) : (
    <p className={className}>{content}</p>
  );
}
