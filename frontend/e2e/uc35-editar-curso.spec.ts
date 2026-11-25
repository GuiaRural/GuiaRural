import { expect, loginPelaTela, test } from "./support/test";

// UC35 — Editar Curso (planilha: CT-035.01 a CT-035.05).
// Observação: a planilha cita um botão "Modo de Edição", que não existe mais: o formulário abre direto editável
// a partir de "Editar" na lista de cursos do painel. O CT-035.01 foi automatizado com o comportamento atual.

const CURSO = "Bacharelado em Computação Fictícia";

test.describe("UC35 - Editar Curso", () => {
  test.beforeEach(async ({ page }) => {
    await loginPelaTela(page);
    await page.goto("/admin/cursos");
  });

  async function abrirEdicao(page: import("@playwright/test").Page) {
    await page.getByRole("link", { name: `Editar curso: ${CURSO}` }).click();
    await expect(page.getByRole("heading", { name: "Editar curso" })).toBeVisible();
  }

  test("CT-035.01 Acessar a edição do curso", async ({ page }) => {
    await test.step("Na lista de cursos, clicar em Editar no curso desejado", () => abrirEdicao(page));

    await test.step("Os campos de Dados gerais, Coordenação e Matriz curricular estão editáveis", async () => {
      await expect(page.getByRole("heading", { name: "Dados gerais" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Coordenação" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Matriz curricular" })).toBeVisible();
      await expect(page.getByLabel("Nome do curso")).toBeEditable();
      await expect(page.getByLabel("Coordenador(a)", { exact: true })).toBeEditable();
      await expect(page.getByRole("button", { name: "Adicionar nova disciplina" })).toBeEnabled();
      await expect(page.getByRole("button", { name: "Salvar Alterações" })).toBeVisible();
    });
  });

  test("CT-035.02 Editar Dados gerais e salvar", async ({ page, api }) => {
    await abrirEdicao(page);

    await test.step('Alterar nome e turno e clicar em "Salvar Alterações"', async () => {
      await page.getByLabel("Nome do curso").fill("Bacharelado em Computação Fictícia (editado)");
      await page.getByLabel("Turno").fill("Noturno");
      await page.getByRole("button", { name: "Salvar Alterações" }).click();
    });

    await test.step("A lista confirma que o curso foi atualizado", async () => {
      await expect(page).toHaveURL(/\/admin\/cursos$/);
      await expect(page.getByRole("status")).toContainText("atualizado");
      expect(api.course(10)?.name).toBe("Bacharelado em Computação Fictícia (editado)");
    });

    await test.step("A mudança aparece na página pública do departamento", async () => {
      await page.goto("/departamentos/1");
      const card = page.getByRole("article").filter({ hasText: "Bacharelado em Computação Fictícia (editado)" });
      await expect(card).toBeVisible();
      await expect(card).toContainText("Noturno");
    });

    await test.step("A mudança aparece na página pública do curso", async () => {
      await page.goto("/cursos/10");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bacharelado em Computação Fictícia (editado)");
    });
  });

  test("CT-035.03 Adicionar nova disciplina na matriz curricular", async ({ page }) => {
    await abrirEdicao(page);
    const painel = page.getByRole("tabpanel");

    await test.step('Selecionar o 3º período e clicar em "Adicionar nova disciplina"', async () => {
      await page.getByRole("tab", { name: /3º Período/ }).click();
      await expect(painel.getByText("Nenhuma disciplina neste período.")).toBeVisible();
      await page.getByRole("button", { name: "Adicionar nova disciplina" }).click();
    });

    await test.step("Preencher código, disciplina, carga horária, natureza e pré-requisitos", async () => {
      await painel.getByRole("textbox", { name: /^Código/ }).fill("TST301");
      await painel.getByRole("textbox", { name: /^Disciplina/ }).fill("Banco de Dados de Teste");
      await painel.getByRole("textbox", { name: /^Carga horária/ }).fill("75");
      await painel.getByLabel("Natureza").selectOption("OPTATIVA");
      await painel.getByRole("textbox", { name: /^Pré-requisitos/ }).fill("TST101, TST201");
    });

    await test.step('Clicar em "Salvar Alterações"', async () => {
      await page.getByRole("button", { name: "Salvar Alterações" }).click();
      await expect(page).toHaveURL(/\/admin\/cursos$/);
    });

    await test.step("A disciplina está na grade pública do curso", async () => {
      await page.goto("/cursos/10");
      await page.getByRole("button", { name: "Período 3" }).click();
      const linha = page.getByRole("row", { name: /TST301/ });
      await expect(linha).toContainText("Banco de Dados de Teste");
      await expect(linha).toContainText("75h");
      await expect(linha).toContainText("Optativa");
      await expect(linha).toContainText("TST101, TST201");
    });
  });

  test("CT-035.04 Cancelar a edição sem salvar", async ({ page, api }) => {
    await abrirEdicao(page);

    await test.step("Alterar um campo qualquer do curso", async () => {
      await page.getByLabel("Nome do curso").fill("Nome que não deve ser salvo");
    });

    await test.step('Clicar em "Cancelar"', async () => {
      await page.getByRole("link", { name: "Cancelar" }).click();
    });

    await test.step("Volta para a lista e nada foi salvo", async () => {
      await expect(page).toHaveURL(/\/admin\/cursos$/);
      await expect(page.getByText(CURSO, { exact: true })).toBeVisible();
      await expect(page.getByText("Nome que não deve ser salvo")).toHaveCount(0);
      expect(api.writes.filter((w) => w.method === "PUT")).toEqual([]);
      expect(api.course(10)?.name).toBe(CURSO);
    });
  });

  test("CT-035.05 Salvar com campo obrigatório vazio", async ({ page, api }) => {
    await abrirEdicao(page);

    await test.step("Apagar o nome do curso (campo obrigatório)", async () => {
      await page.getByLabel("Nome do curso").fill("");
    });

    await test.step('Clicar em "Salvar Alterações"', async () => {
      await page.getByRole("button", { name: "Salvar Alterações" }).click();
    });

    await test.step("Aparece o erro do campo e nada é salvo", async () => {
      await expect(page.getByText("O nome do curso é obrigatório.")).toBeVisible();
      await expect(page.getByRole("alert").filter({ hasText: "Confira os campos destacados." })).toBeVisible();
      await expect(page).toHaveURL(/\/admin\/cursos\/10$/);
      expect(api.writes.filter((w) => w.method === "PUT")).toEqual([]);
      expect(api.course(10)?.name).toBe(CURSO);
    });
  });
});
