'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass, MapPin, Utensils, BookOpen, Bell, 
  GraduationCap, Wrench, Calendar, HeartHandshake, 
  FileText, HelpCircle, Map, Headset, Accessibility, UserCheck 
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0B1A30] text-white h-screen flex flex-col justify-between p-4 overflow-y-auto text-xs shrink-0 z-20">
      <div>
        {/* Logo / Header da Sidebar */}
        <div className="mb-6 flex items-center justify-between border-b border-slate-700/50 pb-3">
          <div>
            <h1 className="font-bold text-sm tracking-wide text-white">GuiaRural</h1>
            <p className="text-[10px] text-slate-400">UFRPE</p>
          </div>
          <span className="bg-blue-900/60 text-blue-300 text-[10px] px-2 py-0.5 rounded border border-blue-700/50">
            GPS
          </span>
        </div>

        {/* Seção: NAVEGAÇÃO DO CAMPUS */}
        <div className="mb-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Navegação do Campus
          </p>
          <div className="bg-slate-800/60 p-2 rounded-lg mb-2 text-slate-300 font-medium">
            Dois Irmãos - Sede
          </div>

          <nav className="space-y-1">
            <Link 
              href="/" 
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg font-semibold transition ${
                pathname === '/' 
                  ? 'bg-blue-600/30 text-blue-400' 
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <Compass size={14} /> Mapa Interativo
            </Link>
            <a href="#" className="flex items-center gap-2 text-slate-300 hover:bg-slate-800/50 px-2.5 py-2 rounded-lg">
              <MapPin size={14} /> Portarias e paradas
            </a>
            <a href="#" className="flex items-center gap-2 text-slate-300 hover:bg-slate-800/50 px-2.5 py-2 rounded-lg">
              <Utensils size={14} /> Onde comer
            </a>
            <a href="#" className="flex items-center gap-2 text-slate-300 hover:bg-slate-800/50 px-2.5 py-2 rounded-lg">
              <BookOpen size={14} /> Espaços de estudo
            </a>
            <a href="#" className="flex items-center justify-between text-slate-300 hover:bg-slate-800/50 px-2.5 py-2 rounded-lg">
              <span className="flex items-center gap-2"><Bell size={14} /> Avisos do campus</span>
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">3</span>
            </a>
            <a href="#" className="flex items-center gap-2 text-slate-300 hover:bg-slate-800/50 px-2.5 py-2 rounded-lg">
              <GraduationCap size={14} /> Cursos e departamentos
            </a>
            <a href="#" className="flex items-center gap-2 text-slate-300 hover:bg-slate-800/50 px-2.5 py-2 rounded-lg">
              <Wrench size={14} /> Serviços
            </a>
            <a href="#" className="flex items-center gap-2 text-slate-300 hover:bg-slate-800/50 px-2.5 py-2 rounded-lg">
              <Calendar size={14} /> Cardápio da semana
            </a>
          </nav>
        </div>

{/* Seção: ACOLHIMENTO */}
        <div className="mb-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Acolhimento
          </p>
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-2 text-slate-300 hover:bg-slate-800/50 px-2.5 py-2 rounded-lg">
              <HeartHandshake size={14} /> Interação cultural
            </a>
            <a href="#" className="flex items-center gap-2 text-slate-300 hover:bg-slate-800/50 px-2.5 py-2 rounded-lg">
              <FileText size={14} /> Documentos e editais
            </a>
            <a href="#" className="flex items-center gap-2 text-slate-300 hover:bg-slate-800/50 px-2.5 py-2 rounded-lg">
              <HelpCircle size={14} /> Guia do calouro
            </a>
            <Link 
              href="/guia-de-recife" 
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg font-semibold transition ${
                pathname === '/guia-de-recife' 
                  ? 'bg-blue-600/30 text-blue-400' 
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <span>Guia de Recife</span>
            </Link>
          </nav>
        </div>
        {/* Seção: GESTÃO E APOIO */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Gestão e Apoio
          </p>
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-2 text-slate-300 hover:bg-slate-800/50 px-2.5 py-2 rounded-lg">
              <Headset size={14} /> Falar com a equipe
            </a>
            <a href="#" className="flex items-center gap-2 text-slate-300 hover:bg-slate-800/50 px-2.5 py-2 rounded-lg">
              <Accessibility size={14} /> Acessibilidade
            </a>
            <a href="#" className="flex items-center gap-2 text-slate-300 hover:bg-slate-800/50 px-2.5 py-2 rounded-lg">
              <UserCheck size={14} /> Área do administrador
            </a>
          </nav>
        </div>
      </div>
    </aside>
  );
}