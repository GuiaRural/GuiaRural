import { expect, test } from "./support/test";

// UC40 — Consultar Guia de Recife (planilha: CT-040.01 a CT-040.04). Só leitura, sem login.

const PARQUE = "Parque Fictício do Recife";
const MUSEU = "Museu Fictício da Cidade";
const MERCADO = "Mercado Fictício";

test.describe("UC40 - Consultar Guia de Recife", () => {
  test("CT-040.01 Acessar o Guia de Recife a partir do mapa", async ({ page }) => {
    await test.step("Acessar o Mapa Interativo", async () => {
      await page.goto("/");
      await expect(page.getByRole("combobox", { name: "Pesquisar no campus" })).toBeVisible();
    });

    await test.step('Abrir o menu lateral e selecionar "Guia de Recife"', async () => {
      await page.getByRole("navigation", { name: "Navegação do campus" }).getByRole("link", { name: "Guia de Recife" }).click();
      await expect(page).toHaveURL(/\/acolhimento\/recife$/);
    });

    await test.step("A tela abre exibindo as categorias e os locais do guia", async () => {
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Guia de Recife");
      const filtro = page.getByRole("group", { name: "Filtrar por categoria" });
      for (const categoria of ["Todas", "Lazer & Natureza", "Cultura & História", "Gastronomia"]) {
        await expect(filtro.getByRole("button", { name: categoria })).toBeVisible();
      }
      await expect(page.getByRole("article")).toHaveCount(3);
    });
  });

  test("CT-040.02 Filtrar os locais por categoria", async ({ page }) => {
    await page.goto("/acolhimento/recife");
    await expect(page.getByRole("article")).toHaveCount(3);
    const filtro = page.getByRole("group", { name: "Filtrar por categoria" });

    await test.step('Selecionar a categoria "Lazer & Natureza"', async () => {
      await filtro.getByRole("button", { name: "Lazer & Natureza" }).click();
      await expect(filtro.getByRole("button", { name: "Lazer & Natureza" })).toHaveAttribute("aria-pressed", "true");
    });

    await test.step("A lista mostra só os locais dessa categoria", async () => {
      await expect(page.getByRole("article")).toHaveCount(1);
      await expect(page.getByRole("heading", { name: PARQUE })).toBeVisible();
      await expect(page.getByRole("heading", { name: MUSEU })).toHaveCount(0);
      await expect(page.getByRole("heading", { name: MERCADO })).toHaveCount(0);
    });

    await test.step('Selecionar "Todas": todos os locais voltam', async () => {
      await filtro.getByRole("button", { name: "Todas" }).click();
      await expect(page.getByRole("article")).toHaveCount(3);
    });
  });

  test("CT-040.03 Visualizar os detalhes de um local do guia", async ({ page }) => {
    await page.goto("/acolhimento/recife");

    await test.step("Escolher um local na lista e consultar o cartão", async () => {
      const cartao = page.getByRole("article").filter({ has: page.getByRole("heading", { name: MUSEU }) });
      await expect(cartao).toBeVisible();
      await expect(cartao).toContainText("Museu fictício com exposições de teste."); // descrição
      await expect(cartao).toContainText("Av. dos Testes, 200"); // endereço
      await expect(cartao).toContainText("Horário de funcionamento"); // horário, nos locais que o possuem
      await expect(cartao).toContainText("09:00 – 17:00");
    });
  });

  test("CT-040.04 Falha ao carregar o conteúdo do guia", async ({ page, api }) => {
    await test.step("Desconectar a internet e acessar o Guia de Recife", async () => {
      api.setOffline("/guide/recife", true);
      await page.goto("/acolhimento/recife");
    });

    await test.step("Aparece o aviso de falha com o botão \"Tentar novamente\"", async () => {
      const aviso = page.getByRole("alert").filter({ hasText: "Não foi possível carregar o guia" });
      await expect(aviso).toContainText("Não foi possível carregar o guia");
      await expect(aviso).toContainText("Verifique sua conexão e tente novamente");
      await expect(aviso.getByRole("button", { name: "Tentar novamente" })).toBeVisible();
    });

    await test.step('Reconectar e clicar em "Tentar novamente": o guia é carregado', async () => {
      api.setOffline("/guide/recife", false);
      await page.getByRole("button", { name: "Tentar novamente" }).click();
      await expect(page.getByRole("article")).toHaveCount(3);
      await expect(page.getByRole("alert").filter({ hasText: "carregar o guia" })).toHaveCount(0);
    });
  });
});
