import { expect, loginPelaTela, test } from "./support/test";
import type { Page } from "@playwright/test";

// UC39 — Mandar Mensagem para a Equipe (planilha: CT-039.01 a CT-039.12).
// Visitante: /fale-com-a-equipe (sem login). Administrador: /admin/mensagens.

const TELEFONE = "(81) 99999-0000";
const MSG = "Tenho uma dúvida sobre a lentidão do sistema no celular.";

async function abrirFormulario(page: Page) {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Navegação do campus" }).getByRole("link", { name: "Falar com a equipe" }).click();
  await expect(page).toHaveURL(/\/fale-com-a-equipe$/);
  await expect(page.getByRole("heading", { level: 1, name: "Falar com a equipe" })).toBeVisible();
}

const campoNome = (page: Page) => page.getByLabel("Nome (opcional)");
const campoContato = (page: Page) => page.getByLabel("Telefone ou e-mail (opcional)");
const campoMensagem = (page: Page) => page.getByLabel("Mensagem", { exact: true });
const enviar = (page: Page) => page.getByRole("button", { name: "Enviar mensagem" });

async function preencher(page: Page, nome: string, contato: string, mensagem: string) {
  await campoNome(page).fill(nome);
  await campoContato(page).fill(contato);
  await campoMensagem(page).fill(mensagem);
}

test.describe("UC39 - Mandar Msg. para Admin (visitante)", () => {
  test.beforeEach(async ({ page }) => {
    await abrirFormulario(page);
  });

  test("CT-039.01 Enviar mensagem com nome e telefone", async ({ page, api }) => {
    await test.step("Preencher nome, telefone com DDD e mensagem", () => preencher(page, "Maria Teste", TELEFONE, MSG));

    await test.step('Clicar em "Enviar mensagem"', () => enviar(page).click());

    await test.step('Aparece "Mensagem enviada" e o agradecimento', async () => {
      const ok = page.getByRole("status");
      await expect(ok).toContainText("Mensagem enviada");
      await expect(ok).toContainText("Obrigado!");
      expect(api.messages).toHaveLength(1);
      expect(api.messages[0]).toMatchObject({ nome: "Maria Teste", contato: TELEFONE, mensagem: MSG });
    });

    await test.step('"Enviar outra mensagem" abre o formulário limpo', async () => {
      await page.getByRole("button", { name: "Enviar outra mensagem" }).click();
      await expect(campoNome(page)).toHaveValue("");
      await expect(campoContato(page)).toHaveValue("");
      await expect(campoMensagem(page)).toHaveValue("");
    });
  });

  test("CT-039.02 Enviar sem escrever a mensagem", async ({ page, api }) => {
    await test.step('Preencher nome e contato, deixar "Mensagem" só com espaços e enviar', async () => {
      await preencher(page, "Maria Teste", TELEFONE, "   ");
      await enviar(page).click();
    });

    await test.step("Mensagem amigável junto ao campo; nada é enviado; demais campos continuam preenchidos", async () => {
      await expect(page.getByText("Escreva a mensagem antes de enviar.")).toBeVisible();
      await expect(campoNome(page)).toHaveValue("Maria Teste");
      await expect(campoContato(page)).toHaveValue(TELEFONE);
      expect(api.writes.filter((w) => w.path === "/messages")).toEqual([]);
    });
  });

  test("CT-039.03 Enviar mensagem com e-mail no lugar do telefone", async ({ page, api }) => {
    await test.step("Preencher nome, e-mail e mensagem e enviar", async () => {
      await preencher(page, "Joao Teste", "joao.teste@example.com", MSG);
      await enviar(page).click();
    });

    await test.step('Exibe "Mensagem enviada"', async () => {
      await expect(page.getByRole("status")).toContainText("Mensagem enviada");
      expect(api.messages[0]).toMatchObject({ contato: "joao.teste@example.com" });
    });
  });

  test("CT-039.04 Contato em formato inválido", async ({ page, api }) => {
    for (const invalido of ["joao@", "abc", "12345"]) {
      await test.step(`Contato inválido "${invalido}": mostra o erro e não envia`, async () => {
        await preencher(page, "Maria Teste", invalido, MSG);
        await enviar(page).click();
        await expect(page.getByText("Preencha o campo de telefone ou e-mail corretamente, ou deixe-o em branco.")).toBeVisible();
        expect(api.writes.filter((w) => w.path === "/messages")).toEqual([]);
      });
    }

    await test.step("Apagar o contato e enviar de novo funciona", async () => {
      await campoContato(page).fill("");
      await enviar(page).click();
      await expect(page.getByRole("status")).toContainText("Mensagem enviada");
      expect(api.messages).toHaveLength(1);
    });
  });

  test("CT-039.05 Envio em tempo razoável", async ({ page, api }) => {
    // Atraso artificial de 400 ms no servidor, para o botão "Enviando..." ser visível no teste e no vídeo.
    await page.route("**/api/messages", async (route) => {
      await new Promise((r) => setTimeout(r, 400));
      await route.fallback();
    });
    await preencher(page, "Maria Teste", TELEFONE, MSG);

    const inicio = Date.now();
    await test.step('Clicar em "Enviar mensagem": o botão mostra "Enviando..."', async () => {
      await enviar(page).click();
      await expect(page.getByRole("button", { name: "Enviando..." })).toBeDisabled();
    });

    await test.step('Logo aparece "Mensagem enviada" (menos de 3 segundos)', async () => {
      await expect(page.getByRole("status")).toContainText("Mensagem enviada");
      const duracao = Date.now() - inicio;
      expect(duracao, `envio levou ${duracao} ms`).toBeLessThan(3000);
      expect(api.messages).toHaveLength(1);
    });
  });

  test("CT-039.06 Enviar várias mensagens", async ({ page, api }) => {
    for (const n of [1, 2, 3]) {
      await test.step(`Mensagem ${n} de 3`, async () => {
        await preencher(page, `Visitante ${n}`, TELEFONE, `Mensagem de teste número ${n}.`);
        await enviar(page).click();
        await expect(page.getByRole("status")).toContainText("Mensagem enviada");
        if (n < 3) await page.getByRole("button", { name: "Enviar outra mensagem" }).click();
      });
    }

    await test.step('As 3 mensagens aparecem no painel em "Mensagens recebidas"', async () => {
      expect(api.messages).toHaveLength(3);
      await loginPelaTela(page);
      await abrirMensagens(page);
      await expect(page.getByText("3 mensagens")).toBeVisible();
      for (const n of [1, 2, 3]) await expect(page.getByText(`Mensagem de teste número ${n}.`)).toBeVisible();
    });
  });

  test("CT-039.07 Enviar sem nome nem contato", async ({ page }) => {
    await test.step("Deixar nome e contato em branco, escrever a mensagem e enviar", async () => {
      await campoMensagem(page).fill(MSG);
      await enviar(page).click();
      await expect(page.getByRole("status")).toContainText("Mensagem enviada");
    });

    await test.step('No painel a mensagem aparece como "Anônimo" e "Sem contato"', async () => {
      await loginPelaTela(page);
      await abrirMensagens(page);
      const item = page.getByRole("listitem").filter({ hasText: MSG });
      await expect(item).toContainText("Anônimo");
      await expect(item).toContainText("Sem contato");
    });
  });

  test("CT-039.11 Limite de mensagens em pouco tempo", async ({ page, api }) => {
    // O limite (20 a cada 10 min) soma todos os visitantes: 19 já foram enviados por outros.
    api.preloadSends(19);

    await test.step("A 20ª mensagem ainda passa", async () => {
      await preencher(page, "Maria Teste", TELEFONE, "Mensagem número 20.");
      await enviar(page).click();
      await expect(page.getByRole("status")).toContainText("Mensagem enviada");
      await page.getByRole("button", { name: "Enviar outra mensagem" }).click();
    });

    await test.step("A 21ª ultrapassa o limite: aviso amigável, nada gravado, texto continua no formulário", async () => {
      await preencher(page, "Maria Teste", TELEFONE, "Mensagem número 21.");
      await enviar(page).click();
      await expect(page.getByRole("alert").filter({ hasText: "Muitas" })).toHaveText("Muitas mensagens em pouco tempo. Tente novamente em alguns minutos.");
      await expect(campoMensagem(page)).toHaveValue("Mensagem número 21.");
      expect(api.messages.map((m) => m.mensagem)).toEqual(["Mensagem número 20."]);
    });

    await test.step("Passada a janela de 10 minutos, o envio volta a funcionar", async () => {
      api.advanceClock(10 * 60 * 1000 + 1000);
      await enviar(page).click();
      await expect(page.getByRole("status")).toContainText("Mensagem enviada");
      expect(api.messages.map((m) => m.mensagem)).toEqual(["Mensagem número 20.", "Mensagem número 21."]);
    });
  });

  test("CT-039.12 (parte da interface) Aviso de que as mensagens são apagadas após 15 dias", async ({ page }) => {
    // A limpeza das mensagens com mais de 15 dias acontece no backend (MessageService.RETENTION) e precisa de banco:
    // não dá para provar aqui com a API simulada. A interface, sim: o formulário e o painel informam o prazo.
    await test.step("O formulário público informa a retenção de 15 dias", async () => {
      await expect(page.getByText("As mensagens são apagadas automaticamente após 15 dias.")).toBeVisible();
    });

    await test.step("O painel informa a retenção de 15 dias", async () => {
      await loginPelaTela(page);
      await abrirMensagens(page);
      await expect(page.getByText(/apagada\s+automaticamente 15 dias depois de enviada/)).toBeVisible();
    });
  });
});

test.describe("UC39 - Mandar Msg. para Admin (painel)", () => {
  const dias = (n: number) => new Date(Date.now() - n * 24 * 3600 * 1000).toISOString();

  test("CT-039.08 Administrador vê as mensagens enviadas", async ({ page, api }) => {
    await loginPelaTela(page);

    await test.step('Abrir "Mensagens recebidas" no menu (grupo Gestão) sem mensagens', async () => {
      await abrirMensagens(page);
      await expect(page.getByText("Nenhuma mensagem recebida ainda.")).toBeVisible();
    });

    api.seedMessage({ nome: "Ana Antiga", contato: "ana@example.com", mensagem: "Primeira mensagem (a mais antiga).", createdAt: dias(3), read: true });
    api.seedMessage({ nome: null, contato: null, mensagem: "Segunda mensagem (anônima).", createdAt: dias(2) });
    api.seedMessage({ nome: "Caio Novo", contato: TELEFONE, mensagem: "Terceira mensagem (a mais recente).", createdAt: dias(1) });

    await test.step("Com mensagens, a lista vai da mais recente para a mais antiga", async () => {
      await page.reload();
      const itens = page.getByRole("listitem").filter({ hasText: "mensagem" });
      await expect(itens.first()).toContainText("Terceira mensagem");
      await expect(itens.last()).toContainText("Primeira mensagem");
    });

    await test.step("Cada mensagem mostra nome ou Anônimo, contato ou Sem contato, data e texto; 'Nova' nas não lidas", async () => {
      const recente = page.getByRole("listitem").filter({ hasText: "Terceira mensagem" });
      await expect(recente).toContainText("Caio Novo");
      await expect(recente).toContainText(TELEFONE);
      await expect(recente.locator("time")).toHaveText(/\d{2}\/\d{2}\/\d{4}.*\d{2}:\d{2}/);
      await expect(recente.getByText("Nova", { exact: true })).toBeVisible();
      const anonima = page.getByRole("listitem").filter({ hasText: "Segunda mensagem" });
      await expect(anonima).toContainText("Anônimo");
      await expect(anonima).toContainText("Sem contato");
      const lida = page.getByRole("listitem").filter({ hasText: "Primeira mensagem" });
      await expect(lida.getByText("Nova", { exact: true })).toHaveCount(0);
    });

    await test.step("O topo informa o total, as não lidas e o prazo de 15 dias", async () => {
      await expect(page.getByText("3 mensagens")).toBeVisible();
      await expect(page.getByText("2 não lidas")).toBeVisible();
      await expect(page.getByText(/apagada\s+automaticamente 15 dias/)).toBeVisible();
    });
  });

  test("CT-039.09 Marcar como lida, como não lida e filtrar as não lidas", async ({ page, api }) => {
    api.seedMessage({ nome: "Ana Teste", contato: "ana@example.com", mensagem: "Mensagem para marcar como lida.", createdAt: dias(1) });
    api.seedMessage({ nome: "Bia Teste", contato: null, mensagem: "Outra mensagem não lida.", createdAt: dias(0) });
    await loginPelaTela(page);
    await abrirMensagens(page);
    const ana = page.getByRole("listitem").filter({ hasText: "Mensagem para marcar como lida." });
    await expect(page.getByText("2 não lidas")).toBeVisible();

    await test.step('Em uma mensagem "Nova", clicar em "Marcar como lida"', async () => {
      await ana.getByRole("button", { name: /Marcar como lida/ }).click();
      await expect(ana.getByText("Nova", { exact: true })).toHaveCount(0);
      await expect(ana.getByRole("button", { name: /Marcar como não lida/ })).toBeVisible();
      await expect(page.getByText("1 não lida")).toBeVisible();
    });

    await test.step('Filtro "Não lidas": a mensagem lida não aparece', async () => {
      await page.getByRole("button", { name: "Não lidas", exact: true }).click();
      await expect(page.getByText("Mensagem para marcar como lida.")).toHaveCount(0);
      await expect(page.getByText("Outra mensagem não lida.")).toBeVisible();
    });

    await test.step("Recarregar a página: o estado continua", async () => {
      await page.reload();
      await expect(page.getByText("1 não lida")).toBeVisible();
      await expect(ana.getByText("Nova", { exact: true })).toHaveCount(0);
    });

    await test.step('Clicar em "Marcar como não lida": o selo "Nova" volta', async () => {
      await ana.getByRole("button", { name: /Marcar como não lida/ }).click();
      await expect(ana.getByText("Nova", { exact: true })).toBeVisible();
      await expect(page.getByText("2 não lidas")).toBeVisible();
    });
  });

  test("CT-039.10 Conta somente leitura consulta, mas não altera", async ({ page, api }) => {
    api.seedMessage({ nome: "Ana Teste", contato: null, mensagem: "Mensagem para a conta de leitura.", createdAt: dias(1) });

    await test.step('Entrar com perfil "Somente leitura" e abrir "Mensagens recebidas"', async () => {
      await loginPelaTela(page, "leitura.teste@ufrpe.br");
      await abrirMensagens(page);
    });

    await test.step("A lista aparece, mas os botões de marcar como lida/não lida não", async () => {
      await expect(page.getByText("Mensagem para a conta de leitura.")).toBeVisible();
      await expect(page.getByRole("button", { name: /Marcar como/ })).toHaveCount(0);
    });
  });
});

// Pelo menu lateral do painel (o cartão do painel inicial também leva à mesma tela).
async function abrirMensagens(page: Page) {
  await page.getByRole("navigation", { name: "Área do administrador" }).getByRole("link", { name: "Mensagens recebidas" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Mensagens recebidas" })).toBeVisible();
}
