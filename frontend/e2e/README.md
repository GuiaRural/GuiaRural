# Testes de interface (Playwright) — UC35 a UC40

Automatizam os casos CT-035.01 a CT-040.04 da planilha `docs/Casos_de_Teste_Geral_GuiaRural`.
Rodam no Microsoft Edge (o navegador da planilha), sem backend nem banco: a API é simulada no navegador
(`support/fakeApi.ts`, com dados fictícios e estado), então nada toca a produção.

```bash
cd frontend
npm run e2e                      # roda tudo; o terminal mostra cada caso e cada passo
npm run e2e:headed               # abre o Edge e mostra a execução na tela
E2E_SLOWMO=600 npm run e2e:headed  # idem, em câmera lenta (bom para gravar a tela)
npm run e2e:ui                   # painel do Playwright: passo a passo, com linha do tempo
npm run e2e:report               # relatório HTML do último run (vídeos e traços incluídos)
npx playwright test uc39         # só um UC
```

- Vídeo de cada caso: `e2e-results/<caso>/video.webm`. Relatório: `e2e-report/`. Ambos fora do Git.
- Se o `npm run dev` já estiver rodando na porta 3000, ele é reaproveitado; senão o Playwright sobe um.
- Precisa do ffmpeg do Playwright para gravar vídeo: `npx playwright install ffmpeg` (uma vez).

## Fora do que a interface consegue provar

- **CT-039.12** (apagar mensagens com mais de 15 dias): só a parte de interface (o aviso do prazo) é testada;
  a limpeza acontece no backend (`MessageService.RETENTION`) e precisa de banco.
- **CT-037.04** está marcado `test.fail`: a planilha espera "Nenhum curso vinculado a este departamento", mas a tela
  hoje não mostra a seção (FE-37.01). Quando a mensagem for implementada, o teste passa a falhar de propósito: remova o `test.fail`.
- **CT-035.01** usa o comportamento atual: não existe botão "Modo de Edição"; o formulário abre direto editável.
