"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdmin } from "../../../components/admin/AdminShell";
import PageHeader, { ctaButton, secondaryButton } from "../../../components/admin/PageHeader";
import { ConfirmModal } from "../../../components/ui/Modal";
import { takeFlash } from "../../../lib/flash";
import { SHIFT_LABELS, deleteMenu, formatMenuDate, listMenus, type Menu } from "../../../services/menuService";

const FILTERS = [
  ["proximos", "Próximos"],
  ["anteriores", "Anteriores"],
  ["todos", "Todos"],
] as const;
type Filter = (typeof FILTERS)[number][0];

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// UC25 / UC26 / UC27 — Gerenciamento, edição e exclusão dos cardápios do RU.
export default function MenusAdminPage() {
  const { session } = useAdmin();
  // Contas "Somente leitura" veem os cardápios, mas não podem alterá-los.
  const canManage = session.permission !== "leitura";
  const [menus, setMenus] = useState<Menu[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState<Filter>("proximos");
  const [message, setMessage] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Menu | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Recarrega do servidor; outro administrador pode ter mudado algo enquanto a aba estava em segundo plano.
  const refreshMenus = () => {
    const flash = takeFlash();
    listMenus().then(
      (all) => {
        setMenus(all);
        setLoadError(false);
        if (flash) setMessage(flash);
      },
      () => setLoadError(true),
    );
  };

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteMenu(toDelete.id);
      setMenus((list) => list?.filter((m) => m.id !== toDelete.id) ?? null);
      setMessage(
        `Cardápio de ${SHIFT_LABELS[toDelete.shift].toLowerCase()} de ${formatMenuDate(toDelete.date)} excluído. A exclusão fica registrada no histórico de mudanças.`,
      );
      setToDelete(null);
    } catch {
      // O modal continua aberto para nova tentativa.
      setDeleteError("Não foi possível excluir o cardápio. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  }

  // Carrega ao montar e escuta atualizações da janela/foco
  useEffect(() => {
    refreshMenus();

    // Recarrega se a janela/aba receber foco novamente
    window.addEventListener("focus", refreshMenus);
    return () => {
      window.removeEventListener("focus", refreshMenus);
    };
  }, []);

  const today = todayIso();
  const filtered = (menus ?? []).filter((m) => (filter === "todos" ? true : filter === "proximos" ? m.date >= today : m.date < today));
  const ordered = filter === "anteriores" ? [...filtered].reverse() : filtered;

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Cardápio da semana / RU"
        subtitle="Refeições do Restaurante Universitário publicadas na página pública Cardápio da semana."
        actions={
          <>
            <Link href="/cardapio" className={`${secondaryButton} h-11`}>
              Ver página pública
            </Link>
            {canManage && (
              <Link href="/admin/cardapio/novo" className={`${ctaButton} h-11 px-5 text-base`}>
                <span aria-hidden className="text-lg leading-none">+</span> Criar cardápio
              </Link>
            )}
          </>
        }
      />

      {loadError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Não foi possível carregar os cardápios.{" "}
          <button type="button" onClick={refreshMenus} className="font-semibold underline">
            Tentar novamente
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Filtrar cardápios" className="flex gap-1 rounded-full bg-slate-200/70 p-1">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${filter === key ? "bg-navy-900 text-white" : "text-slate-700 hover:bg-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs font-semibold text-slate-500">{filtered.length} cardápios</p>
      </div>

      {message && (
        <p role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
          {message}
          <Link href="/cardapio" className="font-semibold underline">
            Ver no Cardápio da semana
          </Link>
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wide text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 font-semibold">Dia</th>
              <th className="px-4 py-3 font-semibold">Turno</th>
              <th className="px-4 py-3 font-semibold">Prato principal</th>
              <th className="px-4 py-3 font-semibold">Opção vegetariana</th>
              <th className="px-4 py-3 font-semibold">Sobremesa</th>
              <th className="px-4 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!menus && !loadError && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Carregando...
                </td>
              </tr>
            )}
            {menus && ordered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Nenhum cardápio neste filtro.{" "}
                  {canManage && (
                    <Link href="/admin/cardapio/novo" className="font-semibold text-navy-900 underline">
                      Criar cardápio
                    </Link>
                  )}
                </td>
              </tr>
            )}
            {ordered.map((m) => (
              <tr key={m.id}>
                <td className="whitespace-nowrap px-4 py-3">
                  <p className="font-semibold capitalize text-slate-900">{formatMenuDate(m.date, "pt-BR", { weekday: "long" })}</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    {formatMenuDate(m.date, "pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    {m.date === today && <span className="rounded-full bg-brand-yellow px-1.5 font-bold text-navy-900">Hoje</span>}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                      m.shift === "almoco" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-indigo-200 bg-indigo-50 text-indigo-800"
                    }`}
                  >
                    {SHIFT_LABELS[m.shift]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-800">{m.main}</td>
                <td className="px-4 py-3 text-slate-700">{m.vegetarian}</td>
                <td className="px-4 py-3 text-slate-700">{m.dessert || "—"}</td>
                <td className="px-4 py-3">
                  {canManage && (
                    <div className="flex justify-end gap-2">
                      {/* UC26 — Editar cardápio */}
                      <Link
                        href={`/admin/cardapio/${m.id}/editar`}
                        aria-label={`Editar cardápio: ${SHIFT_LABELS[m.shift].toLowerCase()} de ${formatMenuDate(m.date)}`}
                        className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                      >
                        Editar
                      </Link>

                      {/* FA02 — Duplicar */}
                      <Link
                        href={`/admin/cardapio/novo?base=${m.id}`}
                        aria-label={`Duplicar cardápio: ${SHIFT_LABELS[m.shift].toLowerCase()} de ${formatMenuDate(m.date)}`}
                        className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                      >
                        Duplicar
                      </Link>

                      {/* UC27 — Deletar cardápio */}
                      <button
                        type="button"
                        onClick={() => {
                          setMessage(null);
                          setDeleteError(null);
                          setToDelete(m);
                        }}
                        aria-label={`Excluir cardápio: ${SHIFT_LABELS[m.shift].toLowerCase()} de ${formatMenuDate(m.date)}`}
                        className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={toDelete !== null}
        title="Confirmar exclusão de cardápio"
        danger
        busy={deleting}
        confirmLabel="Confirmar exclusão"
        cancelLabel="Cancelar"
        message={
          <>
            <p>Tem certeza de que deseja excluir este cardápio do RU? Esta ação não poderá ser desfeita.</p>
            {toDelete && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
                O {SHIFT_LABELS[toDelete.shift].toLowerCase()} de {formatMenuDate(toDelete.date, "pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })} sairá
                da página pública Cardápio da semana. A exclusão fica registrada no histórico de mudanças.
              </p>
            )}
            {deleteError && (
              <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-700">
                {deleteError}
              </p>
            )}
          </>
        }
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}