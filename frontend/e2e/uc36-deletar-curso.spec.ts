import { expect, loginPelaTela, test } from "./support/test";

// UC36 — Deletar Curso (planilha: CT-036.01 a CT-036.03).

const DESCARTAVEL = "Curso Descartável para Exclusão";

test.describe("UC36 - Deletar Curso", () => {
  test.beforeEach(async ({ page }) => {
    await loginPelaTela(page);
    await page.goto("/admin/cursos/12");
    await expect(page.getByRole("heading", { name: "Editar curso" })).toBeVisible();
  });

  test("CT-036.01 Excluir um curso com sucesso", async ({ page, api }) => {
    await test.step('Clicar em "Excluir Curso" e confirmar em "Deletar"', async () => {
      await page.getByRole("button", { name: "Excluir Curso" }).click();
      const modal = page.getByRole("dialog");
      await expect(modal).toContainText(DESCARTAVEL);
      await modal.getByRole("button", { name: "Deletar" }).click();
    });

    await test.step("O curso é removido definitivamente e a lista confirma", async () => {
      await expect(page).toHaveURL(/\/admin\/cursos$/);
      await expect(page.getByRole("status")).toContainText("excluído definitivamente");
      await expect(page.getByRole("listitem").filter({ hasText: DESCARTAVEL })).toHaveCount(0);
      expect(api.course(12)).toBeUndefined();
    });

    await test.step("O curso deixou de aparecer na página do departamento", async () => {
      await page.goto("/departamentos/1");
      await expect(page.getByText("2 programas oferecidos")).toBeVisible();
      await expect(page.getByText(DESCARTAVEL)).toHaveCount(0);
    });

    await test.step("O curso deixou de aparecer na busca do mapa", async () => {
      await page.goto("/");
      const busca = page.getByRole("combobox", { name: "Pesquisar no campus" });
      await busca.fill("Descartável");
      await expect(page.getByRole("listbox").getByText("Nenhum resultado encontrado.")).toBeVisible();
    });
  });

  test("CT-036.02 Cancelar a exclusão do curso", async ({ page, api }) => {
    await test.step('Clicar em "Excluir Curso" e, no modal, em "Cancelar"', async () => {
      await page.getByRole("button", { name: "Excluir Curso" }).click();
      const modal = page.getByRole("dialog");
      await expect(modal).toBeVisible();
      await modal.getByRole("button", { name: "Cancelar" }).click();
    });

    await test.step("O modal fecha, a edição continua aberta e nada foi excluído", async () => {
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(page).toHaveURL(/\/admin\/cursos\/12$/);
      await expect(page.getByRole("heading", { name: "Editar curso" })).toBeVisible();
      expect(api.course(12)).toBeDefined();
      expect(api.writes.filter((w) => w.method === "DELETE")).toEqual([]);
    });
  });

  // Na planilha este caso é de teste automatizado de backend + frontend (npm test). Aqui ele também roda pela
  // interface: o DELETE falha (500) e o curso precisa continuar como estava.
  test("CT-036.03 Falha na exclusão do curso", async ({ page, api }) => {
    await page.route("**/api/courses/12", (route) =>
      route.request().method() === "DELETE"
        ? route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ status: 500, detail: "Falha simulada" }) })
        : route.fallback(),
    );

    await test.step("Tentar excluir quando o servidor falha", async () => {
      await page.getByRole("button", { name: "Excluir Curso" }).click();
      await page.getByRole("dialog").getByRole("button", { name: "Deletar" }).click();
    });

    await test.step("A tela avisa que a exclusão não foi concluída e o curso e a matriz continuam", async () => {
      await expect(page.getByRole("dialog").getByRole("alert")).toHaveText(
        "Não foi possível concluir a exclusão. O curso foi mantido sem alterações.",
      );
      await expect(page).toHaveURL(/\/admin\/cursos\/12$/);
      expect(api.course(12)?.subjects).toHaveLength(1);
    });
  });
});
