import { expect, test } from "./support/test";

// UC38 — Sugestões de Busca ao Pesquisar (planilha: CT-038.01 a CT-038.05). Só leitura, sem login.

test.describe("UC38 - Sugestões de Busca", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("combobox", { name: "Pesquisar no campus" })).toBeVisible();
  });

  const busca = (page: import("@playwright/test").Page) => page.getByRole("combobox", { name: "Pesquisar no campus" });

  test("CT-038.01 Exibir sugestões ao digitar um termo", async ({ page }) => {
    await test.step('Clicar no campo de busca e digitar "Departamento de"', async () => {
      await busca(page).click();
      await busca(page).pressSequentially("Departamento de", { delay: 40 });
    });

    await test.step("A lista suspensa mostra os resultados correspondentes", async () => {
      const lista = page.getByRole("listbox");
      await expect(lista).toBeVisible();
      const opcao = lista.getByRole("option", { name: /Departamento de Computação/ });
      await expect(opcao).toBeVisible();
      await expect(opcao).toContainText("Departamento"); // tipo da sugestão
    });
  });

  test("CT-038.02 Selecionar uma sugestão e abrir a página completa do local", async ({ page }) => {
    await test.step("Digitar um termo de busca", async () => {
      await busca(page).pressSequentially("Biblioteca", { delay: 40 });
      await expect(page.getByRole("option", { name: /Biblioteca Central/ })).toBeVisible();
    });

    await test.step("Selecionar a sugestão: o local é destacado e o cartão aparece", async () => {
      await page.getByRole("option", { name: /Biblioteca Central/ }).click();
      await expect(page).toHaveURL(/[?&]local=biblioteca/);
      await expect(page.getByRole("heading", { level: 2, name: "Biblioteca Central" })).toBeVisible();
    });

    await test.step('Clicar em "Ver página completa do local"', async () => {
      await page.getByRole("link", { name: /Ver página completa do local/ }).click();
      await expect(page).toHaveURL(/\/locais\/biblioteca$/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Biblioteca Central");
    });
  });

  test("CT-038.03 Atalho de teclado (Ctrl/⌘ + K) foca o campo de busca", async ({ page }) => {
    await test.step("Com o foco fora do campo, acionar Ctrl+K", async () => {
      await expect(busca(page)).not.toBeFocused();
      await page.keyboard.press("Control+K");
      await expect(busca(page)).toBeFocused();
    });

    await test.step("Acionar ⌘K (Meta+K), usado no Mac", async () => {
      await busca(page).blur();
      await expect(busca(page)).not.toBeFocused();
      await page.keyboard.press("Meta+K");
      await expect(busca(page)).toBeFocused();
    });

    await test.step("O campo está pronto para receber o termo digitado", async () => {
      await page.keyboard.type("Reitoria");
      await expect(busca(page)).toHaveValue("Reitoria");
    });
  });

  test("CT-038.04 Botão amarelo 'Traçar rota' abre o traçado de rota", async ({ page, context }) => {
    await test.step('Clicar no botão amarelo "Traçar rota" ao lado do campo de busca', async () => {
      await page.getByRole("button", { name: "Traçar rota" }).click();
      const modal = page.getByRole("dialog", { name: "Traçar rota" });
      await expect(modal).toBeVisible();
      // O modal abre sem exibir sugestões de busca.
      await expect(page.getByRole("listbox")).toHaveCount(0);
    });

    const modal = page.getByRole("dialog", { name: "Traçar rota" });

    await test.step('Escolher o destino "Biblioteca Central"', async () => {
      await modal.getByLabel("Destino").selectOption({ label: "Biblioteca Central" });
    });

    await test.step('Em "Saindo de", escolher "Escolher um prédio ou portaria" e o ponto de partida', async () => {
      await modal.getByRole("radio", { name: "Escolher um prédio ou portaria" }).check();
      await modal.getByLabel("Escolha o ponto de partida").selectOption({ label: "Prédio Central (Reitoria)" });
    });

    await test.step('Clicar em "Traçar rota": o painel "Rota até" mostra o trajeto', async () => {
      await modal.getByRole("button", { name: "Traçar rota" }).click();
      await expect(page).toHaveURL(/[?&]rota=biblioteca&origem=reitoria/);
      const painel = page.locator("section[aria-live=polite]");
      await expect(painel).toContainText("Rota até");
      await expect(painel.getByRole("heading", { name: "Biblioteca Central" })).toBeVisible();
      await expect(painel).toContainText("Saindo de: Prédio Central (Reitoria)");
      await expect(painel).toContainText("Distância");
      await expect(painel).toContainText("Tempo a pé");
      await expect(painel.getByRole("link", { name: "Encerrar rota" })).toBeVisible();
    });

    await test.step('Com "Minha localização (GPS)" e o usuário dentro do campus, a partida é "Sua localização"', async () => {
      await context.grantPermissions(["geolocation"]);
      await context.setGeolocation({ latitude: -8.0165, longitude: -34.9478 });
      await page.goto("/");
      await page.getByRole("button", { name: "Traçar rota" }).click();
      const gps = page.getByRole("dialog", { name: "Traçar rota" });
      await gps.getByLabel("Destino").selectOption({ label: "Biblioteca Central" });
      await expect(gps.getByRole("radio", { name: "Minha localização (GPS)" })).toBeChecked();
      await gps.getByRole("button", { name: "Traçar rota" }).click();
      const painel = page.locator("section[aria-live=polite]");
      await expect(painel).toContainText("Saindo de: Sua localização");
    });
  });

  test("CT-038.05 Nenhum resultado encontrado", async ({ page }) => {
    await test.step("Digitar um termo que não corresponde a local, departamento ou curso", async () => {
      await busca(page).pressSequentially("zzzxqwk", { delay: 40 });
    });

    await test.step('Aparece "Nenhum resultado encontrado" no lugar da lista', async () => {
      const lista = page.getByRole("listbox");
      await expect(lista).toContainText("Nenhum resultado encontrado.");
      await expect(lista.getByRole("option")).toHaveCount(0);
    });
  });
});
