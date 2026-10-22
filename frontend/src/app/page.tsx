import AppShell from "./components/common/AppShell";
import MapExplorer from "./components/map/MapExplorer";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

// ?local=<id> abre o cartão de um local; ?rota=<id>&origem=<id|gps:lat,lng> desenha a rota (UC10).
export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const local = first(params.local);
  const rota = first(params.rota);
  const origem = first(params.origem);

  return (
    <AppShell>
      <MapExplorer key={`${local}|${rota}|${origem}`} focusId={local} routeTo={rota} routeFrom={origem} />
    </AppShell>
  );
}
