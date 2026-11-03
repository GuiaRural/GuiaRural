import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppShell from "../../components/common/AppShell";
import PlaceDetailView from "../../components/common/PlaceDetailView";
import type { Place } from "../../data/mockPlaces";
import { getPlaceById } from "../../services/placesService";

export async function generateMetadata(props: PageProps<"/locais/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const place = await getPlaceById(id).catch(() => null);
  return { title: `${place?.name ?? "Local"} · GuiaRural UFRPE` };
}

export default async function PlacePage(props: PageProps<"/locais/[id]">) {
  const { id } = await props.params;

  // undefined = falha ao carregar (mostra erro com "tentar novamente"); null = id inexistente (404).
  let place: Place | null | undefined;
  try {
    place = await getPlaceById(id);
  } catch {
    place = undefined;
  }
  if (place === null) notFound();

  return (
    <AppShell>
      <PlaceDetailView place={place ?? null} />
    </AppShell>
  );
}
