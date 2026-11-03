import { MOCK_RECIFE_GUIDE, type RecifeGuide } from "../data/mockGuide";

// Ponto único de acesso ao Guia de Recife: hoje usa mock, depois trocar por fetch("/api/...")
// sem alterar os componentes. Deve rejeitar a promessa em caso de falha (FE-40.01).
export async function getRecifeGuide(): Promise<RecifeGuide> {
  return MOCK_RECIFE_GUIDE;
}
