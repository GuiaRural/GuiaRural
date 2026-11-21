"use client";

import { useState } from "react";
import { useAdmin } from "../../../components/admin/AdminShell";
import ApiFailure from "../../../components/courses/ApiFailure";
import { useApi } from "../../../hooks/useApi";
import { listMessages, setMessageRead, type Message } from "../../../services/messagesService";

const noArg = null;

type Filter = "all" | "unread";

const chip = "rounded-full px-3 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-navy-900";

// Mensagens que os visitantes mandaram pela tela pública "Falar com a equipe" (UC39), vistas pelo administrador.
export default function AdminMessagesPage() {
  const { session } = useAdmin();
  // Contas "Somente leitura" leem as mensagens, mas não as marcam como lidas.
  const canManage = session.permission !== "leitura";
  const state = useApi(listMessages, noArg);
  const [filter, setFilter] = useState<Filter>("all");
  // Mensagens alteradas nesta visita valem sobre o que veio da lista, sem recarregar.
  const [updated, setUpdated] = useState<Record<number, Message>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const all = state.status === "ready" ? state.data.map((m) => updated[m.id] ?? m) : null;
  const unread = all?.filter((m) => !m.read).length ?? 0;
  const shown = all?.filter((m) => filter === "all" || !m.read) ?? null;

  async function toggleRead(message: Message) {
    setBusyId(message.id);
    setError(null);
    try {
      const next = await setMessageRead(message.id, !message.read);
      setUpdated((map) => ({ ...map, [next.id]: next }));
    } catch {
      setError("Não foi possível atualizar a mensagem. Tente novamente.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-navy-700">
            <span aria-hidden className="h-0.5 w-6 bg-brand-yellow" />
            Contato com os estudantes
          </p>
          <h1 className="mt-2 text-3xl font-bold text-navy-900 sm:text-4xl">Mensagens recebidas</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Dúvidas, sugestões e problemas enviados pela tela pública &quot;Falar com a equipe&quot;. Cada mensagem é apagada
            automaticamente 15 dias depois de enviada.
          </p>
        </div>
        {all && (
          <p className="rounded-lg border border-slate-200 bg-sand-100 px-4 py-2 text-xs text-slate-600">
            <strong className="block text-navy-900">
              {all.length} {all.length === 1 ? "mensagem" : "mensagens"}
            </strong>
            {unread} {unread === 1 ? "não lida" : "não lidas"}
          </p>
        )}
      </div>

      {all && all.length > 0 && (
        <div role="group" aria-label="Filtrar mensagens" className="flex gap-2">
          <button
            type="button"
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
            className={`${chip} ${filter === "all" ? "bg-navy-900 text-white" : "bg-slate-100 text-navy-700 hover:bg-slate-200"}`}
          >
            Todas
          </button>
          <button
            type="button"
            aria-pressed={filter === "unread"}
            onClick={() => setFilter("unread")}
            className={`${chip} ${filter === "unread" ? "bg-navy-900 text-white" : "bg-slate-100 text-navy-700 hover:bg-slate-200"}`}
          >
            Não lidas
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {state.status === "loading" && <p className="text-sm text-slate-600">Carregando mensagens...</p>}
      {state.status === "error" && <ApiFailure error={state.error} onRetry={state.retry} />}
      {all?.length === 0 && <p className="rounded-lg bg-white p-4 text-sm text-slate-600 shadow-sm">Nenhuma mensagem recebida ainda.</p>}
      {all && all.length > 0 && shown?.length === 0 && (
        <p className="rounded-lg bg-white p-4 text-sm text-slate-600 shadow-sm">Nenhuma mensagem não lida.</p>
      )}

      {shown && shown.length > 0 && (
        <>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span aria-hidden>↓</span> Mais recentes primeiro
          </p>
          <ul className="space-y-4">
            {shown.map((m) => (
              <li
                key={m.id}
                className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ${m.read ? "ring-slate-200/70" : "ring-2 ring-brand-yellow"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-navy-900">{m.nome ?? "Anônimo"}</span>
                      {!m.read && <span className="rounded-full bg-brand-yellow px-2 py-0.5 text-[10px] font-bold uppercase text-navy-900">Nova</span>}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      <time dateTime={m.createdAt}>{new Date(m.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</time>
                      {" · "}
                      {m.contato ? (
                        m.contato.includes("@") ? (
                          <a href={`mailto:${m.contato}`} className="font-semibold text-navy-700 underline">
                            {m.contato}
                          </a>
                        ) : (
                          <span>{m.contato}</span>
                        )
                      ) : (
                        <span>Sem contato</span>
                      )}
                    </p>
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      disabled={busyId === m.id}
                      onClick={() => void toggleRead(m)}
                      aria-label={`${m.read ? "Marcar como não lida" : "Marcar como lida"}: mensagem de ${m.nome ?? "anônimo"}`}
                      className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-navy-700 hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-navy-900 disabled:opacity-60"
                    >
                      {m.read ? "Marcar como não lida" : "Marcar como lida"}
                    </button>
                  )}
                </div>
                <p className="mt-3 whitespace-pre-line break-words text-sm text-slate-700">{m.mensagem}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
