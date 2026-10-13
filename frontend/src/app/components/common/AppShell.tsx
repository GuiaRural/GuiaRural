"use client";

import { useState, type ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const SIDEBAR_ID = "sidebar-nav";

export default function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-dvh flex-col">
      <Header menuId={SIDEBAR_ID} menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((v) => !v)} />
      <div className="flex min-h-0 flex-1">
        <Sidebar id={SIDEBAR_ID} open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="relative min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
