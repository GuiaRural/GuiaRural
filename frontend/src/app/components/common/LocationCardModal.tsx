'use client';

import Image from 'next/image';
import { X, Clock, Accessibility, ExternalLink } from 'lucide-react';
import { LocationData } from './MapContainerComponent';

interface LocationCardProps {
  location: LocationData;
  onClose: () => void;
}

export default function LocationCardModal({ location, onClose }: LocationCardProps) {
  return (
    <div className="absolute bottom-6 left-6 z-[1000] w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-2xl border border-gray-100 transition-all">
      {/* Header do Card com foto e badges */}
      <div className="relative h-44 w-full overflow-hidden rounded-xl">
        <img
          src={location.image}
          alt={location.name}
          className="h-full w-full object-cover"
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-gray-700 hover:bg-white"
        >
          <X size={16} />
        </button>

        <div className="absolute top-2 left-2 flex gap-1">
          <span className="rounded-md bg-blue-950/80 px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">
            {location.category}
          </span>
        </div>

        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs text-white font-medium">
          <span className="rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-md">
            {location.timeOnFoot} • {location.distance}
          </span>
          <span className={`rounded-full px-2.5 py-1 backdrop-blur-md ${location.isOpen ? 'bg-emerald-500/90' : 'bg-red-500/90'}`}>
            {location.isOpen ? 'Aberto Agora' : 'Fechado'}
          </span>
        </div>
      </div>

      {/* Conteúdo Informativo */}
      <div className="mt-3 space-y-2">
        <h3 className="text-base font-bold text-gray-900 leading-snug">{location.name}</h3>
        <p className="text-xs text-gray-500">{location.campus}</p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">
            <Clock size={14} className="text-amber-600 shrink-0" />
            <div>
              <p className="text-[10px] text-amber-700 font-medium">Horário</p>
              <p className="font-semibold">{location.hours}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 p-2 text-xs text-gray-800">
            <Accessibility size={14} className="text-gray-600 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-500 font-medium">Acessibilidade</p>
              <p className="font-semibold truncate">{location.accessibility.join(' & ')}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-600 line-clamp-2 pt-1">{location.description}</p>

        {/* Botão Principal */}
        <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-2.5 text-xs font-bold text-gray-900 transition hover:bg-amber-500">
          <ExternalLink size={14} />
          Ver Página Completa do Local
        </button>
      </div>
    </div>
  );
}