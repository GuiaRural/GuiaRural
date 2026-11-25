import { defineConfig } from "@playwright/test";

// Mostra cada passo (test.step) no terminal, além do nome do teste.
process.env.PLAYWRIGHT_LIST_PRINT_STEPS ??= "1";

const PORT = Number(process.env.E2E_PORT ?? 3000);
// E2E_SLOWMO=600 deixa cada ação mais lenta, para acompanhar com calma (terminal, --headed ou vídeo).
const slowMo = Number(process.env.E2E_SLOWMO ?? 0);

// Testes de interface (UC35 a UC40). O navegador é o Microsoft Edge (o mesmo da planilha de casos de teste) e o
// backend é simulado dentro do navegador (e2e/support/fakeApi.ts): nada toca o banco de produção.
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  // Um por vez: assim a execução (e o vídeo) acontece na ordem dos casos de teste.
  workers: 1,
  fullyParallel: false,
  timeout: 60_000,
  // Folga para a primeira visita a cada rota no `next dev`, que compila a página na hora.
  expect: { timeout: 20_000 },
  reporter: [["list"], ["html", { outputFolder: "e2e-report", open: "never" }]],
  outputDir: "e2e-results",
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: "msedge",
    viewport: { width: 1366, height: 768 },
    locale: "pt-BR",
    // Evidência: vídeo de todos os testes (e2e-results/<teste>/video.webm) e traço para depurar.
    video: { mode: "on", size: { width: 1366, height: 768 } },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: { slowMo },
  },
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    // Se o `npm run dev` já estiver rodando, usa ele: a API é simulada no navegador de qualquer jeito.
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
