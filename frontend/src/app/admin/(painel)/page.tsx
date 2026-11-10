"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/AdminShell";
import PageHeader from "../../components/admin/PageHeader";
import type { AuditLog } from "../../data/mockAuditLogs";
import { listLogs } from "../../services/auditService";
import { listAllPlaces } from "../../services/placesService";
import { listMenus } from "../../services/menuService";

const SHORTCUTS = [
  { href: "/admin/locais", title: "Locais e prédios", text: "Cadastrar e publicar locais no mapa." },
  { href: "/admin/cardapio", title: "Cardápio da semana / RU", text: "Criar e duplicar cardápios do RU." },
  { href: "/admin/avisos", title: "Avisos do campus", text: "Publicar, editar e remover avisos." },
  { href: "/admin/servicos", title: "Serviços", text: "Cadastrar serviços estudantis, passo a passo e editais." },
  { href: "/admin/acolhimento/cultura", title: "Acolhimento", text: "Editar cartilhas e traduções PT / EN / ES." },
  { href: "/admin/administradores", title: "Administradores", text: "Quem tem acesso ao painel." },
  { href: "/admin/historico", title: "Logs de mudanças / Histórico", text: "Auditar e desfazer alterações." },
];

export default function AdminDashboard() {
  const { session } = useAdmin();
  const [stats, setStats] = useState<{ places: number | null; drafts: number | null; menus: number | null; logs: AuditLog[] } | null>(null);

  useEffect(() => {
    // Locais e cardápios vêm da API: se ela falhar, o número fica em "—" sem derrubar o resto do painel.
    Promise.all([listAllPlaces().catch(() => null), listMenus().catch(() => null), listLogs()]).then(([places, menus, logs]) =>
      setStats({
        places: places ? places.filter((p) => p.status === "publicado").length : null,
        drafts: places ? places.filter((p) => p.status === "rascunho").length : null,
        menus: menus ? menus.length : null,
        logs: logs.slice(0, 4),
      }),
    );
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <PageHeader title={`Olá, ${session.name}`} subtitle="Painel administrativo do GuiaRural." />

      <dl className="grid gap-3 sm:grid-cols-3">
        {[
          ["Locais publicados", stats?.places],
          ["Rascunhos", stats?.drafts],
          ["Cardápios cadastrados", stats?.menus],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-xl border border-slate-200 bg-white p-4">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="mt-1 text-2xl font-bold text-navy-900">{value ?? "—"}</dd>
          </div>
        ))}
      </dl>

      <ul className="grid gap-3 sm:grid-cols-2">
        {SHORTCUTS.map((s) => (
          <li key={s.href}>
            <Link href={s.href} className="block h-full rounded-xl border border-slate-200 bg-white p-5 hover:border-amber-300 hover:shadow">
              <span className="font-bold text-navy-900">{s.title}</span>
              <span className="mt-1 block text-sm text-slate-600">{s.text}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-navy-900">Últimas mudanças</h2>
          <Link href="/admin/historico" className="text-sm font-semibold text-navy-700 hover:underline">
            Ver histórico
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {stats?.logs.map((l) => (
            <li key={l.id} className="flex flex-wrap justify-between gap-2 py-2">
              <span>
                <strong>{l.entityName}</strong> — {l.action}
              </span>
              <span className="text-xs text-slate-500">
                {l.author} · {new Date(l.at).toLocaleString("pt-BR")}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
