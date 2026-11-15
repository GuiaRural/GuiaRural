import type { Place } from "../../services/placesService";

// Sem foto cadastrada, mostra um bloco com a sigla do local no lugar da fachada.
export default function PlacePhoto({ place, className = "" }: { place: Place; className?: string }) {
  if (place.photoUrl) {
    return (
      <div
        role="img"
        aria-label={`Fachada — ${place.name}`}
        className={`bg-cover bg-center ${className}`}
        style={{ backgroundImage: `url(${place.photoUrl})` }}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={`grid place-items-center bg-gradient-to-br from-navy-700 via-navy-900 to-[#0a1436] ${className}`}
    >
      <span className="text-3xl font-black tracking-wider text-white/25">{place.shortName}</span>
    </div>
  );
}
