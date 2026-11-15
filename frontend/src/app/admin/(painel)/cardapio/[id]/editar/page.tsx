"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useAdmin } from "../../../../../components/admin/AdminShell";
import { setFlash } from "../../../../../lib/flash";
import { primaryButton, secondaryButton } from "../../../../../components/admin/PageHeader";
import {
  MenuValidationError,
  SHIFT_LABELS,
  getMenuById,
  updateMenu,
  type MenuInput,
  type Shift,
} from "../../../../../services/menuService";

type Fields = MenuInput;
const EMPTY: Fields = { date: "", shift: "almoco", main: "", vegetarian: "", sides: "", salad: "", dessert: "", drink: "" };

const DISHES: { key: keyof Fields; label: string; placeholder: string; required?: boolean }[] = [
  { key: "main", label: "Prato principal", placeholder: "Ex: Frango grelhado ao molho de ervas", required: true },
  { key: "vegetarian", label: "Opção vegetariana", placeholder: "Ex: Escondidinho de macaxeira com legumes", required: true },
  { key: "sides", label: "Acompanhamentos", placeholder: "Ex: Arroz, feijão carioca e farofa" },
  { key: "salad", label: "Salada", placeholder: "Ex: Alface, tomate e cenoura" },
  { key: "dessert", label: "Sobremesa", placeholder: "Ex: Banana" },
  { key: "drink", label: "Bebida", placeholder: "Ex: Suco de acerola" },
];

export default function EditMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { session, setDirty } = useAdmin();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, true>>>({});
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  // Só salva o que foi carregado do servidor: sem isso, "Salvar" mandaria o formulário vazio.
  const [menuId, setMenuId] = useState<number | null>(null);

  useEffect(() => {
    getMenuById(id).then(
      (menu) => {
        if (!menu) {
          setSummary("Cardápio não encontrado. Ele pode ter sido excluído por outro administrador.");
        } else {
          const { id: loadedId, ...rest } = menu;
          setMenuId(loadedId);
          setFields(rest);
        }
        setLoading(false);
      },
      () => {
        setSummary("Não foi possível carregar o cardápio. Recarregue a página para tentar novamente.");
        setLoading(false);
      },
    );
  }, [id]);

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setDirty(true);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();

    // CT-026.04: Validação de Sessão Expirada ao tentar salvar
    if (!session || !session.name) {
      setDirty(false);
      router.push("/admin/login?expired=true");
      return;
    }

    if (menuId === null) return;

    setSaving(true);
    setSummary(null);

    try {
      // O servidor registra quem editou (sessão) e grava o antes e o depois no histórico.
      await updateMenu(menuId, fields);

      setDirty(false);
      setFlash("Cardápio atualizado com sucesso!");
      router.push("/admin/cardapio");
    } catch (err) {
      if (err instanceof MenuValidationError) {
        setErrors(Object.fromEntries(err.fields.map((f) => [f, true])));
        setSummary(err.message);
      } else {
        setSummary("Não foi possível salvar as alterações. Tente novamente.");
      }
      setSaving(false);
    }
  }

  function handleCancelClick() {
    setShowCancelModal(true);
  }

  function confirmCancel() {
    setDirty(false);
    router.push("/admin/cardapio");
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="size-6 animate-spin rounded-full border-2 border-navy-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
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
              › <span className="font-semibold text-slate-800">Editar cardápio</span>
            </nav>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-navy-900 sm:text-2xl">Editar cardápio do RU</h1>
              <span className="flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-800">
                <span aria-hidden className="size-1.5 rounded-full bg-blue-600" />
                Modo de edição
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCancelClick}
              className={`${secondaryButton} h-10`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || menuId === null}
              className={`${primaryButton} h-10 gap-2`}
            >
              {saving && <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>

        {summary && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {summary}
          </div>
        )}

        <Section title="Dia e turno" subtitle="Só é possível um cardápio por dia e turno.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="mn-date" label="Data de referência" required>
              <input
                id="mn-date"
                type="date"
                className={inputCls("date", errors)}
                value={fields.date}
                onChange={(e) => update("date", e.target.value)}
                aria-invalid={!!errors.date}
              />
            </Field>
            <fieldset>
              <legend className="block text-xs font-bold text-slate-800">
                Turno <span className="text-red-600">*</span>
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(Object.keys(SHIFT_LABELS) as Shift[]).map((s) => (
                  <label
                    key={s}
                    className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-semibold ${
                      fields.shift === s
                        ? "border-navy-900 bg-navy-900 text-white"
                        : errors.shift
                        ? "border-red-500 bg-red-50/50 text-slate-800"
                        : "border-stone-200 bg-stone-50 text-slate-800 hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shift"
                      value={s}
                      checked={fields.shift === s}
                      onChange={() => update("shift", s)}
                      className="sr-only"
                    />
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
                  className={inputCls(d.key, errors)}
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

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-xl">
            <h3 className="font-bold text-slate-900">Descartar alterações?</h3>
            <p className="text-xs text-slate-500">As alterações não salvas serão perdidas e o cardápio original será mantido.</p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Continuar editando
              </button>
              <button
                type="button"
                onClick={confirmCancel}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function inputCls(key: keyof Fields, errors: Partial<Record<keyof Fields, true>>) {
  return `h-11 w-full rounded-lg border bg-stone-50 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-navy-700 focus:bg-white focus:ring-2 focus:ring-brand-yellow ${
    errors[key] ? "border-red-500 bg-red-50/50" : "border-stone-200"
  }`;
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