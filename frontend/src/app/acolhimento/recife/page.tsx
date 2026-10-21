import type { Metadata } from "next";
import AppShell from "../../components/common/AppShell";
import RecifeGuideView from "../../components/common/RecifeGuideView";
import type { RecifeGuide } from "../../data/mockGuide";
import { getRecifeGuide } from "../../services/guideService";

export const metadata: Metadata = {
  title: "Guia de Recife & RMR · GuiaRural UFRPE",
};

export default async function RecifeGuidePage() {
  let guide: RecifeGuide | null = null;
  try {
    guide = await getRecifeGuide();
  } catch {
    guide = null;
  }

  return (
    <AppShell>
      <RecifeGuideView guide={guide} />
    </AppShell>
  );
}
