'use client';

import React from 'react';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100">
      <Sidebar />
      <main className="relative flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}