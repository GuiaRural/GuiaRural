import { expect, test as base, type Page } from "@playwright/test";
import { FakeApi, TEST_PASSWORD } from "./fakeApi";

// `test` com a API simulada já instalada. Cada teste recebe um backend novo e limpo.
export const test = base.extend<{ api: FakeApi }>({
  api: [
    async ({ page }, use) => {
      const api = new FakeApi();
      await api.install(page);
      await use(api);
      // Rota que a tela chamou e nenhum mock cobre: falha o teste em vez de passar por engano.
      expect(api.unhandled, "chamadas à API sem mock").toEqual([]);
    },
    // auto: instala a API simulada mesmo quando o teste (ou o beforeEach) só usa `page`.
    { auto: true },
  ],
});

export { expect };

/** Faz o login de verdade pela tela (UC12), com a conta de teste. */
export async function loginPelaTela(page: Page, email = "coord.ti@ufrpe.br") {
  await page.goto("/admin/login");
  await page.getByLabel("E-mail institucional").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
