# Plano de correção da 2ª rodada de testes (rc2)

Fonte: `docs/Casos_de_Teste_Geral_GuiaRural (2).xlsx` (colunas rc1 e rc2), comparada com a planilha `(1)` e com `docs/plano-correcao-casos-de-teste.md`. Análise de 21/11/2026.
**O que eu fiz:** li a planilha e o código e fiz leituras (GET) na API pública. **O que não fiz:** não abri o app no navegador, não consultei o banco (o projeto do GuiaRural não está acessível pelo MCP do Supabase da sessão) e não reproduzi nenhum caso. Os diagnósticos marcados "hipótese" precisam de confirmação.

## Andamento (21/11/2026)

| Etapa | Situação |
|---|---|
| 0. Confirmar a causa (bibliotecas) | **Pendente.** Precisa do painel (`/admin/historico`) ou do banco. |
| 1. Restaurar os dados | **Pendente**, depende da Etapa 0 e de autorização para escrever no banco. |
| 2. Testes sem mexer em dados reais | **Feita na planilha:** nova seção 4 em "Massa de Dados" (locais descartáveis) e regra nos 10 casos de UC15/UC16. Falta criar os locais de teste pelo UC14. |
| 3. Reescrever casos | **Feita para:** 038.04, 010.03 a 010.05, 037.01, 023.05, 028.01 a 028.04 (título do UC28 também) e 036.03 (agora aponta para os testes automatizados). Esses casos voltaram para `NoRun`, e o resultado e o comentário do rc1 foram mantidos. **Falta:** 001.05 (reproduzir antes), 021.x (confirmar com quem testou) e reexecutar 012.04, 013.02 e 014.02 anotando o passo. |
| 4. Código | **Feita:** badge removido (`acdb21a`). CT-003.02 e CT-018.04 receberam a nota na planilha. |
| 5. rc2 completo | **Pendente.** |

**Não alterei** os `Not planned` do rc2 dos casos que já passaram no rc1 (UC12 a UC14, UC23 a UC27) nem os de 007.05, 008.02 e 025.03: não dá para saber se foi decisão do time ou falta de execução. Combinar a convenção (`NoRun` = pendente) antes de trocar.

## 1. O que a planilha mostra

161 casos (sem o UC39, que foi reescrito e ainda não foi executado). Situação em rc2: **Passed 52 · Failed 4 · Blocked 1 · Not planned 62 · NoRun 37 · NA 5**.

- **Regressões de verdade (rc1 Passed → rc2 Failed): só 2**, CT-001.02 e CT-006.03. As duas dizem a mesma coisa: a Biblioteca Central não aparece na busca nem no mapa.
- **O que parece "passou a falhar" é, em grande parte, caso não reexecutado.** Dos 113 casos que passaram no rc1, **70 não têm um Passed no rc2**: 2 Failed, 35 `NoRun` (UC15 a UC21) e 33 `Not planned` (UC12 a UC14, UC23 a UC27). O rótulo `Not planned` está sendo usado para "ainda não refiz", e não para "fora de escopo", o que distorce a síntese.
- **Resolvidos no rc2 (7):** 006.01, 006.02, 008.03, 008.04, 040.02, 040.03 e 040.04. Além deles, 010.01 e 010.02 passaram.
- **Não resolvidos:** CT-001.05 (Failed), CT-038.04 (Failed), CT-037.01 (Blocked) e 13 casos que falharam, ficaram bloqueados ou nem tinham sido executados no rc1 e não foram refeitos (007.05, 008.02, 012.04, 013.02, 014.02, 023.05, 025.03, 028.01 a 028.04, 036.03 e 038.03).
- **Todas as correções do plano anterior já estão no código** (sigla de 2 letras, rota pela busca, link local → departamento, filtro de cursos, trilha do curso, duplicar cardápio, UC28, Guia de Recife). O que falta é **reescrever os casos** (Etapa 1 daquele plano, não feita) e **reexecutar**.

## 2. Diagnóstico

### A. Dados do ambiente (provável causa das duas regressões)
Comentários independentes de três testadores apontam o mesmo sintoma: CT-001.02 ("não tem os pin de biblioteca mais"), CT-006.03 ("não apareceu a sugestão de biblioteca central") e CT-010.03 e CT-011.01/02/04 ("a página da biblioteca central e setorial não existe", comentários novos do rc2). O seed publica `biblioteca` e `biblioteca-setorial`, e o código não mudou nessa área.

**Hipótese:** as duas bibliotecas foram **despublicadas ou excluídas no próprio ambiente de teste**. Há um mecanismo para isso: **só existe um ambiente, a produção** (CLAUDE.md §3), e os casos UC15 e UC16 editam e excluem "um local qualquer" (`CT-015.05`: "salvar como rascunho"; `CT-016.01/04/05`: "Deletar Local"), sem apontar qual. A aba "Massa de Dados" só prevê dados de criação (UC14). Na 1ª rodada, 10 casos de UC15/16 passaram, ou seja, alguém editou e apagou locais reais.
Não consegui confirmar: a API estourou 100 s sem responder quando tentei (Render dormindo ou fora do ar), e não tenho o banco.

### B. Casos desatualizados em relação às decisões (reprovam sem ser bug)
| CT | Situação |
|---|---|
| **038.04** | O texto ainda diz "centraliza o mapa na posição do usuário". O botão agora abre o traçado de rota (decisão de 20/11). O "Não funciona" é o caso antigo contra o comportamento novo. |
| **037.01** | O texto manda achar o departamento "pelo menu Cursos e Departamentos" depois de clicar no pin. O link existe no cartão, mas só aparece para local com departamento ou curso vinculado. O caso não diz qual local usar. |
| **010.03 a 010.05** | Esperam "Traçar Rota" no cartão. O traçado hoje está na página do local e no botão amarelo da busca. |
| **011.01 a 011.04** | Esperam o botão "Serviços" na página do local, que não existe por decisão (D3/D4/D6/D7). O plano anterior já os tirava do escopo. |
| **007.05, 008.02, 028.01 a 028.04, 023.05, 036.03** | Falharam no rc1 e o texto não foi reescrito. Já têm correção no código ou estratégia no plano anterior. |
| **021.01 a 021.05** | Os comentários dizem "não existe tela dashboard": o caso cita uma tela que o sistema não tem. Confirmar com quem testou e ajustar o texto. |

### C. Defeitos reais que o plano anterior não cobria
- **Badge "3" fixo no menu "Avisos do campus"** (`components/common/Sidebar.tsx:16`, `badge: "3"`). Aparece em CT-003.02 e CT-018.04 (publicar ou apagar aviso não muda o número). É valor escrito à mão, não contagem. **Decisão necessária:** remover o badge (mais simples e coerente com a RNF04) ou contar os avisos publicados depois da última visita, guardada no `localStorage`.
- **CT-025.05:** o "deseja editar?" ao cadastrar um cardápio duplicado é desnecessário (a tela já permite editar). Melhoria de UX, prioridade baixa.
- **CT-004.03 e CT-005.03:** os comentários do rc1 (link de Wi-Fi quebrado e um bug de interface) sumiram na `(2)`. Confirmar se foram corrigidos ou apenas apagados.

### D. CT-001.05, precisa de reprodução
O código centraliza com `map.setView` no pin do local escolhido (`CampusMap.tsx:86`), e `ceagri-1` e `deagri` ficam a ~300 m um do outro (lon -34,9441 e -34,9468). Pela leitura, **não explico** "centraliza em DEAGRI". Hipóteses: (1) o armazenamento local não estava limpo, e `getRecentPlaces` descarta ids que não existem mais (se `biblioteca` sumiu, a lista padrão perde um item e a ordem esperada quebra); (2) o cartão do local cobre parte do mapa e o pin parece fora do centro. Reproduzir antes de mexer no código.

### E. Síntese e convenção de status
- `SINTESE-V01.01.00-RC2` ainda diz "VERSÃO :V01.01.00-RC1 / DATA : 19/11", está preenchida pela metade e tem totais inconsistentes (UC03: 5 passados + 4 bloqueados num total de 5; vem da RC1). A linha do UC39 diz Blocked 6 / total 6, mas agora são 12 casos `NoRun`.
- Os números são digitados à mão. Trocar por `COUNTIF` sobre a coluna rc2 de cada aba.

## 3. Etapas

**Etapa 0: confirmar a causa (rápido, antes de mexer em qualquer coisa)**
- Em `/admin/locais` e `/admin/historico` (filtro "Local"): `biblioteca` e `biblioteca-setorial` existem? Em que status? Quem mudou e quando? Ou, no banco: `select slug, status from places where slug in ('biblioteca','biblioteca-setorial')`.
- Conferir a saúde do backend (`/actuator/health`) e se o Render está dormindo.
- Pronto quando: a hipótese A estiver confirmada ou descartada.

**Etapa 1: restaurar os dados** (precisa de autorização para escrever no banco)
- Se foram excluídas ou editadas pelo painel, usar **Desfazer** no histórico (UC23): recria o registro com o mesmo slug; a foto não volta. Senão, SQL pontual.
- Pronto quando: as duas bibliotecas estiverem publicadas e CT-001.02, CT-006.03, CT-010.03 e CT-011.01 reexecutarem sem o sintoma.

**Etapa 2: impedir que os testes mutem dados reais**
- Agora (barato): UC15 e UC16 passam a usar **só locais criados no UC14** (ex.: "Laboratório de Informática 3/4/5"); acrescentar a "Massa de Dados". Nunca editar ou apagar os locais da carga inicial.
- Depois: o ambiente de teste que o projeto já prevê (segundo projeto Supabase e deploy próprio). Fica para decisão do time.

**Etapa 3: reescrever os casos** (nenhuma linha de código)
- 038.04 (traçar rota), 037.01 (indicar o local com departamento e curso vinculados), 010.03 a 010.05, 021.x, 023.05, 036.03, 028.01 a 028.04 (editar a descrição) e 001.05 (passo a passo com armazenamento limpo).
- Reexecutar 012.04, 013.02 e 014.02 anotando o **passo** que falha (o plano anterior já pedia).
- Convenção: `NoRun` = pendente; `Not planned` = fora de escopo por decisão (UC09, UC11, UC31, UC41).

**Etapa 4: código** (branch `fix/rc2-aviso-badge`, a partir da `dev`)
- Badge de avisos, conforme a decisão da seção 2C. Textos em PT/EN/ES (EN/ES com revisão humana); `tsc`, `eslint` e `build` antes do commit.
- CT-025.05 e CT-001.05 só se a reprodução mostrar defeito.

**Etapa 5: rc2 completo**
- Reexecutar: os 70 casos sem Passed, todos os de UC12 a UC28 e os da seção 2B reescritos; UC39 depois que a migration for aplicada.
- Fechar a síntese com fórmulas e o cabeçalho certo; atualizar o CLAUDE.md §12 se algo mudar.

## 4. Responsáveis por UC (segundo a síntese da planilha)
Yann: UC01 a UC06 e UC31 · Gabriel: UC07 a UC11 e UC41 · Aniely: UC12 a UC17 · Pedro Lucas: UC18 a UC21 · Ferraz: UC23 a UC28 · Thiago: UC35 a UC40.

## 5. Ordem
Etapa 0 → 1 → (2 e 3 em paralelo) → 4 → 5. A Etapa 4 só depende da decisão do badge e não precisa esperar as demais.
