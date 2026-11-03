'use client';

import './globals.css';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import { LanguageProvider } from './context/LanguageContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full w-full">
      <body className="h-full w-full overflow-hidden bg-slate-100 antialiased">
        <LanguageProvider>
          <div className="flex h-screen w-screen flex-col overflow-hidden">
            {/* Header Superior Fixo */}
            <Header />

            <div className="flex flex-1 overflow-hidden relative">
              {/* Sidebar Fixa no Canto Esquerdo */}
              <Sidebar />

              {/* Conteúdo Dinâmico (Troca entre Mapa e Guia de Recife) */}
              <main className="relative flex-1 h-full w-full overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}