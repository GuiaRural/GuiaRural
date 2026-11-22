import { expect, test } from "./support/test";

// UC37 — Visualizar Cursos num Departamento (planilha: CT-037.01 a CT-037.04). Só leitura, sem login.

const CURSO = "Bacharelado em Computação Fictícia";

test.describe("UC37 - Visualizar Cursos Depto", () => {
  test("CT-037.01 Visualizar os cursos vinculados a um departamento", async ({ page }) => {
    await test.step('Caminho (a): clicar no pin do local no mapa e, em "Cursos e departamentos", no departamento', async () => {
      await page.goto("/");
      await page.locator('.leaflet-marker-icon[title="DC"]').click();
      const nav = page.getByRole("navigation", { name: "Cursos e departamentos" });
      await expect(nav).toBeVisible();
      await nav.getByRole("link", { name: "Departamento de Computação" }).click();
      await expect(page).toHaveURL(/\/departamentos\/1$/);
    });

    await test.step('Caminho (b): menu lateral "Cursos e departamentos" e escolher o departamento', async () => {
      await page.goto("/");
      await page.getByRole("navigation", { name: "Navegação do campus" }).getByRole("link", { name: "Cursos e departamentos" }).click();
      await expect(page).toHaveURL(/\/cursos$/);
      await page.getByRole("link", { name: /Departamento de Computação/ }).first().click();
      await expect(page).toHaveURL(/\/departamentos\/1$/);
    });

    await test.step('Consultar a seção "Cursos vinculados"', async () => {
      await expect(page.getByRole("heading", { name: "Cursos vinculados" })).toBeVisible();
      await expect(page.getByText("3 programas oferecidos")).toBeVisible();
      const card = page.getByRole("article").filter({ hasText: CURSO });
      await expect(card).toContainText("Bacharelado"); // nível/tipo
      await expect(card).toContainText("MEC 5"); // conceito/avaliação
      await expect(card).toContainText("Presencial"); // modalidade
      await expect(card).toContainText("Integral"); // turno
      await expect(card).toContainText("Duração: 8 semestres"); // duração
      await expect(page.getByRole("article")).toHaveCount(3);
    });
  });

  test("CT-037.02 Visualizar a matriz curricular de um curso", async ({ page }) => {
    await page.goto("/departamentos/1");

    await test.step('Clicar em "Ver grade" em um dos cursos', async () => {
      await page.getByRole("article").filter({ hasText: CURSO }).getByRole("link", { name: /Ver grade/ }).click();
      await expect(page).toHaveURL(/\/cursos\/10$/);
    });

    await test.step("A matriz curricular do curso selecionado é exibida", async () => {
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(CURSO);
      await expect(page.getByRole("heading", { name: "Matriz curricular e cadeiras" })).toBeVisible();
      const linha = page.getByRole("row", { name: /TST101/ });
      await expect(linha).toContainText("Algoritmos de Teste");
      await expect(linha).toContainText("60h");
      await page.getByRole("button", { name: "Período 2" }).click();
      await expect(page.getByRole("row", { name: /TST201/ })).toContainText("TST101"); // pré-requisito
    });
  });

  test("CT-037.03 Consultar as Coordenações de Curso do departamento", async ({ page }) => {
    await page.goto("/departamentos/1");

    await test.step('Consultar o painel "Coordenações de curso"', async () => {
      const painel = page.getByRole("complementary").filter({ has: page.getByRole("heading", { name: "Coordenações de curso" }) });
      await expect(painel).toBeVisible();
      const um = painel.getByRole("listitem").filter({ hasText: CURSO });
      await expect(um).toContainText("Coordenador Teste Um"); // nome
      await expect(um).toContainText("Ramal: 4101"); // ramal
      await expect(um).toContainText("coord.um@example.com"); // e-mail
      await expect(painel.getByRole("listitem")).toHaveCount(3);
    });
  });

  // A planilha espera a mensagem "Nenhum curso vinculado a este departamento", mas a tela atual simplesmente não
  // exibe a seção (FE-37.01 no código: "sem cursos vinculados, a seção não é exibida"). O teste confere o que o
  // sistema faz hoje e marca como falha esperada a mensagem da planilha: quando ela for implementada, este teste
  // passa a falhar de propósito, lembrando de tirar o test.fail().
  test("CT-037.04 Departamento sem cursos vinculados", async ({ page }) => {
    test.fail(true, "Divergência: a mensagem 'Nenhum curso vinculado a este departamento' ainda não existe na tela (FE-37.01).");

    await page.goto("/departamentos/2");

    await test.step("A página do departamento abre, mas sem listagem de cursos", async () => {
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Departamento sem Cursos");
      await expect(page.getByRole("heading", { name: "Cursos vinculados" })).toHaveCount(0);
      await expect(page.getByRole("article")).toHaveCount(0);
    });

    await test.step('Exibe a mensagem "Nenhum curso vinculado a este departamento"', async () => {
      await expect(page.getByText("Nenhum curso vinculado a este departamento")).toBeVisible({ timeout: 3000 });
    });
  });
});
