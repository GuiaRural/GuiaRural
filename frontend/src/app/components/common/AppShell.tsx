"use client";

import { useEffect, useState, type ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const SIDEBAR_ID = "sidebar-nav";

export default function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // O site tem rolagem própria (sidebar e main): o documento não deve rolar.
  // O cleanup restaura o valor anterior ao sair do shell.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, []);

  return (
    // fixed inset-0: o shell fica preso à viewport e só sidebar e main rolam.
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      <Header menuId={SIDEBAR_ID} menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((v) => !v)} />
      <div className="flex min-h-0 flex-1">
        <Sidebar id={SIDEBAR_ID} open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="relative min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
