"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PlaceForm from "../../../../components/admin/PlaceForm";
import { getPlaceForAdmin, type Place } from "../../../../services/placesService";

// Continuar um rascunho (FA-14.01) ou editar um local já cadastrado.
export default function EditPlacePage() {
  const { id } = useParams<{ id: string }>();
  const [place, setPlace] = useState<Place | null | undefined>(undefined);

  useEffect(() => {
    // Falha ao carregar aparece como "não encontrado": o link para a lista continua valendo.
    getPlaceForAdmin(id)
      .then(setPlace)
      .catch(() => setPlace(null));
  }, [id]);

  if (place === undefined) return <p className="p-6 text-sm text-slate-500">Carregando...</p>;
  if (place === null) {
    return (
      <div className="p-6 text-sm text-slate-700">
        <p>Local não encontrado.</p>
        <Link href="/admin/locais" className="mt-2 inline-block font-semibold text-navy-900 underline">
          Voltar para Locais
        </Link>
      </div>
    );
  }
  return <PlaceForm key={place.id} place={place} />;
}
