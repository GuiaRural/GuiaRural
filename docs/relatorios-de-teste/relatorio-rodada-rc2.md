# Relatório da rodada de testes rc2: GuiaRural

| | |
|---|---|
| **Projeto** | GuiaRural: plataforma de acesso livre para estudantes da UFRPE (campus Dois Irmãos) |
| **Rodada** | rc2 (coluna `rc2` da planilha) |
| **Versão testada** | Build **v1.4.1** (informado pela equipe). Rótulos na planilha: `01.02.00-rc2` / `01.00.00-rc2`; a aba de síntese ainda diz "V01.01.00-RC1". |
| **Período** | **20/11/2026** (informado pela equipe). Rodada de 1 dia, início e término no mesmo dia. Horários: **não registrados** |
| **Fonte dos dados** | `docs/Casos_de_Teste_Geral_GuiaRural (3).xlsx`, abas por caso de uso (as abas de síntese não foram usadas, ver §7) |
| **Responsáveis pela execução** | Yann (UC01 a UC06, UC31), Gabriel (UC07 a UC11, UC41), Aniely (UC12 a UC17), Pedro Lucas (UC18 a UC21), Ferraz (UC23 a UC28), Thiago (UC35 a UC40), conforme a síntese da planilha |
| **Relatório gerado em** | 23/11/2026, a partir da planilha; nenhum caso foi reexecutado para produzi-lo |

## 1. Resumo

Dos 173 casos, 145 estavam planejados. Passaram 129, falharam 6, 5 ficaram bloqueados e 5 não foram executados. A taxa de aprovação sobre os casos com veredito foi de 95,6%, contra 91,1% no rc1, e 31 dos 35 casos de uso tiveram ao menos um caso executado (29 no rc1).

Em relação ao rc1, 20 casos passaram a `Passed` (UC39 quase inteiro, UC40, CT-006.01/.02, CT-008.03/.04 e CT-010.01/.02). Houve **2 regressões reais**, CT-001.02 e CT-006.03, ambas com o mesmo sintoma: as bibliotecas Central e Setorial sumiram da busca e do mapa (#297). Outros 4 casos que falharam no rc1 ficaram como `Not planned` no rc2, o que na prática significa "não reexecutado" e não "fora de escopo".

## 2. Ambiente de teste

| Item | Valor |
|---|---|
| Ambiente testado | Produção (hoje é o único: dev, teste e homologação são planejados) |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, na Vercel |
| Backend | Java 21, Spring Boot 4.1, no Render (`backend/Dockerfile`) |
| Banco | PostgreSQL no Supabase |
| Mapa | Leaflet 1.9.4 + OpenStreetMap |
| Dados de teste | Aba "Massa de Dados" da planilha (contas de administrador, locais da carga inicial e dados para o UC14) |

| Navegador (conforme a planilha) | Casos de uso |
|---|---|
| Google Chrome | UC01 a UC09, UC11 a UC23, UC26 a UC28, UC31, UC39, UC41 |
| Safari iOS | UC10 |
| Firefox | UC24 |
| Microsoft Edge | UC25, UC35 a UC38, UC40 |

> **Não consta na planilha** (precisa ser preenchido pela equipe): sistema operacional e versão do navegador de cada testador, hardware (modelo, tela), tipo de conexão, e horário de início e fim de cada execução. Esses campos passam a ser obrigatórios no formulário de bug (`.github/ISSUE_TEMPLATE/bug.yml`).

## 3. Métricas

| Métrica | Valor |
|---|--:|
| Casos de teste na planilha | 173 |
| Fora do escopo da rodada (`Not planned` 23 + `NA` 5) | 28 |
| **Casos planejados para a rodada** | **145** |
| Executados com veredito (`Passed` + `Failed`) | 135 (93,1% do planejado) |
| Tentados, incluindo `Blocked` | 140 (96,6% do planejado) |
| Não executados (`NoRun`) | 5 (3,4%) |
| **Taxa de aprovação** (`Passed` ÷ executados) | **95,6%** |
| Aprovados sobre o planejado | 89,0% |
| Casos de uso (abas) na planilha | 35 |
| **Casos de uso com ao menos um caso executado** (funcionalidades testadas) | **31 de 35 (88,6%)** |
| Casos de uso com todos os casos aprovados | 15 de 35 |

Critérios: "planejado" exclui o que a própria planilha marca como `Not planned` ou `NA`. "Executado" conta só `Passed` e `Failed`; `Blocked` foi tentado, mas não chegou a veredito. Métricas de tempo só existem onde o testador anotou: nesta planilha, apenas CT-008.03 (1,40 s a 1,60 s no rc1). Os demais casos de performance (CT-007.03, CT-021.05, CT-039.05, CT-041.05) têm só o veredito.

### Comparação com o rc1

| Métrica | rc1 | rc2 |
|---|--:|--:|
| `Passed` | 113 | 129 |
| `Failed` | 11 | 6 |
| `Blocked` | 15 | 5 |
| `NoRun` | 3 | 5 |
| `Not planned` | 20 | 23 |
| `NA` | 11 | 5 |
| Taxa de aprovação | 91,1% | 95,6% |
| Casos de uso com caso executado | 29 de 35 | 31 de 35 |

Transições: 109 casos `Passed` nas duas rodadas; 20 passaram a `Passed`; 2 regrediram para `Failed` (CT-001.02, CT-006.03); 2 passaram a `NoRun` (CT-021.01, CT-021.04, sem reexecução); 4 `Failed` do rc1 viraram `Not planned` (CT-007.05, CT-012.04, CT-013.02, CT-014.02); 4 casos seguem `Failed` (CT-001.05, CT-025.03, CT-028.01, CT-038.04); 5 seguem `Blocked` (CT-023.05, CT-028.02 a CT-028.04, CT-037.01).

## 4. Resultado por caso de uso

| UC | Funcionalidade | Responsável | Navegador | Passed | Failed | Blocked | NoRun | Not planned | NA | Total |
|---|---|---|---|--:|--:|--:|--:|--:|--:|--:|
| UC01 | Pesquisar Local | Yann | Google Chrome | 3 | 2 | 0 | 0 | 0 | 0 | 5 |
| UC02 | Interagir com o Mapa | Yann | Google Chrome | 3 | 0 | 0 | 0 | 0 | 0 | 3 |
| UC03 | Acessar Página de Aviso | Yann | Google Chrome | 5 | 0 | 0 | 0 | 0 | 0 | 5 |
| UC04 | Acessar Guia do Calouro | Yann | Google Chrome | 5 | 0 | 0 | 0 | 0 | 0 | 5 |
| UC05 | Mudar Idioma | Yann | Google Chrome | 5 | 0 | 0 | 0 | 0 | 0 | 5 |
| UC06 | Selecionar Local | Yann | Google Chrome | 4 | 1 | 0 | 0 | 0 | 0 | 5 |
| UC07 | Buscar Info. de um Local | Gabriel | Google Chrome | 4 | 0 | 0 | 0 | 1 | 0 | 5 |
| UC08 | Pesquisar Info. de Curso | Gabriel | Google Chrome | 4 | 0 | 0 | 0 | 1 | 0 | 5 |
| UC09 | Cartilha Cultural | Gabriel | Google Chrome | 0 | 0 | 0 | 0 | 5 | 0 | 5 |
| UC10 | Rotas | Gabriel | Safari iOS | 2 | 0 | 0 | 0 | 3 | 0 | 5 |
| UC11 | Consultar Serviço | Gabriel | Google Chrome | 0 | 0 | 0 | 0 | 4 | 0 | 4 |
| UC12 | Fazer Login | Aniely | Google Chrome | 4 | 0 | 0 | 0 | 1 | 0 | 5 |
| UC13 | Cadastrar Administrador | Aniely | Google Chrome | 4 | 0 | 0 | 0 | 1 | 0 | 5 |
| UC14 | Adicionar Local | Aniely | Google Chrome | 4 | 0 | 0 | 0 | 3 | 0 | 7 |
| UC15 | Editar Local | Aniely | Google Chrome | 5 | 0 | 0 | 0 | 0 | 0 | 5 |
| UC16 | Deletar Local | Aniely | Google Chrome | 5 | 0 | 0 | 0 | 0 | 0 | 5 |
| UC17 | Criar Aviso | Aniely | Google Chrome | 5 | 0 | 0 | 0 | 0 | 0 | 5 |
| UC18 | Deletar Aviso | Pedro Lucas | Google Chrome | 5 | 0 | 0 | 0 | 0 | 0 | 5 |
| UC19 | Adicionar Serviço | Pedro Lucas | Google Chrome | 5 | 0 | 0 | 0 | 0 | 0 | 5 |
| UC20 | Editar Serviço | Pedro Lucas | Google Chrome | 5 | 0 | 0 | 0 | 0 | 0 | 5 |
| UC21 | Deletar Serviço | Pedro Lucas | Google Chrome | 3 | 0 | 0 | 2 | 0 | 0 | 5 |
| UC23 | Auditoria | Ferraz | Google Chrome | 4 | 0 | 1 | 0 | 0 | 0 | 5 |
| UC24 | Logout | Ferraz | Firefox | 5 | 0 | 0 | 0 | 0 | 0 | 5 |
| UC25 | Gestão do RU | Ferraz | Edge | 4 | 1 | 0 | 0 | 0 | 0 | 5 |
| UC26 | Editar Cardápio do RU | Ferraz | Google Chrome | 4 | 0 | 0 | 0 | 0 | 0 | 4 |
| UC27 | Deletar Cardápio do RU | Ferraz | Google Chrome | 4 | 0 | 0 | 0 | 0 | 0 | 4 |
| UC28 | Adicionar Info. no Local | Ferraz | Google Chrome | 0 | 1 | 3 | 0 | 0 | 0 | 4 |
| UC31 | Consultar Contato | Yann | Google Chrome | 0 | 0 | 0 | 0 | 4 | 0 | 4 |
| UC35 | Editar Curso | Thiago | Microsoft Edge | 5 | 0 | 0 | 0 | 0 | 0 | 5 |
| UC36 | Deletar Curso | Thiago | Microsoft Edge | 2 | 0 | 0 | 1 | 0 | 0 | 3 |
| UC37 | Visualizar Cursos Depto | Thiago | Microsoft Edge | 3 | 0 | 1 | 0 | 0 | 0 | 4 |
| UC38 | Sugestões de Busca | Thiago | Microsoft Edge | 3 | 1 | 0 | 1 | 0 | 0 | 5 |
| UC39 | Mandar Msg. para Admin | Thiago | Google Chrome | 11 | 0 | 0 | 1 | 0 | 0 | 12 |
| UC40 | Consultar Guia de Recife | Thiago | Microsoft Edge | 4 | 0 | 0 | 0 | 0 | 0 | 4 |
| UC41 | Recuperar Senha | Gabriel | Google Chrome | 0 | 0 | 0 | 0 | 0 | 5 | 5 |
| **Total** | | | | **129** | **6** | **5** | **5** | **23** | **5** | **173** |

## 5. Bugs e incidentes

O identificador de cada bug é o número da issue no GitHub (`#N`), aberta em 23/11/2026. Três bugs já estavam verificados no rc2 e não ganharam issue (BUG-07, BUG-14 e BUG-15, IDs provisórios). Gravidade, urgência e situação são **propostas desta análise**, a confirmar na triagem; a situação foi deduzida do plano de correção do rc2 (`docs/plano-correcao-casos-de-teste-rc2.md`) e do histórico do Git, **sem reproduzir os casos**.

| ID | Defeito | Casos de teste | Encontrado em | Gravidade / urgência (proposta) | Situação em 23/11/2026 | Base da situação |
|---|---|---|---|---|---|---|
| #297 | Biblioteca Central e Biblioteca Setorial não aparecem na busca nem no mapa | CT-001.02, CT-006.03 (comentários também em CT-010.03, CT-011.01/.02/.04) | rc2 (regressão: passou no rc1) | Alta / Alta | Corrigido (aguardando verificação) | **Causa confirmada em 25/11/2026** no histórico de auditoria: em 20/11 (~03h UTC) `biblioteca-setorial` foi deletada e `biblioteca` passou a rascunho pelo painel (UC15/UC16 editam e excluem locais reais; só existe produção). Hoje as duas estão `publicado` (restauradas fora do painel, sem registro `restaurado`). Falta reexecutar os casos. Ver `docs/plano-correcao-casos-de-teste-rc2.md` §2A. |
| #298 | "Últimos acessos" não leva ao CEAGRI I: o item some da lista e o mapa centraliza em DEAGRI | CT-001.05 | rc1 e rc2 | Média / Normal | Em análise | Não reproduzido ainda; precisa de passo a passo com o armazenamento local limpo (plano rc2 §2D). |
| #299 | Busca não aceita a sigla de 2 letras ("DC"): mostra "Digite ao menos 3 caracteres" | CT-007.05 | rc1 | Média / Normal | Corrigido (aguardando verificação) | Commit `09e11dd`, release v1.3.0. No rc2 o caso ficou como `Not planned` (não reexecutado). |
| #300 | Botão amarelo ao lado da busca não faz nada ("Não funciona") | CT-038.04 | rc1 e rc2 | Média / Alta | Em análise | Commit `87e6fce` (v1.3.0) liga o botão ao traçado de rota, mas o caso reprovou de novo no rc2, que rodou na v1.4.1 (já com a correção), e ainda descreve o comportamento antigo (centralizar no GPS). Reverificar com o texto do caso atualizado. |
| #301 | Sem acesso a "Cursos e departamentos" a partir do pin/cartão do local e sem trilha na página do curso | CT-037.01, CT-008.04 | rc1 | Média / Normal | Corrigido (aguardando verificação) | Commits `70eeb81`, `343bad6`, `2ba567e` (v1.3.0). CT-008.04 passou no rc2; CT-037.01 segue `Blocked` (o link só aparece em local com departamento ou curso vinculado, e o caso não indica qual local usar). |
| #302 | Página `/cursos` sem campo de pesquisa | CT-008.02 | rc1 | Baixa / Normal | Corrigido (aguardando verificação) | Commit `2ba567e` (v1.3.0). No rc2 o caso ficou `Not planned` (não reexecutado). |
| BUG-07 | Consulta de curso lenta (1,40 s a 1,60 s; esperado menos de 1 s) | CT-008.03 | rc1 | Baixa / Baixa | Verificado | Passou no rc2, mas o tempo medido não foi registrado na planilha. |
| #303 | "Duplicar cardápio" age como "Novo cardápio" (não copia o cardápio) | CT-025.03 | rc1 e rc2 | Baixa / Normal | Em análise | Commit `37231cb` (v1.3.0) deixa claro de qual cardápio veio a cópia, mas reprovou no rc2. Confirmar com o testador se esperava cópia direta com a data em branco ou já preenchida. |
| #304 | Selo fixo "3" no menu "Avisos do campus" (não muda ao criar ou excluir aviso) | CT-003.02, CT-018.04 (observado em casos `Passed`) | rc1 | Baixa / Normal | Corrigido (aguardando verificação) | Commit `acdb21a` (v1.4.1) removeu o selo. Os comentários continuam na planilha; reverificar. |
| #305 | Não existe o botão "Adicionar informação" no local (UC28); só "Editar descrição" | CT-028.01, CT-028.02, CT-028.03, CT-028.04 | rc1 e rc2 | Média / Normal | Em análise | Decisão de 20/11 trocou o UC28 por edição da descrição (`c67d98b`, v1.3.0), mas o testador diz que não é o que o caso de uso propõe. Precisa decisão de produto e atualizar o UC e os casos. |
| #306 | Login de conta "aguardando aprovação" mostra só "Não foi possível realizar o login. Verifique seus dados…" | CT-012.04 | rc1 | Média / Normal | Em análise | Não diagnosticado; rc2 `Not planned` (não reexecutado). Falta o resultado esperado que o testador considerou violado. |
| #307 | Cadastro feito por administrador de outro setor cria conta já ativa ("já pode acessar o painel") em vez de "aguardando aprovação" | CT-013.02 | rc1 | Média / Normal | Em análise | Não diagnosticado; rc2 `Not planned`. Confirmar a regra vigente (CLAUDE.md §12: senha definida por quem cadastra, aprovação e revogação só pelo perfil geral). |
| #308 | Local salvo como rascunho: resultado "nenhum resultado encontrado" reprovado no caso | CT-014.02 | rc1 | Média / Normal | Em análise | Não diagnosticado; rc2 `Not planned`. O comentário é ambíguo (não exibir o rascunho ao público é o esperado). Reexecutar anotando o passo que falha. |
| BUG-14 | Não havia onde falar com a equipe (tela de mensagens do UC39 inexistente) | CT-039.01 a CT-039.06 | rc1 | Média / Alta | Verificado | Tela `/fale-com-a-equipe` e API (`4ca9480`, v1.4.0). No rc2, 11 dos 12 casos do UC39 passaram. |
| BUG-15 | Guia de Recife sem filtro por categoria / detalhe do local não verificável | CT-040.02, CT-040.03, CT-040.04 | rc1 | Média / Normal | Verificado | Filtro por categoria (`6fa2a55`, v1.3.0). Os três casos passaram no rc2. |

**Situação dos 15 bugs:** Novo 0 · Em análise 7 · Corrigido, aguardando verificação 5 · Verificado 3. (O rótulo da issue #297 no GitHub ainda é `status: novo`; trocar na triagem.)

### Incidentes que não viraram bug

| Caso | Situação | Observação |
|---|---|---|
| CT-006.01, CT-006.02 | `Failed` no rc1, `Passed` no rc2 | Reprovados sem descrição do erro; não é possível abrir bug. CT-006.02 traz uma dúvida de usabilidade ("onde fica guardado os locais salvos?"). |
| CT-023.05 | `Blocked` nas duas rodadas | O caso exige histórico vazio, mas o sistema já tem registros e os excluídos aparecem como "deletado". É limitação do caso, não defeito confirmado. |
| CT-025.05 | `Passed` com observação | O aviso "deseja editar?" ao cadastrar cardápio duplicado é desnecessário: sugestão de melhoria (baixa), sem bug aberto. |
| CT-021.01, CT-021.04 | `Passed` no rc1, `NoRun` no rc2 | Os comentários citam "não existe tela dashboard": o texto do caso fala de uma tela que o sistema não tem. |
| CT-036.03 | `NoRun` | Falha de exclusão é difícil de provocar à mão. Há teste automatizado de backend (`f2e896b`), que não entra nesta contagem. |
| CT-038.03 | `NoRun` | Atalho Ctrl/⌘+K. Há teste de interface automatizado (`frontend/e2e/uc38-sugestoes-de-busca.spec.ts`), que não entra nesta contagem. |
| UC09, UC11, UC31 | `Not planned` | UC11 e UC31 seguem decisões de escopo (D3/D4/D6/D7). Os comentários de UC09 dizem que o fluxo existe e funciona. |
| UC41 | `NA` | Recuperação de senha não existe por decisão (D3). |

## 6. Pendências do próprio relatório

- Horário de início e término da execução.
- Sistema operacional, hardware e rede de cada testador.
- Reexecução dos casos marcados `Not planned` que na verdade não foram refeitos: CT-007.05, CT-008.02, CT-012.04, CT-013.02, CT-014.02. Sem isso os bugs #299, #302 e #306 a #308 não podem ir para "Verificado".
- Abrir as issues com o formulário novo e trocar a coluna "ID" pelo número delas.

## 7. Qualidade dos dados da planilha

- As abas de síntese estão desatualizadas e divergem das abas por caso (a de RC2 ainda traz "V01.01.00-RC1 / 19/11", zeros nas linhas de UC12 a UC28 e UC39 com 6 bloqueados, quando as abas mostram 129 aprovados). Este relatório usa as abas por caso.
- A planilha `(3)` voltou com o texto antigo de CT-038.04, CT-037.01, CT-028.01 a CT-028.04 e CT-036.03, que o plano do rc2 dizia ter reescrito; vale conferir se a versão certa foi a que seguiu para a equipe.
- **Data do rc2 e versão:** a equipe informou 20/11/2026 com a v1.4.1, mas no Git a tag v1.4.1 é de 21/11/2026 (18:37 UTC) e a tela do UC39, que passou no rc2, só foi integrada em 21/11/2026. Confirmar a data ou o build antes de arquivar o relatório.
- `Not planned` está sendo usado com dois sentidos (fora de escopo e não reexecutado). A convenção proposta no plano é `NoRun` para pendente e `Not planned` só para fora de escopo por decisão (UC09, UC11, UC31).

## Apêndice: casos da rodada e resultados

| CT | UC | Tipo | Cenário testado | Resultado esperado | Resultado | Comentário do testador |
|---|---|---|---|---|---|---|
| CT-001.01 | UC01 | Sanity | Pesquisar local pelo nome e selecioná-lo na lista de sugestões | Após o passo 2: o sistema exibe a lista de sugestões contendo o item "Prédio Central (Reitoria)", com a categoria "Prédio administrativo". Após o pas… | **Passed** | — |
| CT-001.02 | UC01 | Limite | Digitar menos de 3 caracteres e depois completar 3 caracteres (limite mínimo da busca) | Após o passo 2: o sistema exibe a mensagem: "Digite ao menos 3 caracteres para ver sugestões." e nenhuma sugestão de local. Após o passo 3 (campo com… | **Failed** | Não apareceu nenhuma sugestão para as bibliotecas, verifiquei o mapa e não tem os pin de biblioteca mais. |
| CT-001.03 | UC01 | Negativo | Pesquisar termo sem nenhum local correspondente | O sistema exibe, na lista de sugestões, a mensagem: "Nenhum resultado encontrado." Nenhum local é sugerido e o mapa permanece como estava. | **Passed** | — |
| CT-001.04 | UC01 | Negativo | Acionar a busca com o campo vazio | Nenhuma lista de sugestões é exibida, nenhum cartão de local é aberto e o mapa mantém a posição e o nível de zoom iniciais. | **Passed** | — |
| CT-001.05 | UC01 | Funcional | Acessar um local pela lista "Últimos acessos" | O mapa é centralizado em "CEAGRI I" e o cartão do local é exibido com o nome "CEAGRI I" e a categoria "Sala de aula". A lista "Últimos acessos:" pass… | **Failed** | 1- Apareceu "Deagri" no mapa, o card está correto \| 2- Não tem mais CEAGRI I na lista de últimos acessos, pesquisei e apareceu a sugestão com o nome correto, porém a página centraliza em um pin "DEAGRI" o CEAGRI I fica… |
| CT-002.01 | UC02 | Sanity | Explorar o mapa, abrir o cartão de um local e acessar a página completa | Após o passo 1: o mapa do campus é exibido com os marcadores dos locais publicados. Após o passo 2: a área visível do mapa se desloca conforme o arra… | **Passed** | — |
| CT-002.02 | UC02 | Funcional | Fechar o cartão de informações do local | Após o passo 1: o cartão do local "Hospital Veterinário" é exibido. Após o passo 2: o cartão é fechado, o endereço da página volta a ser "/" (sem "?l… | **Passed** | — |
| CT-002.03 | UC02 | Negativo | Clicar em área do mapa sem local georreferenciado | Nenhum cartão de informações é aberto, o endereço da página permanece "/" e o usuário continua na navegação livre do mapa. | **Passed** | — |
| CT-003.01 | UC03 | Funcional — positivo | Verificar se o usuário consegue acessar a página de avisos pelo botão correspondente. | O sistema deve direcionar o usuário para a página de avisos, permitindo a visualização dos comunicados disponíveis. | **Passed** | O botão é "Avisos do campus" |
| CT-003.02 | UC03 | Funcional — positivo | Verificar se os avisos são apresentados corretamente após o acesso à página. | A página deve apresentar os comunicados disponíveis e atualizados, permitindo que o usuário visualize e leia seu conteúdo. | **Passed** | A sidebar indica um badge de notificação com 3 novos alertas mas não tem indicação de quais são os novos alertas ou como tirar o badge |
| CT-003.03 | UC03 | Funcional — positivo | Verificar se a data do aviso está sendo exibida | A página de avisos deve exibir as datas de cada aviso | **Passed** | — |
| CT-003.04 | UC03 | Funcional — positivo | Verificar língua disponível para a página | A página de avisos deve trocar o idioma para inglês | **Passed** | — |
| CT-003.05 | UC03 | Funcional — positivo | Verificar língua disponível para a página | A página de avisos deve trocar o idioma para espanhol | **Passed** | — |
| CT-004.01 | UC04 | Funcional — positivo | Verificar se o usuário consegue acessar a página de avisos pelo botão correspondente. | O sistema deve abrir a página do Guia do Calouro, permitindo que o usuário visualize as informações disponíveis. | **Passed** | — |
| CT-004.02 | UC04 | Funcional — positivo | Verificar se todas as seções temáticas previstas no caso de uso estão disponíveis para navegação. | As seções devem estar disponíveis | **Passed** | — |
| CT-004.03 | UC04 | Funcional — positivo | Verificar se a seção "primeira semana no campus" exibe suas informações. | A seção deve exibir suas informações cadastradas | **Passed** | — |
| CT-004.04 | UC04 | Funcional — positivo | Verificar se a seção "calendário, crédiot e notas" exibe suas informações. | A seção deve exibir suas informações cadastradas | **Passed** | — |
| CT-004.05 | UC04 | Funcional — positivo | Verificar se a seção "RU, biblioteca e outros benefícios" exibe suas informações. | A seção deve exibir suas informações cadastradas | **Passed** | — |
| CT-005.01 | UC05 | Sanity | Verificar que ao selecionar "EN" a interface passa a ser exibida em inglês. | O seletor exibe exatamente "PT", "EN" e "ES". Após o clique, "EN" fica destacado (fundo branco) e a interface passa para inglês: o menu lateral exibe… | **Passed** | — |
| CT-005.02 | UC05 | Funcional | Verificar que ao selecionar "ES" a interface passa a ser exibida em espanhol. | "ES" fica destacado e a interface passa para espanhol: o menu lateral exibe "Mapa interactivo", "Avisos del campus" e "Servicios", e a barra de pesqu… | **Passed** | — |
| CT-005.03 | UC05 | Funcional | Verificar que o idioma escolhido é mantido ao navegar entre as telas pelo menu lateral. | A página abre com o título "Services" e a mensagem "Services are published in Portuguese.", e "EN" continua destacado no seletor. | **Passed** | — |
| CT-005.04 | UC05 | Funcional | Verificar que, em outro idioma, a página de avisos informa que os avisos são publicados só em português. | A página abre com o título "Campus notices" e a mensagem "Notices are published in Portuguese."; os avisos continuam em português. | **Passed** | — |
| CT-005.05 | UC05 | Funcional | Verificar que selecionar o idioma já ativo não altera o conteúdo. | A plataforma permanece em Português (menu lateral com "Mapa interativo", "Avisos do campus" e "Serviços"), "PT" continua destacado e não aparece mens… | **Passed** | — |
| CT-006.01 | UC06 | Sanity | Verificar que clicar no marcador exibe o card flutuante do local. | O marcador "RU" fica destacado e o card é exibido com: foto, nome "Restaurante Universitário" e categoria "Alimentação & RU"; indicação "Aberto agora… | **Passed** | — |
| CT-006.02 | UC06 | Funcional | Verificar que o botão do card abre a página completa do local. | A página do "Restaurante Universitário" é exibida com foto, nome, botão "Compartilhar", trajeto a partir do Prédio Central, botões "Traçar rota no ma… | **Passed** | onde fica guardado os locais salvos? |
| CT-006.03 | UC06 | Funcional | Verificar que pesquisar pelo nome exibe o resultado e que clicar nele abre o card do local. | A lista de sugestões exibe "Biblioteca Central" (categoria "Biblioteca & estudo"). Após o clique, o mapa centraliza no marcador e o card da "Bibliote… | **Failed** | Não apareceu a sugestão de biblioteca central |
| CT-006.04 | UC06 | Negativo | Verificar a mensagem exibida ao pesquisar um termo sem correspondência. | A lista de sugestões exibe: "Nenhum resultado encontrado." O usuário permanece no mapa. | **Passed** | — |
| CT-006.05 | UC06 | Funcional | Verificar o estado do mapa ao voltar da página do local. | O mapa volta à visualização inicial do campus, sem card aberto e sem marcador destacado. | **Passed** | — |
| CT-007.01 | UC07 | Funcional (Positivo) | O usuário deseja visualizar o a posição do "Departamento de Computação" no mapa | O sistema exibe uma página com as informações do local: serviços, descrição, opção para traçar rota, entre outras; | **Passed** | — |
| CT-007.02 | UC07 | Funcional (Negativo) | O usuário pesquisa por "Departamento Cpm" na tentativa de encontrar a localização para o "Departamento de Com… | O sistema não apresenta erros críticos; O sistema exibe uma mensagem amigável informando "Nenhum resultado encontrado"; | **Passed** | — |
| CT-007.03 | UC07 | Performance | O usuário deseja visualizar o "Departamento de Computação" em tempo acessível e sem espera | O sistema atende a requisição do usuário em menos de 2 segundos; | **Passed** | — |
| CT-007.04 | UC07 | Volume | O usuário deseja pesquisar por vários locais no mapa | O sistema realiza cada operação sem quebrar; | **Passed** | — |
| CT-007.05 | UC07 | Funcional (Positivo) | O usuário lembra a sigla "DC" relacionada ao "Departamento de Computação" para pesquisar no mapa | O sistema exibe uma página com as informações do local: serviços, descrição, opção para traçar rota, entre outras; | **Not planned** | O sistema não deixa pesquisar apenas por DC, ele manda uma mensagem na barra de busca dizendo: Digite ao menos 3 caracteres para ver sugestões. |
| CT-008.01 | UC08 | Funcional (Positivo) | O usuário deseja saber as informações do curso "Bacharelado em Ciência da Computação" (contato, informações g… | - O sistema exibe a tela com as informações do curso (contatos, grade, carga horária, etc). | **Passed** | — |
| CT-008.02 | UC08 | Funcional (Negativo) | O usuário pesquisa por "Bacharelado em Ciência da Cpm" na tentativa de encontrar informações sobre o curso "B… | O sistema não apresenta erros críticos. O sistema exibe uma mensagem amigável informando "Nenhum curso encontrado". | **Not planned** | A tela em questão não apresenta uma barra de pesquisa |
| CT-008.03 | UC08 | Performance | O usuário deseja visualizar o curso "Bacharelado em Ciência da Computação" em tempo acessível e sem espera | - O sistema atende a requisição do usuário em menos de 3 segundos. | **Passed** | Feitos vários testes de requisição, o sistema atende cerca de 1,40s e 1,60 segundos, sendo um tempo maior que o esperado |
| CT-008.04 | UC08 | Volume | O usuário deseja pesquisar por vários cursos | - O sistema realiza cada operação sem quebrar. | **Passed** | Não foi possível seguir o fluxo descrito, pois a interface não apresenta a opção "Cursos e departamentos" no topo do título da página de informações, conforme especificado no passo 3. |
| CT-008.05 | UC08 | Funcional (Positivo) | O usuário lembra a sigla "DC" relacionada ao departamento de computação para encontrar informações do curso d… | - O sistema exibe a tela com as informações do curso (contatos, localização, etc). | **Passed** | — |
| CT-009.01 | UC09 | — | Acessar conteúdo da cartilha em idioma padrão. | O sistema redireciona o usuário e exibe na tela o texto completo sobre as normas da dinâmica universitária em Português. | **Not planned** | Não existe a opção de interação cultural nesta aba |
| CT-009.02 | UC09 | — | Alternar idioma da cartilha para Inglês. | O sistema atualiza a tela instantaneamente e exibe todos os textos da interface e da cartilha traduzidos para o Inglês. | **Not planned** | Validando RN-02 de suporte multilíngue. (O seletor não fica no rodapé, mas funciona da mesma forma) |
| CT-009.03 | UC09 | — | Alternar idioma da cartilha para Espanhol. | O sistema atualiza a tela instantaneamente e exibe todos os textos da interface e da cartilha traduzidos para o Espanhol. | **Not planned** | Validando RN-02 de suporte multilíngue. (O seletor não fica no rodapé, mas funciona da mesma forma) |
| CT-009.04 | UC09 | — | Acessar seção de Documentos e Editais. | O sistema redireciona para a página correspondente e exibe a lista com as regras de retirada de CPF e editais de mobilidade. | **Not planned** | Verificação do fluxo alternativo FA02. (Esse fluxo ocorre e está implementado) |
| CT-009.05 | UC09 | — | Fallback para Português em conteúdo sem tradução. | A interface e menus são exibidos em Francês, mas o conteúdo textual do "Guia de Recife" é exibido em Português. | **Not planned** | Não existe a opção de idioma em francês |
| CT-010.01 | UC10 | — | Traçar rota via GPS a partir do mapa. | O sistema calcula o trajeto, desenha uma linha indicativa no mapa da posição atual até a Reitoria e exibe a distância. | **Passed** | Teste core de mobilidade. (Essa rota funciona e está bem implementada) |
| CT-010.02 | UC10 | — | Desistir da rota e voltar ao mapa livre. | O sistema fecha os detalhes do local e retorna à visão ampla do mapa interativo. | **Passed** | Verifica a navegação e saída do fluxo (FA02). - Rota bem impelmentada |
| CT-010.03 | UC10 | — | Traçar rota a partir de busca textual. | O sistema seleciona a Biblioteca, calcula a rota e desenha o trajeto no mapa. | **Not planned** | A pagina da biblioteca central e setorial nao existe; Não existe um fluxo de traçar rota direto do card |
| CT-010.04 | UC10 | — | Tratamento de erro com GPS desativado. | Modal: "Sinal de GPS indisponível. Por favor, insira manualmente seu ponto de partida." | **Not planned** | Fluxo de exceção FE01. - Não existe um fluxo de traçar rota direto do card |
| CT-010.05 | UC10 | — | Acessar local via botão de Últimos Acessos. | Localiza o local e desenha a rota. | **Not planned** | Não existe um fluxo de traçar rota direto do card |
| CT-011.01 | UC11 | Sanity | Verificar se o usuário consegue consultar a lista de serviços e visualizar os detalhes de um serviço específi… | O sistema exibe os detalhes do serviço "Empréstimo de Livros", contendo horário de atendimento, descrição, público-alvo e regras de acesso. | **Not planned** | A pagina da biblioteca central e setorial nao existe |
| CT-011.02 | UC11 | Regressão | Verificar se o filtro de busca interno refina a lista de serviços em tempo real. | A lista é filtrada exibindo apenas os serviços correspondentes ao termo "Empréstimo". | **Not planned** | A pagina da biblioteca central e setorial nao existe |
| CT-011.03 | UC11 | Regressão | Verificar o comportamento do sistema ao buscar um serviço que não existe no local. | O sistema não lista nenhum serviço e informa ao usuário que não há resultados para o termo buscado. | **Not planned** | Não achei locais com serviço cadastrado |
| CT-011.04 | UC11 | Regressão | Verificar o retorno para a página do local ao fechar a modal ou clicar em "Voltar" | A tela de detalhes é fechada e o usuário retorna para a página de informações do local. | **Not planned** | A pagina da biblioteca central e setorial nao existe |
| CT-012.01 | UC12 | Sanity | Fazer login com e-mail institucional e senha válidos | O sistema autentica o administrador e o redireciona para o painel (rota /admin), que exibe o título "Olá, Coordenação de TI" e o subtítulo "Painel ad… | **Passed** | — |
| CT-012.02 | UC12 | Negativo | Fazer login com senha incorreta | O usuário permanece na página de login, sem acesso ao painel, e o sistema exibe a mensagem: "Não foi possível realizar o login. Verifique seus dados… | **Passed** | — |
| CT-012.03 | UC12 | Negativo | Fazer login com e-mail institucional não cadastrado | O usuário permanece na página de login, sem acesso ao painel, e o sistema exibe a mensagem: "Não foi possível realizar o login. Verifique seus dados… | **Passed** | — |
| CT-012.04 | UC12 | Negativo | Fazer login com conta em status "aguardando" aprovação | O usuário permanece na página de login, sem acesso ao painel, e o sistema exibe a mensagem: "Seu acesso ainda não foi liberado. Aguarde a aprovação o… | **Not planned** | O outcome Gerado foi Não foi possível realizar o login. Verifique seus dados e tente novamente. |
| CT-012.05 | UC12 | Negativo | Fazer login com e-mail fora do domínio @ufrpe.br | O usuário permanece na página de login, o campo "E-mail institucional" é destacado com borda vermelha e o sistema exibe a mensagem: "O e-mail deve pe… | **Passed** | — |
| CT-013.01 | UC13 | Sanity | Cadastrar administrador com dados válidos (cadastro feito pela Coordenação de TI) | O modal "Cadastrar Novo Administrador" é fechado e o sistema exibe a mensagem: "Maria Souza Lima foi cadastrado e já pode acessar o painel com a senh… | **Passed** | — |
| CT-013.02 | UC13 | Funcional | Cadastrar administrador por administrador geral de outro setor (fica aguardando aprovação) | Após abrir o modal (passo 2): o sistema exibe o aviso: "Cadastros feitos por setores diferentes da Coordenação de TI ficam com status "Aguardando apr… | **Not planned** | O output foi "Carlos Mendes foi cadastrado e já pode acessar o painel com a senha definida no cadastro." |
| CT-013.03 | UC13 | Negativo | Cadastrar administrador com e-mail fora do domínio @ufrpe.br | O sistema impede o cadastro, o modal permanece aberto, o campo "E-mail institucional" é destacado com a indicação "Domínio inválido" e é exibida a me… | **Passed** | — |
| CT-013.04 | UC13 | Negativo | Cadastrar administrador com campo obrigatório em branco (Nome completo) | O sistema impede o cadastro, o modal permanece aberto, o campo "Nome completo" é destacado com a indicação "Obrigatório" e é exibida a mensagem: "Pre… | **Passed** | — |
| CT-013.05 | UC13 | Limite | Cadastrar administrador com senha de 7 caracteres (abaixo do mínimo de 8) | O sistema impede o cadastro, o modal permanece aberto, o campo "Senha" é destacado com a indicação "Mínimo de 8 caracteres" e é exibida a mensagem: "… | **Passed** | — |
| CT-014.01 | UC14 | Sanity | Cadastrar e publicar novo local com os dados obrigatórios e opcionais válidos | Após o passo 13: o sistema retorna à lista "Locais" e exibe a mensagem: ""Laboratório de Informática 2" foi publicado e já aparece no mapa interativo… | **Passed** | — |
| CT-014.02 | UC14 | Funcional | Salvar o cadastro como rascunho e verificar que o local não é exibido ao público | Após o passo 4: o sistema retorna à lista "Locais" e exibe a mensagem: ""Laboratório de Informática 3" foi salvo como rascunho. Ele não aparece no ma… | **Not planned** | O outcome foi nenhum resultado encontrado. |
| CT-014.03 | UC14 | Funcional | Cancelar o cadastro de um novo local | O sistema descarta o cadastro e retorna à lista "Locais" (rota /admin/locais) sem pedir confirmação. "Laboratório de Informática 4" não aparece na li… | **Passed** | — |
| CT-014.04 | UC14 | Negativo | Publicar local com todos os campos obrigatórios em branco | O sistema impede a publicação, o usuário permanece no formulário, os campos "Nome oficial do prédio / local", "Sigla / identificador curto", "Tipo de… | **Passed** | — |
| CT-014.05 | UC14 | Negativo | Publicar local com latitude fora dos limites do campus | O sistema impede a publicação, o usuário permanece no formulário, os campos "Latitude (GPS)" e "Longitude (GPS)" são destacados e é exibida a mensage… | **Passed** | — |
| CT-014.06 | UC14 | Negativo | Enviar fotografia de fachada em formato não suportado (GIF) e acima de 5 MB | Após o passo 1: o sistema exibe, abaixo da área de fotografia, a mensagem: "Formato ou tamanho de imagem inválido. Envie um arquivo JPG ou PNG de até… | **Not planned** | — |
| CT-014.07 | UC14 | Funcional | Ajustar o pin no mapa e atualizar latitude e longitude | Após o passo 3: o modal "Marcar Coordenadas no Mapa" é exibido com o pin na posição -8.01760 / -34.95000. Após o passo 4: o pin se move para o ponto… | **Not planned** | — |
| CT-015.01 | UC15 | Funcional — positivo | Verificar se o administrador consegue editar e salvar as informações de um local existente. | O sistema deve salvar as alterações e atualizar as informações do local. | **Passed** | — |
| CT-015.02 | UC15 | Funcional — persistência de dados | Verificar se as informações editadas permanecem salvas após sair e acessar novamente o local. | Os dados alterados devem permanecer salvos e ser exibidos corretamente após a nova consulta. | **Passed** | — |
| CT-015.03 | UC15 | Funcional — negativo | Verificar se o sistema a edição sem preenchimento de dados obrigatórios | O sistema deve impedir a edição sem o preenchimento dos dados obrigatórios | **Passed** | — |
| CT-015.04 | UC15 | Funcional — positivo | Verificar o cancelamento de uma edição | O sistema deve mantar a informação origianal, não alterar | **Passed** | — |
| CT-015.05 | UC15 | Funcional — positivo | Verificar se a edição de um local permite salvar um rascunho. | O mapa deve deixar de exibir o local que foi salvo como rascunho | **Passed** | — |
| CT-016.01 | UC16 | Funcional — positivo | Verificar se o administrador consegue excluir um local existente. | O sistema deve excluir o local, removê-lo do banco de dados e deixar de exibi-lo no mapa. | **Passed** | — |
| CT-016.02 | UC16 | Funcional — negativo | Verificar se o sistema exige a confirmação antes de excluir definitivamente um local | O sistema deve solicitar confirmação antes da exclusão definitiva. Sem a confirmação, o local não deve ser excluído. | **Passed** | — |
| CT-016.03 | UC16 | Funcional — positivo | Verificar exclusão da lista de locais cadastrados | O sistema deve excluir o local, removê-lo do banco de dados e deixar de exibi-lo na lista de locais | **Passed** | — |
| CT-016.04 | UC16 | Funcional — positivo | Verificar mensagem da exclusão | O sistema deve retornar para a lista de locais e exibir a mensagem que o local foi excluído | **Passed** | — |
| CT-016.05 | UC16 | Regressão | Verificar se a exclusão de um local é refletida corretamente no mapa e não compromete a visualização dos dema… | O local excluído não deve mais aparecer no mapa, e os demais locais devem continuar sendo exibidos e acessados normalmente. | **Passed** | — |
| CT-017.01 | UC17 | Funcional — positivo | Verificar se o administrador consegue criar um aviso preenchendo corretamente os campos obrigatórios. | O sistema deve registrar o aviso, exibir uma mensagem de sucesso e disponibilizar o comunicado conforme as regras de publicação. | **Passed** | — |
| CT-017.02 | UC17 | Funcional — negativo | Verificar se o título do aviso é obrigatório | O sistema deve identificar os dados inválidos, impedir a criação do aviso e permitir que o administrador corrija os campos e tente novamente. | **Passed** | — |
| CT-017.03 | UC17 | Funcional — negativo | Verificar se a descrição do aviso é obrigatório | O sistema deve identificar os dados inválidos, impedir a criação do aviso e permitir que o administrador corrija os campos e tente novamente. | **Passed** | — |
| CT-017.04 | UC17 | Funcional — positivo | Verificar se a data do aviso está certo após sua criação | O sistema deve exibir a data corretamente, do dia atual | **Passed** | — |
| CT-017.05 | UC17 | Funcional — positivo | Verificar ordenação dos avisos | O sistema deve exibir os avisos do mais recente para o mais antigo | **Passed** | — |
| CT-018.01 | UC18 | Sanity | Verificar que o aviso é removido após confirmar a exclusão. | O modal é fechado e o sistema exibe: "Aviso excluído com sucesso!" e "O comunicado institucional foi despublicado e removido do mural oficial do camp… | **Passed** | — |
| CT-018.02 | UC18 | Funcional | Verificar que cancelar a exclusão mantém o aviso cadastrado. | O modal "Confirmar exclusão de aviso" é fechado e o aviso "Atualização dos horários da biblioteca" continua na lista. | **Passed** | — |
| CT-018.03 | UC18 | Funcional | Verificar que o modal de confirmação identifica o aviso selecionado. | O modal "Confirmar exclusão de aviso" é exibido com o selo "Ação irreversível", a pergunta "Tem certeza de que deseja excluir o aviso "Inscrições abe… | **Passed** | — |
| CT-018.04 | UC18 | Funcional | Verificar que o aviso excluído deixa de ser exibido ao estudante. | A lista de avisos do estudante não exibe "Aviso de teste CT-018.04". | **Passed** | O numero que fica ao lado da aba Avisos Campus na visão do estudante não é modificado, está permanecendo no numero 3, mesmo após reiniciar a página |
| CT-018.05 | UC18 | Negativo | Verificar a mensagem exibida quando a exclusão falha. | O modal continua aberto e exibe: "Não foi possível concluir a exclusão. Tente novamente." O aviso não é removido da lista. | **Passed** | — |
| CT-019.01 | UC19 | Sanity | Verificar que o serviço é cadastrado ao preencher todos os campos obrigatórios. | O formulário é fechado e o sistema exibe: "Novo serviço "Auxílio Conectividade & Inclusão Digital" publicado com sucesso!" e "Já visível para os estu… | **Passed** | — |
| CT-019.02 | UC19 | Funcional | Verificar que cancelar o cadastro não cria nenhum serviço. | O formulário "Cadastrar Novo Serviço" é fechado e o serviço "Serviço Teste Cancelado" não aparece na lista. | **Passed** | — |
| CT-019.03 | UC19 | Negativo | Verificar que o cadastro é impedido com "Nome do Serviço" em branco. | O sistema exibe no topo do formulário: "Preencha os campos obrigatórios: Nome do serviço." O campo "Nome do serviço" fica destacado em vermelho com "… | **Passed** | — |
| CT-019.04 | UC19 | Negativo | Verificar que o cadastro é impedido com o formulário totalmente vazio. | O sistema exibe: "Preencha os campos obrigatórios: Categoria do serviço, Nome do serviço, Setor / órgão responsável, Descrição geral, Como solicitar.… | **Passed** | — |
| CT-019.05 | UC19 | Funcional | Verificar que o serviço cadastrado fica imediatamente visível ao estudante. | O serviço "Auxílio Transporte Estudantil" aparece na lista do estudante, sem aprovação adicional. | **Passed** | — |
| CT-020.01 | UC20 | Sanity | Verificar que a alteração de um campo é salva com sucesso. | O formulário é fechado e o sistema exibe: "Serviço "Carteira de Estudante (DCE / UNE)" atualizado com sucesso." O card do serviço passa a exibir, em… | **Passed** | — |
| CT-020.02 | UC20 | Funcional | Verificar que cancelar a edição não salva nenhuma alteração. | O formulário "Editar Serviço" é fechado e o serviço continua com o nome "Carteira de Estudante (DCE / UNE)". | **Passed** | — |
| CT-020.03 | UC20 | Negativo | Verificar que a edição é impedida com "Nome do Serviço" em branco. | O sistema exibe: "Preencha os campos obrigatórios: Nome do serviço." O campo fica destacado em vermelho com "Campo obrigatório." O usuário permanece… | **Passed** | — |
| CT-020.04 | UC20 | Funcional | Verificar que a edição salva é exibida imediatamente ao estudante. | O serviço exibe ao estudante a descrição "Documento oficial de identificação estudantil com meia-entrada em eventos culturais.", sem aprovação adicio… | **Passed** | — |
| CT-020.05 | UC20 | Negativo | Verificar a mensagem exibida quando o salvamento falha. | O sistema exibe no topo do formulário: "Não foi possível salvar o serviço. Tente novamente." O usuário permanece no formulário, com o prazo digitado… | **Passed** | — |
| CT-021.01 | UC21 | Funcional (Negativo) | O administrador tenta deletar o serviço "PAI" que está atrelado à um local | O sistema não apresenta erros críticos. O sistema exibe uma mensagem amigável de erro informando "Este serviço está atrelado à um local". | **NoRun** | A mensagem é um aviso amigavel escrito "Serviço "PAI" excluído. A exclusão fica registrada no histórico de mudanças. E não existe tela dashboard |
| CT-021.02 | UC21 | Funcional (Negativo) | O administrador não deseja deletar o "PAI" | O sistema volta para a tela de "Serviços". | **Passed** | não existe tela dashboard |
| CT-021.03 | UC21 | Funcional (Positivo) | O administrador deseja deletar o serviço "PAI" em um tempo razoável | O sistema atende a requisição do usuário em menos de 1 segundo. | **Passed** | não existe tela dashboard |
| CT-021.04 | UC21 | Volume | O administrador deseja deletar vários serviços | O sistema realiza cada operação sem quebrar e retornando a devida resposta para cada pesquisa. | **NoRun** | não existe tela dashboard |
| CT-021.05 | UC21 | Performance | O administrador deseja deletar o serviço "PAI" que não precisa mais | Exibe uma mensagem dizendo "Serviço deletado com sucesso". O sistema exibe a tela de "Serviços" com o serviço deletado. | **Passed** | não existe tela dashboard |
| CT-023.01 | UC23 | — | Listar histórico de alterações. | Exibe tabela com a lista cronológica. | **Passed** | — |
| CT-023.02 | UC23 | — | Visualizar detalhes. | Modal exibindo "Dados Anteriores" e "Dados Atualizados". | **Passed** | — |
| CT-023.03 | UC23 | — | Desfazer alteração. | Mensagem "Versão restaurada com sucesso" e tabela atualizada. | **Passed** | — |
| CT-023.04 | UC23 | — | Fechar visualização sem restaurar. | Modal fecha, permanece na tabela. | **Passed** | — |
| CT-023.05 | UC23 | — | Consulta vazia. | Tabela vazia com mensagem "Nenhuma modificação registrada". | **Blocked** | Já existem logs e apesar de ter como deletar os logs não somem, eles aparecem como "deletado" |
| CT-024.01 | UC24 | — | Logout sucesso. | Redireciona para tela de login público. | **Passed** | — |
| CT-024.02 | UC24 | — | Cancelar logout. | Modal desaparece, continua logado. | **Passed** | — |
| CT-024.03 | UC24 | — | Confirmar descarte e logout. | Descarta edições, redireciona ao login. | **Passed** | — |
| CT-024.04 | UC24 | — | Cancelar descarte. | Permanece no formulário intacto. | **Passed** | — |
| CT-024.05 | UC24 | — | Bloquear retorno via cache. | Sistema exibe: "Sessão expirada. Faça login novamente." | **Passed** | — |
| CT-025.01 | UC25 | — | Criação do zero. | Banner "Cardápio criado", listado na tabela. | **Passed** | . |
| CT-025.02 | UC25 | — | Cancelar criação. | Retorna à listagem sem salvar. | **Passed** | . |
| CT-025.03 | UC25 | — | Duplicar cardápio. | Salva a cópia com sucesso. | **Failed** | O botão duplicar não duplica o cardapio, está agindo igual o botão de criação |
| CT-025.04 | UC25 | — | Salvar sem Data obrigatória. | Exibe erro: "O preenchimento da Data é obrigatório". | **Passed** | — |
| CT-025.05 | UC25 | — | Impedir duplicado. | Exibe: "Já existe um cardápio registrado. Deseja editar?". | **Passed** | Impede o cadastro duplicado, mas não oferece o botão editar, mas como continua na mesma tela tem como fazer a edição, estão o "deseja editar?" é desnecessario |
| CT-026.01 | UC26 | Sanity | Verificar se o administrador consegue editar com sucesso as informações de um cardápio existente. | O sistema valida os dados, salva as alterações no banco de dados, registra o log de mudança [UC23] e exibe a mensagem "Cardápio atualizado com sucess… | **Passed** | — |
| CT-026.02 | UC26 | Regressão | Verificar impedimento de salvar edições quando campos obrigatórios são apagados. | O sistema impede o salvamento e exibe mensagem de alerta informando os campos obrigatórios não preenchidos. | **Passed** | — |
| CT-026.03 | UC26 | Regressão | Verificar o cancelamento da edição e o descarte das alterações feitas pelo administrador. | O sistema descarta as alterações realizadas e retorna para a lista de cardápios sem modificar os dados originais. | **Passed** | — |
| CT-026.04 | UC26 | Regressão | Verificar o comportamento do sistema ao tentar salvar alterações com a sessão expirada. | O sistema redireciona o usuário para a tela de login [UC12], exibindo a mensagem: "Sua sessão expirou. Faça login novamente para continuar". | **Passed** | — |
| CT-027.01 | UC27 | Sanity | Verificar se o administrador consegue excluir um cardápio cadastrado com confirmação explícita. | O registro é removido do banco de dados, a ação é gravada no log de auditoria [UC23] e o sistema exibe a mensagem de confirmação de exclusão com suce… | **Passed** | — |
| CT-027.02 | UC27 | Regressão | Verificar se o sistema cancela a exclusão e mantém o cardápio inalterado ao clicar em "Cancelar". | O modal é fechado sem realizar alterações e o cardápio permanece cadastrado e visível na lista. | **Passed** | — |
| CT-027.03 | UC27 | Regressão | Verificar o comportamento do sistema ao ocorrer uma falha durante a tentativa de remoção no banco de dados. | O sistema exibe mensagem de erro informando que não foi possível excluir o cardápio e o registro permanece inalterado. | **Passed** | — |
| CT-027.04 | UC27 | Regressão | Verificar se o sistema impede a exclusão por usuários não autorizados ou com sessão expirada. | O sistema invalida a ação, impede a remoção, exibe mensagem informativa de erro/permissão e redireciona para a tela de login [UC12]. | **Passed** | — |
| CT-028.01 | UC28 | Sanity | Verificar se o administrador consegue adicionar uma nova informação detalhada a um local com sucesso. | Os campos são validados, a nova informação é salva e associada ao local, o log de mudanças é gerado [UC23] e o sistema exibe mensagem de sucesso conf… | **Failed** | Não existe o botão "Adicionar informação", tem como editar de maneira geral dados dos predios, mas não é a mesma funconalidade proposta . rc2: Foi adicionado um botão de "editar descriação" que tem a mesma funcionalidad… |
| CT-028.02 | UC28 | Regressão | Verificar o impedimento de salvar a informação quando os campos obrigatórios não são preenchidos. | O sistema impede o salvamento, destaca os campos obrigatórios pendentes e exibe mensagem de alerta ao usuário. | **Blocked** | Não existe o botão "Adicionar informação", tem como editar de maneira geral dados dos predios, mas não é a mesma funconalidade proposta |
| CT-028.03 | UC28 | Regressão | Verificar se o sistema descarta os dados e cancela a adição ao clicar em "Cancelar". | O sistema descarta os dados digitados e retorna para a página de gerenciamento do local sem salvar nada. | **Blocked** | Não existe o botão "Adicionar informação", tem como editar de maneira geral dados dos predios, mas não é a mesma funconalidade proposta |
| CT-028.04 | UC28 | Regressão | Verificar se o sistema bloqueia a ação e redireciona para o login quando a sessão expira. | O sistema invalida o envio, redireciona para a tela de login [UC12] e exibe mensagem informando que a sessão expirou ou permissão negada. | **Blocked** | Não existe o botão "Adicionar informação", tem como editar de maneira geral dados dos predios, mas não é a mesma funconalidade proposta |
| CT-031.01 | UC31 | Sanity | Verificar se o usuário consegue visualizar os canais de contato vinculados ao local selecionado. | O sistema exibe a lista de contatos vinculados ao local (telefones, e-mails, ramais, etc.) em uma janela/aba dedicada. | **Not planned** | — |
| CT-031.02 | UC31 | Regressão | Verificar se o clique em um e-mail ou número de telefone aciona o aplicativo padrão do dispositivo. | O sistema aciona o aplicativo padrão do dispositivo (como discador telefônico ou cliente de e-mail) para realizar a interação. | **Not planned** | — |
| CT-031.03 | UC31 | Regressão | Verificar o retorno para a página de informações do local ao fechar a janela de contatos. | A janela de contatos é fechada e o usuário retorna para a página de informações do local [UC04]. | **Not planned** | — |
| CT-031.04 | UC31 | Regressão | Verificar a mensagem exibida ao tentar consultar contatos de um local sem registros de contato. | O sistema exibe uma mensagem informando que não existem dados de contato cadastrados para o local selecionado. | **Not planned** | — |
| CT-035.01 | UC35 | Sanity | Verificar se o administrador consegue acessar o Modo de Edição do curso. | A tela entra em modo de edição, exibindo os campos de Dados Gerais, Coordenação e Matriz Curricular editáveis. | **Passed** | — |
| CT-035.02 | UC35 | Funcional | Verificar se o administrador consegue editar os Dados Gerais do curso e salvar as alterações. | As alterações são salvas com sucesso e refletidas imediatamente na página pública do curso e do departamento vinculado. | **Passed** | — |
| CT-035.03 | UC35 | Funcional | Verificar se o administrador consegue adicionar uma nova disciplina na Matriz Curricular. | A nova disciplina é adicionada à grade curricular do curso e salva com sucesso. | **Passed** | — |
| CT-035.04 | UC35 | Funcional | Verificar se o administrador consegue cancelar a edição sem salvar. | A tela retorna à visualização normal (não editável) do curso, sem salvar nenhuma alteração. | **Passed** | — |
| CT-035.05 | UC35 | Exceção | Verificar o comportamento do sistema ao tentar salvar com um campo obrigatório vazio. | O sistema exibe uma mensagem de erro indicando o campo obrigatório vazio e não salva as alterações. | **Passed** | — |
| CT-036.01 | UC36 | Sanity | Verificar se o administrador consegue excluir um curso com sucesso. | O curso e todas as informações associadas (coordenação e matriz curricular) são removidos permanentemente e deixam de ser exibidos na página do depar… | **Passed** | — |
| CT-036.02 | UC36 | Funcional | Verificar se o administrador consegue cancelar a exclusão do curso. | O modal é fechado e o sistema retorna ao Modo de Edição do curso, sem nenhuma alteração. | **Passed** | — |
| CT-036.03 | UC36 | Exceção | Verificar o comportamento do sistema quando a exclusão do curso falha. | O sistema exibe uma mensagem de erro informando que a exclusão não pôde ser concluída e mantém o curso inalterado. | **NoRun** | — |
| CT-037.01 | UC37 | Sanity | Verificar se o usuário consegue visualizar os cursos vinculados a um departamento. | A seção exibe o total de "Programas Oferecidos" e os cartões de cada curso, com nível, conceito/avaliação, modalidade, turno e duração. | **Blocked** | opção do menu de cursos e departamentos após clicar no pin do mapa não aparece |
| CT-037.02 | UC37 | Funcional | Verificar se o usuário consegue visualizar a matriz curricular de um curso específico. | A matriz curricular do curso selecionado é exibida corretamente. | **Passed** | — |
| CT-037.03 | UC37 | Funcional | Verificar se o usuário consegue consultar as Coordenações de Curso do departamento. | O painel exibe nome, ramal e e-mail do coordenador de cada curso vinculado ao departamento. | **Passed** | — |
| CT-037.04 | UC37 | Exceção | Verificar o comportamento do sistema quando um departamento não possui cursos vinculados. | O sistema exibe a mensagem "Nenhum curso vinculado a este departamento" no lugar da listagem. | **Passed** | — |
| CT-038.01 | UC38 | Sanity | Verificar se o sistema exibe sugestões de busca ao digitar um termo. | A lista suspensa de sugestões é exibida com os resultados correspondentes ao termo digitado. | **Passed** | — |
| CT-038.02 | UC38 | Funcional | Verificar se o usuário consegue selecionar uma sugestão e visualizar o local no mapa. | O local escolhido é destacado no mapa interativo e a página completa do local é exibida. | **Passed** | — |
| CT-038.03 | UC38 | Funcional | Verificar se o atalho de teclado (⌘K) foca o campo de busca. | O campo de busca é focado diretamente, pronto para receber o termo digitado. | **NoRun** | — |
| CT-038.04 | UC38 | Funcional | Verificar se o ícone de localização (GPS) centraliza o mapa na posição do usuário. | O sistema centraliza o mapa na posição atual do usuário, sem exibir sugestões de busca. | **Failed** | Não funciona |
| CT-038.05 | UC38 | Exceção | Verificar o comportamento do sistema quando nenhum resultado é encontrado. | O sistema exibe a mensagem "Nenhum resultado encontrado" no lugar da lista de sugestões. | **Passed** | — |
| CT-039.01 | UC39 | Funcional (Positivo) | O usuário deseja enviar uma mensagem de dúvida sobre problema de performance no sistema para a equipe, inform… | Exibe a mensagem "Mensagem enviada" e o agradecimento. O formulário não mostra mais os campos preenchidos (o botão "Enviar outra mensagem" abre o for… | **Passed** | Não encontrei onde falar com a equipe. |
| CT-039.02 | UC39 | Funcional (Negativo) | O usuário tenta enviar sem escrever a mensagem (nome e contato preenchidos ou não) | O sistema não apresenta erros críticos e não envia nada. O sistema exibe a mensagem amigável "Escreva a mensagem antes de enviar." junto ao campo "Me… | **Passed** | Não encontrei onde falar com a equipe. |
| CT-039.03 | UC39 | Funcional (Positivo) | O usuário deseja enviar uma mensagem de dúvida para a equipe passando o e-mail ao invés do telefone | Exibe a mensagem "Mensagem enviada". | **Passed** | Não encontrei onde falar com a equipe. |
| CT-039.04 | UC39 | Funcional (Negativo) | O usuário envia uma mensagem com o campo "Telefone ou e-mail (opcional)" em formato inválido (ex.: "joao@", "… | O sistema não apresenta erros críticos e não envia nada. O sistema exibe a mensagem "Preencha o campo de telefone ou e-mail corretamente, ou deixe-o… | **Passed** | Não encontrei onde falar com a equipe. |
| CT-039.05 | UC39 | Performance | O usuário deseja enviar uma mensagem de dúvida para a equipe em tempo razoável | O sistema atende a requisição do usuário em tempo curto (o botão mostra "Enviando..." e logo aparece "Mensagem enviada"). | **Passed** | Não encontrei onde falar com a equipe. |
| CT-039.06 | UC39 | Volume | O usuário deseja enviar várias mensagens de dúvida para a equipe | O sistema atende cada requisição em tempo curto e exibe "Mensagem enviada" nas 3 vezes. As 3 mensagens aparecem no painel em "Mensagens recebidas". | **Passed** | Não encontrei onde falar com a equipe. |
| CT-039.07 | UC39 | Funcional (Positivo) | O usuário deseja enviar uma mensagem sem informar nome nem contato (os dois campos são opcionais) | Exibe a mensagem "Mensagem enviada". No painel, a mensagem aparece como "Anônimo" e "Sem contato". | **Passed** | — |
| CT-039.08 | UC39 | Funcional (Positivo) | O administrador deseja ver as mensagens enviadas pelos visitantes | A lista mostra as mensagens da mais recente para a mais antiga. Cada mensagem mostra nome (ou "Anônimo"), contato (ou "Sem contato"), data e hora e o… | **Passed** | — |
| CT-039.09 | UC39 | Funcional (Positivo) | O administrador marca uma mensagem como lida e depois como não lida, e filtra as não lidas | Ao marcar como lida, o selo "Nova" some, o botão vira "Marcar como não lida" e o contador de não lidas diminui. O filtro "Não lidas" não lista a mens… | **Passed** | — |
| CT-039.10 | UC39 | Funcional (Negativo) | Um administrador somente leitura consulta as mensagens, mas não pode alterá-las | A lista das mensagens é exibida normalmente. Os botões "Marcar como lida" / "Marcar como não lida" não aparecem. | **Passed** | — |
| CT-039.11 | UC39 | Volume | O visitante envia mensagens em excesso em pouco tempo (limite de 20 mensagens a cada 10 minutos, somando todo… | O sistema não apresenta erros críticos. Acima do limite, exibe a mensagem "Muitas mensagens em pouco tempo. Tente novamente em alguns minutos." e não… | **Passed** | — |
| CT-039.12 | UC39 | Funcional (Positivo) | O administrador não vê mensagens com mais de 15 dias (retenção) | Somente a mensagem com 15 dias ou menos aparece na lista. A mensagem vencida foi apagada do banco e não volta a aparecer. O formulário público inform… | **NoRun** | — |
| CT-040.01 | UC40 | Sanity | Verificar se o usuário consegue acessar o Guia de Recife a partir do mapa. | A tela do Guia de Recife é aberta, exibindo as categorias de pontos turísticos e serviços da cidade. | **Passed** | — |
| CT-040.02 | UC40 | Funcional | Verificar se o usuário consegue filtrar os locais por categoria. | A lista é filtrada e exibe apenas os locais pertencentes à categoria selecionada. | **Passed** | — |
| CT-040.03 | UC40 | Funcional | Verificar se o usuário consegue visualizar os detalhes de um local do guia. | O cartão de cada local exibe a descrição e o endereço; o horário de funcionamento aparece nos locais que o possuem. | **Passed** | Acredito que não foi implementado a filtragem |
| CT-040.04 | UC40 | Exceção | Verificar o comportamento do sistema quando o conteúdo do guia não pode ser carregado. | O sistema exibe "Não foi possível carregar o guia" e "Verifique sua conexão e tente novamente", com o botão "Tentar novamente"; ao reconectar e clica… | **Passed** | Acredito que não foi implementado a filtragem |
| CT-041.01 | UC41 | Funcional (Positivo) | O administrador deseja recuperar sua senha esquecida | O sistema exibe uma mensagem dizendo que a senha foi alterada com sucess. | **NA** | — |
| CT-041.02 | UC41 | Funcional (Negativo) | O administrador deseja recuperar sua senha esquecida, mas não está cadastrado no sistema | O sistema não apresenta erros críticos. O sistema exibe uma mensagem amigável informando que a operação não é possível pois ele não está cadastrado. | **NA** | — |
| CT-041.03 | UC41 | Funcional (Negativo) | O administrador deseja recuperar sua senha esquecida, mas deixou o campo "E-mail cadastrado" nulo | O sistema não apresenta erros críticos. O sistema exibe uma mensagem amigável informando que a operação não é possível pois ele não está cadastrado. | **NA** | — |
| CT-041.04 | UC41 | Funcional (Negativo) | O administrador deseja recuperar sua senha esquecida, mas deixou o campo "Nova Senha" nulo | O sistema não apresenta erros críticos. O sistema exibe uma mensagem amigável informando que a operação não é possível pois ele não está cadastrado. | **NA** | — |
| CT-041.05 | UC41 | Performance | O administrador deseja receber o link de mudança de senha em tempo razoável | O sistema envia o e-mail em tempo razoável. | **NA** | — |
