import PlaceCategoryPage from "../components/places/PlaceCategoryPage";

// Portarias do campus; as paradas de ônibus ainda não entram (o projeto não comporta o circular).
export default function GatesAndStopsPage() {
  return <PlaceCategoryPage list="stops" />;
}
