"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { PERMISSIONS } from "../../data/mockAdmins";
import { setFlash } from "../../lib/flash";
import { getSession, logout, subscribeSession, verifySession, type Session } from "../../services/authService";
import LogoutModal, { LogoutIcon } from "./LogoutModal";

type NavItem = { href: string; label: string };

// Grupos espelham a sidebar pública: cada área editável aparece onde o usuário a vê no site.
const NAV: { title?: string; items: NavItem[] }[] = [
  { items: [{ href: "/admin", label: "Painel" }] },
  {
    title: "Conteúdo do campus",
    items: [
      { href: "/admin/locais", label: "Locais e prédios" },
      { href: "/admin/avisos", label: "Avisos do campus" },
      { href: "/admin/servicos", label: "Serviços" },
      { href: "/admin/cardapio", label: "Cardápio do RU" },
    ],
  },
  {
    title: "Acolhimento",
    items: [
      { href: "/admin/acolhimento/cultura", label: "Interação cultural" },
      { href: "/admin/acolhimento/documentos", label: "Documentos e editais" },
      { href: "/admin/acolhimento/calouro", label: "Guia do calouro" },
    ],
  },
  {
    title: "Gestão",
    items: [
      { href: "/admin/administradores", label: "Administradores" },
      { href: "/admin/historico", label: "Histórico de mudanças" },
    ],
  },
];

type AdminContextValue = { session: Session; setDirty: (dirty: boolean) => void };
const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin deve ser usado dentro de AdminShell");
  return ctx;
}

// undefined no servidor (sessão desconhecida); null no cliente sem sessão.
const getServerSession = () => undefined;

export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSyncExternalStore(subscribeSession, getSession, getServerSession);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  // Alterações não salvas valem só para a tela em que foram feitas (FE01 do UC24).
  const [dirtyPath, setDirtyPath] = useState<string | null>(null);
  const dirty = dirtyPath === pathname;

  // A cópia local da sessão pode ter sobrevivido ao cookie (expirou, ou o servidor reiniciou): confirma com o servidor.
  useEffect(() => {
    void verifySession();
  }, []);

  // RN-02 do UC24: sem sessão, voltar pelo navegador não reabre o painel.
  useEffect(() => {
    if (session === null) router.replace("/admin/login");
  }, [session, router]);

  // FE01 do UC24 também ao fechar ou recarregar a aba com o formulário alterado.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!session) return null;

  function openLogout() {
    setMenuOpen(false);
    setConfirmLogout(true);
  }

  async function doLogout() {
    setLoggingOut(true);
    const { offline } = await logout();
    setDirtyPath(null);
    setFlash(
      offline
        ? "Sem conexão com o servidor: sua sessão foi encerrada neste dispositivo."
        : "Sessão encerrada com segurança. Até logo!",
    );
    // replace: o painel não fica no histórico (RN-02).
    router.replace("/admin/login");
  }

  return (
    <AdminContext.Provider value={{ session, setDirty: (d) => setDirtyPath(d ? pathname : null) }}>
      <div className="flex h-dvh flex-col">
        <header className="relative z-50 flex h-14 shrink-0 items-center gap-3 bg-navy-900 px-4 text-white">
          <button
            type="button"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            aria-controls="admin-nav"
            onClick={() => setMenuOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-md hover:bg-white/10 md:hidden"
          >
            <svg aria-hidden className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="leading-tight">
            <p className="text-base font-semibold">GuiaRural</p>
            <p className="text-[10px] tracking-wide text-slate-300">UFRPE</p>
          </div>
          <span className="rounded-full bg-brand-yellow px-2 py-0.5 text-[10px] font-bold uppercase text-navy-900">Admin</span>
          <div className="ml-auto hidden text-right text-xs leading-tight sm:block">
            <p className="font-semibold">{session.name}</p>
            <p className="text-slate-300">{PERMISSIONS[session.permission]}</p>
          </div>
          <button
            type="button"
            onClick={openLogout}
            className="ml-auto inline-flex h-9 items-center gap-2 rounded-lg border border-white/20 px-3 text-xs font-semibold hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-brand-yellow sm:ml-2"
          >
            <LogoutIcon className="size-4" />
            <span>Sair</span>
          </button>
        </header>

        <div className="flex min-h-0 flex-1">
          {menuOpen && (
            <button type="button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-30 bg-black/50 md:hidden" />
          )}
          <aside
            id="admin-nav"
            className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto bg-navy-900 px-3 pb-4 pt-16 text-white transition-transform md:static md:z-auto md:translate-x-0 md:pt-4 ${
              menuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="mb-4 rounded-lg bg-white/5 p-3 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sessão ativa</p>
              <p className="mt-1 font-semibold">{session.sector}</p>
              <p className="flex items-center gap-1 text-emerald-400">
                <span aria-hidden className="size-1.5 rounded-full bg-emerald-400" /> {session.email}
              </p>
            </div>
            <nav aria-label="Área do administrador" className="space-y-4">
              {NAV.map((group, i) => (
                <div key={group.title ?? i}>
                  {group.title && <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group.title}</p>}
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            aria-current={active ? "page" : undefined}
                            className={`block rounded-lg px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-brand-yellow ${
                              active ? "bg-navy-700 font-semibold shadow-[inset_3px_0_0] shadow-brand-yellow" : "hover:bg-white/10"
                            }`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
            <div className="mt-auto space-y-1 border-t border-white/10 pt-3">
              <Link href="/" className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10">
                Ver site público ↗
              </Link>
              <button
                type="button"
                onClick={openLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-300 hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-brand-yellow"
              >
                <LogoutIcon className="size-4" />
                Sair / Logout
              </button>
            </div>
          </aside>
          <main className="min-w-0 flex-1 overflow-y-auto bg-slate-50">{children}</main>
        </div>
      </div>

      {/* UC24 — Logout */}
      <LogoutModal
        open={confirmLogout}
        session={session}
        dirty={dirty}
        busy={loggingOut}
        onCancel={() => setConfirmLogout(false)}
        onConfirm={doLogout}
      />
    </AdminContext.Provider>
  );
}
