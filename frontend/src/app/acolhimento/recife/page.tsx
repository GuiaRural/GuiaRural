import type { Metadata } from "next";
import AppShell from "../../components/common/AppShell";
import RecifeGuideView from "../../components/common/RecifeGuideView";

export const metadata: Metadata = {
  title: "Guia de Recife & RMR · GuiaRural UFRPE",
};

// O conteúdo vem da API no idioma escolhido pelo usuário, que só o navegador conhece: a busca acontece no cliente.
export default function RecifeGuidePage() {
  return (
    <AppShell>
      <RecifeGuideView />
    </AppShell>
  );
}
