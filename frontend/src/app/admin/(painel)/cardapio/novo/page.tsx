"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useAdmin } from "../../../../components/admin/AdminShell";
import type { Menu, Shift } from "../../../../data/mockMenus";
import { setFlash } from "../../../../lib/flash";
import { primaryButton, secondaryButton } from "../../../../components/admin/PageHeader";
import { MenuValidationError, SHIFT_LABELS, createMenu, formatMenuDate, listMenus } from "../../../../services/menuService";

type Fields = Omit<Menu, "id">;
const EMPTY: Fields = { date: "", shift: "almoco", main: "", vegetarian: "", sides: "", salad: "", dessert: "", drink: "" };

const DISHES: { key: keyof Fields; label: string; placeholder: string; required?: boolean }[] = [
  { key: "main", label: "Prato principal", placeholder: "Ex: Frango grelhado ao molho de ervas", required: true },
  { key: "vegetarian", label: "Opção vegetariana", placeholder: "Ex: Escondidinho de macaxeira com legumes", required: true },
  { key: "sides", label: "Acompanhamentos", placeholder: "Ex: Arroz, feijão carioca e farofa" },
  { key: "salad", label: "Salada", placeholder: "Ex: Alface, tomate e cenoura" },
  { key: "dessert", label: "Sobremesa", placeholder: "Ex: Banana" },
  { key: "drink", label: "Bebida", placeholder: "Ex: Suco de acerola" },
];

function describe(m: Menu) {
  return `${formatMenuDate(m.date)} · ${SHIFT_LABELS[m.shift]} — ${m.main}`;
}

// UC25 — Criar cardápio do RU: formulário (passos 2 e 3), cancelar (FA01) e clonar (FA02).
export default function NewMenuPage({ searchParams }: PageProps<"/admin/cardapio/novo">) {
  const { base } = use(searchParams);
  const router = useRouter();
  const { session, setDirty } = useAdmin();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [existing, setExisting] = useState<Menu[]>([]);
  const [baseId, setBaseId] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, true>>>({});
  const [summary, setSummary] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // FA02: copia pratos e turno do cardápio escolhido; a data fica em branco para ser alterada.
  function cloneFrom(id: string, list: Menu[]) {
    setBaseId(id);
    const source = list.find((m) => m.id === id);
    if (!source) return;
    const copy = Object.fromEntries((Object.keys(EMPTY) as (keyof Fields)[]).map((k) => [k, source[k]])) as Fields;
    setFields({ ...copy, date: "" });
    setErrors({});
    setSummary(null);
    setDirty(true);
  }

  useEffect(() => {
    listMenus().then((all) => {
      setExisting(all);
      if (typeof base === "string") cloneFrom(base, all);
    });
    // Só no carregamento: o parâmetro ?base= vem do botão "Duplicar" da listagem.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setDirty(true);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSummary(null);
    try {
      const menu = await createMenu(
        Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v.trim()])) as Fields,
        session.name,
      );
      setDirty(false);
      setFlash(`Cardápio do RU criado com sucesso: ${SHIFT_LABELS[menu.shift].toLowerCase()} de ${formatMenuDate(menu.date)} já está no Cardápio da semana.`);
      router.push("/admin/cardapio");
    } catch (err) {
      // FE01: campos obrigatórios em branco ou dia/turno já cadastrado.
      if (err instanceof MenuValidationError) {
        setErrors(Object.fromEntries(err.fields.map((f) => [f, true])));
        setSummary(err.message);
      } else {
        setSummary("Não foi possível criar o cardápio. Nenhum dado foi salvo; tente novamente.");
      }
      setSaving(false);
    }
  }

  const inputCls = (key: keyof Fields) =>
    `h-11 w-full rounded-lg border bg-stone-50 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-navy-700 focus:bg-white focus:ring-2 focus:ring-brand-yellow ${
      errors[key] ? "border-red-500 bg-red-50/50" : "border-stone-200"
    }`;

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="sticky top-0 z-20 -mx-4 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:-mx-6 sm:rounded-b-xl sm:px-6">
        <div>
          <nav aria-label="Trilha" className="text-[11px] text-slate-500">
            <Link href="/admin" className="hover:underline">
              Início
            </Link>{" "}
            ›{" "}
            <Link href="/admin/cardapio" className="hover:underline">
              Cardápio do RU
            </Link>{" "}
            › <span className="font-semibold text-slate-800">Criar cardápio</span>
          </nav>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-navy-900 sm:text-2xl">Criar cardápio do RU</h1>
            <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
              <span aria-hidden className="size-1.5 rounded-full bg-amber-500" />
              {baseId ? "Duplicando cardápio" : "Modo de criação"}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* FA01 */}
          <Link
            href="/admin/cardapio"
            onClick={() => setDirty(false)}
            className={`${secondaryButton} h-10`}
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className={`${primaryButton} h-10 gap-2`}
          >
            {saving && <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {saving ? "Salvando..." : "Salvar e publicar"}
          </button>
        </div>
      </div>

      {summary && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {summary}
        </div>
      )}

      {/* FA02 */}
      <Section title="Duplicar / Clonar cardápio existente" subtitle="Opcional: use um cardápio já cadastrado como base e altere a data e os pratos que mudaram.">
        <select
          aria-label="Cardápio base"
          value={baseId}
          onChange={(e) => (e.target.value ? cloneFrom(e.target.value, existing) : setBaseId(""))}
          className="h-11 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-slate-900 outline-none focus:border-navy-700 focus:ring-2 focus:ring-brand-yellow"
        >
          <option value="">Começar do zero</option>
          {existing.map((m) => (
            <option key={m.id} value={m.id}>
              {describe(m)}
            </option>
          ))}
        </select>
      </Section>

      <Section title="Dia e turno" subtitle="Só é possível um cardápio por dia e turno.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="mn-date" label="Data de referência" required>
            <input id="mn-date" type="date" className={inputCls("date")} value={fields.date} onChange={(e) => update("date", e.target.value)} aria-invalid={!!errors.date} />
          </Field>
          <fieldset>
            <legend className="block text-xs font-bold text-slate-800">
              Turno <span className="text-red-600">*</span>
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(Object.keys(SHIFT_LABELS) as Shift[]).map((s) => (
                <label
                  key={s}
                  className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-semibold has-focus-visible:ring-2 has-focus-visible:ring-brand-yellow ${
                    fields.shift === s ? "border-navy-900 bg-navy-900 text-white" : errors.shift ? "border-red-500 bg-red-50/50 text-slate-800" : "border-stone-200 bg-stone-50 text-slate-800 hover:bg-white"
                  }`}
                >
                  <input type="radio" name="shift" value={s} checked={fields.shift === s} onChange={() => update("shift", s)} className="sr-only" />
                  {SHIFT_LABELS[s]}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </Section>

      <Section title="Refeições" subtitle="Prato principal e opção vegetariana são obrigatórios.">
        <div className="grid gap-4 sm:grid-cols-2">
          {DISHES.map((d) => (
            <Field key={d.key} id={`mn-${d.key}`} label={d.label} required={d.required}>
              <input
                id={`mn-${d.key}`}
                className={inputCls(d.key)}
                placeholder={d.placeholder}
                value={fields[d.key]}
                onChange={(e) => update(d.key, e.target.value)}
                aria-invalid={!!errors[d.key]}
              />
            </Field>
          ))}
        </div>
      </Section>
    </form>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <h2 className="font-bold text-navy-900">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}

function Field({ id, label, required, children }: { id: string; label: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-slate-800">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
