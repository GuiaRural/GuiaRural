import Link from "next/link";
import Icon from "./Icon";

export default function Breadcrumb({
  label,
  homeLabel,
  currentLabel,
}: {
  label: string;
  homeLabel: string;
  currentLabel: string;
}) {
  return (
    <nav aria-label={label} className="text-xs text-slate-600">
      <ol className="flex items-center gap-2">
        <li>
          <Link href="/" className="flex items-center gap-1 hover:underline focus-visible:outline-2 focus-visible:outline-navy-700">
            <Icon name="home" className="size-3.5" />
            {homeLabel}
          </Link>
        </li>
        <li aria-hidden className="text-slate-400">
          /
        </li>
        <li aria-current="page" className="font-semibold text-navy-900">
          {currentLabel}
        </li>
      </ol>
    </nav>
  );
}
