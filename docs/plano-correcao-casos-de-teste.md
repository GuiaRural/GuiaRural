# Plano de correção dos casos de teste reprovados (rc1)

Fonte: `docs/Casos_de_Teste_Geral_GuiaRural (1).xlsx` (coluna "01.xx.00-rc1"; a coluna rc2 ainda não foi executada).
Cada caso foi cruzado com o código em 20/11/2026. Só li o código: **nada foi executado nem aberto no navegador**, então os diagnósticos marcados "a confirmar" dependem de reproduzir o caso.

## 1. Resumo

Decisões do time em 20/11/2026: (1) o botão amarelo da busca deve **abrir o traçado de rota**; (2) o UC28 vira **edição da descrição do local**; (3) o filtro por categoria do Guia de Recife **entra**; (4) a busca **aceita sigla de 2 letras**; (5) o marcador do mapa **mantém a sigla**.

Há 14 casos `Failed` e 9 `Blocked` em 13 casos de uso. Eles não são todos bug de código:

| Tipo | Casos | O que fazer |
|---|---|---|
| **A. Defeito ou lacuna no código** | CT-007.05, CT-038.04, CT-037.01, CT-008.02, CT-008.04, CT-025.03, CT-008.03 | Corrigir (etapas 2 a 4) |
| **B. Funcionalidade que não existe** | CT-028.01 a 028.04 (UC28), CT-040.02 a 040.04 (UC40) | Implementar (etapas 5 e 6) e reescrever os casos do UC28 (etapa 1) |
| **C. Teste ou dados divergem do sistema** | CT-001.05, CT-006.01, CT-006.02, CT-012.04, CT-013.02, CT-014.02, CT-023.05, CT-036.03 | Conferir dados, reexecutar e ajustar o caso (etapa 1) |

Também fora dos "falhos": UC09, UC10, UC11, UC31, UC39 e UC41 estão como "Not planned/Not Implement". Os comentários de UC09 e UC10 dizem que funcionam, então o status deve virar `Passed` na rc2. UC11, UC31, UC39 e UC41 seguem decisões já registradas (D3/D4/D6/D7) e não entram aqui.

## 2. Diagnóstico por caso

### A. Código

| CT | Observação do testador | Causa | Correção |
|---|---|---|---|
| **007.05** | Buscar "DC" mostra "Digite ao menos 3 caracteres" | `MIN_SEARCH_CHARS = 3` (`services/placesService.ts:143`, usado em `SearchBar.tsx:63,120`), por RN-01.03. A sigla `DC` tem 2 letras. Conflita com CT-001.02 (que passou, com "Bi") | Manter 3 como regra geral, mas aceitar 2 caracteres quando o termo for **igual a uma sigla** (`shortName`) de local publicado (aprovado; altera a RN-01.03, que deve ser atualizada na especificação do UC01) |
| **038.04** | Botão amarelo "não funciona" | O botão em `SearchBar.tsx:186` (amarelo, `aria-label` `t.search.myLocation`) não tem `onClick`. O caso CT-038.04 descreve "centralizar no GPS", mas a decisão do time é que ele **abra o traçado de rota** (UC10). Hoje a rota só nasce na página do local (`locais/[id]/page.tsx:65`, `traceRoute`), que já pede o GPS e, se negado ou fora do campus, pede a origem manual (`t.route.chooseOrigin`, portarias e prédios) | Ligar o botão a um painel de rota na Home: escolher o **destino** (busca de locais) e a **origem** (GPS por padrão; manual como no fluxo existente) e, ao confirmar, ir para `/?rota=<destino>&origem=<id ou gps:lat,lng>`, que o `MapExplorer` já entende. Reaproveitar a lógica de origem da página do local num componente compartilhado em `components/map`, sem duplicar. Rótulo e `aria-label` deixam de ser "Minha localização" e viram algo como "Traçar rota" (PT/EN/ES). Nada sai do navegador (RNF04). **Reescrever o CT-038.04** (e conferir o UC10) para esse comportamento |
| **037.01** | Depois de clicar no pin do mapa, não aparece o menu "Cursos e departamentos" | O cartão e a página do local (`PlaceCard.tsx`, `locais/[id]/page.tsx:187`) listam os cursos, mas não há link para o departamento. A página do departamento existe (`/departamentos/[id]`) | Mostrar no local o link para o departamento (e para cada curso). **A confirmar:** se `PlaceDto` já traz o id do departamento; senão, acrescentar no DTO do backend |
| **008.04** | Falta "Cursos e departamentos" no topo da página do curso | `cursos/[id]/page.tsx:26` volta só para o departamento (`backToDepartment`) | Trocar por trilha "Cursos e departamentos › Departamento › Curso" |
| **008.02** | `/cursos` não tem barra de pesquisa | `cursos/page.tsx` só lista departamentos. A busca por curso existe apenas na busca do mapa (UC38). O texto do caso também está inconsistente: cenário "…Cpm" e passo "dasdegvvfxc" | Campo de filtro em `/cursos` (cursos e departamentos, no cliente, com `getCourses`/`getDepartments` já existentes) e mensagem "Nenhum curso encontrado" (dicionário PT/EN/ES). Corrigir o texto do caso |
| **025.03** | "Duplicar" age igual ao botão de criação | O botão leva a `/admin/cardapio/novo?base=<id>`, que pré-preenche e deixa a data em branco (FA02). Funciona, mas a tela não diz que é uma duplicação | Título "Duplicar cardápio de <data/turno>", aviso "altere a data" e texto do botão de salvar adequado. **A confirmar com o testador** se esperava cópia direta |
| **008.03** | 1,4 a 1,6 s contra meta de < 1 s | O backend faz poucas consultas (`CourseService.findByDepartment`), então o tempo deve vir de Vercel → rewrite → Render → Supabase em regiões diferentes e/ou cold start. **Não medi** | Medir antes (DevTools: TTFB de `/api/departments/{id}/courses` e `/api/courses/{id}`); depois cache HTTP ou cache no `coursesService`, e região de Render/Supabase |

### B. Funcionalidade inexistente

- **UC28 (028.01 a 028.04):** o caso espera um botão "Adicionar Informação" com título, categoria e descrição, que não existe. Decisão do time: o UC28 passa a ser a **edição da descrição do local**. Hoje a descrição só se edita dentro do formulário completo (`PlaceForm.tsx`, via `PUT /api/admin/places/{slug}`), sem ação própria. Como o backend já valida, audita e restringe a `geral`/`editor`, a princípio **não precisa de tabela nem migration**: o trabalho é uma ação dedicada no painel e reescrever os 4 casos (sem título nem categoria).
- **UC40 (040.02 a 040.04):** o Guia de Recife (`RecifeGuideView.tsx`) lista todos os lugares, sem filtro nem estado vazio. O filtro **entra**. O dado já tem `tag` por lugar (`guide_spots.tag_label_pt/en/es`, exposto como `GuideSpot.tag`, que pode ser nulo), então dá para filtrar por ela sem migration, no cliente. Falta conferir se os rótulos atuais servem como categorias (ex.: "Pontos Turísticos", como no caso); se não, ajustar os dados por migration (com autorização). Lugares sem `tag` caem em "Outros". Os detalhes do lugar (CT-040.03) já aparecem no cartão (`details`); só reexecutar.

### C. Teste ou dados

- **001.05 / 006.01 / 006.02:** o marcador exibe a **sigla** de propósito (`MapExplorer.tsx:79`, `label: p.shortName`), por isso "RU". "Deagri" é outro local publicado (`deagri`, ~300 m de `ceagri-1`), não um erro de rótulo. O próprio testador diz que o cartão está correto. Ajustar o resultado esperado para citar o rótulo do marcador. Em 006.02, a pergunta "onde ficam os locais salvos" é dúvida: ficam no `localStorage` (`guiarural.savedPlaces`).
- **012.04:** o código já trata a conta "aguardando" (`AuthService.java:58` devolve `blocked`; `login/page.tsx:14` tem o texto esperado; coberto em `AuthServiceTest`). A mensagem genérica só aparece quando **a senha não confere**, pois o bloqueio só é revelado a quem acertou a senha. Provável causa: o hash inserido à mão para `novo.admin@ufrpe.br` não corresponde a `Guia@2026`. Verificar a linha em `admins` (status e hash) e reexecutar.
- **013.02:** a regra existe (`AdminService.java:64`: só a Coordenação de TI cria como `ativo`). Receber "já pode acessar" indica que a conta usada tinha setor "Coordenação de TI" (login errado ou `biblioteca.geral@ufrpe.br` cadastrada com esse setor). Conferir e reexecutar.
- **014.02:** o resultado descrito ("nenhum resultado encontrado") é o **esperado** do passo 7, e a mensagem do passo 4 existe (`PlaceForm.tsx:288`). Não dá para saber qual passo falhou. Reexecutar anotando o passo.
- **023.05:** o histórico é imutável de propósito; "deletado" é a ação auditada, não a exclusão do log. A tabela só fica vazia num banco novo. Mudar o caso para um filtro sem resultado (mensagem "Nenhuma modificação registrada para este filtro.", `historico/page.tsx:241`) ou rodar num ambiente limpo.
- **036.03:** "simular falha de conexão" não é executável à mão. Cobrir com teste automatizado (backend ou frontend simulando erro) e verificar se a tela exibe o erro e mantém o curso.
- **Síntese da planilha:** erros de digitação (`` `1 `` em UC01, UC03 com 5 passados e 4 bloqueados num total de 5). Corrigir ao fechar a rc2.

## 3. Etapas

Convenção do projeto (CLAUDE.md §14): `git pull` na `dev`, um branch por etapa, commits pequenos `tipo(escopo): descrição`, PR para `dev` com merge commit. Antes de cada commit: `npx tsc --noEmit && npx eslint src && npm run build`; `./mvnw test` quando tocar o backend.

**Etapa 0: decisões (resolvidas em 20/11/2026)**
1. Botão amarelo da busca abre o traçado de rota.
2. UC28 = edição da descrição do local.
3. Filtro por categoria do Guia de Recife entra.
4. Busca aceita sigla de 2 letras.
5. Marcador do mapa mantém a sigla.

Em aberto, sem bloquear: confirmar com o testador do CT-025.03 se esperava cópia direta; ler a especificação do UC40 (`docs/[UC40] Consultar guia de Recife (1).docx` e os `.jpg`) para alinhar os nomes das categorias.

**Etapa 1: dados e casos de teste** (sem alterar o produto)
- Conferir as contas de `Massa de Dados` no banco e reexecutar 012.04, 013.02 e 014.02, anotando o passo que falha.
- Reescrever 001.05, 006.01/02, 008.02, 023.05, 038.04 (agora é traçar rota) e 028.01 a 028.04 (agora é editar a descrição: abrir a edição, descrição vazia bloqueia, Cancelar com confirmação, sessão expirada leva ao login, log gerado); transformar 036.03 em teste automatizado.
- Atualizar a especificação do UC01 (RN-01.03: 3 caracteres, ou 2 se for sigla).
- Remarcar UC09/UC10 e corrigir a síntese.
- Pronto quando: cada caso do grupo C tiver resultado conclusivo (bug confirmado ou caso corrigido).

**Etapa 2: correções pequenas, só frontend** (branch `fix/casos-teste-navegacao-cursos`)
- 025.03 Duplicar cardápio mais claro.
- 008.04 trilha "Cursos e departamentos" na página do curso.
- 037.01 link do local para o departamento (e, se faltar o id no DTO, ajuste no backend).
- 008.02 campo de filtro em `/cursos`.
- Textos novos em PT/EN/ES em `i18n/dictionaries.ts` (EN/ES com revisão humana).

**Etapa 3: busca por sigla e traçado de rota pela busca** (branch `fix/busca-sigla-rota`)
- 007.05: regra da sigla em `searchPlaces`, `SearchBar` e `minChars` ("DC" deve sugerir `CEAGRI II / DC`); manter o CT-001.02 passando ("Bi" continua pedindo 3 caracteres, pois não é sigla).
- 038.04: o botão amarelo abre o painel de rota (destino + origem), reusando a lógica de `traceRoute` e de origem manual num componente compartilhado; teclado e `aria-label` (RNF05); textos em PT/EN/ES; atualizar o CLAUDE.md §12 (a linha "GPS no botão da busca (FA-38.02)" muda).
- Pronto quando: pela Home, sem abrir a página do local, dá para escolher destino e origem (GPS; negado ou fora do campus caem na origem manual) e a rota aparece no mapa.

**Etapa 4: desempenho de cursos** (branch `perf/cursos`)
- Medir (antes e depois) com a mesma massa de dados; só então escolher cache ou ajuste de região. Meta do caso: < 1 s.
- Critério honesto: se o limite for do hospedagem gratuita (cold start), registrar na planilha em vez de forçar código.

**Etapa 5: Guia de Recife, filtro por categoria** (branch `feat/recife-filtro-categoria`)
- Chips de categoria a partir de `spot.tag` em `RecifeGuideView.tsx`, com "Todas" e "Outros" (lugares sem tag), filtro no cliente e a mensagem "Nenhum local encontrado nesta categoria" (dicionário PT/EN/ES). Teclado e `aria-pressed`.
- Só se os rótulos atuais não servirem: migration com `supabase migration new` (RLS sem policies), aplicada apenas com autorização; EN/ES de dado novo precisa de revisão humana.
- Pronto quando: CT-040.02 a 040.04 passam, inclusive categoria vazia.

**Etapa 6: UC28, editar a descrição do local** (branch `feat/uc28-editar-descricao`)
- Ação dedicada "Editar descrição" na gestão de locais (`/admin/locais`), abrindo um modal só com a descrição e reaproveitando `PUT /api/admin/places/{slug}` (o backend já valida, exige `geral` ou `editor` e grava o histórico, RNF06). Sem migration nem endpoint novo, a menos que o `PUT` exija o payload completo e seja preciso um `PATCH` só da descrição (a confirmar ao ler `PlaceService`).
- Descrição vazia bloqueada com o campo destacado; Cancelar com confirmação; sessão expirada leva ao login (conferir o comportamento atual de `lib/api.ts`).
- Edição de EN/ES não muda: o painel edita só PT e já avisa que a tradução pode defasar (D18).
- Pronto quando: os 4 casos reescritos na Etapa 1 passam e o histórico (UC23) registra a alteração, com desfazer.

**Etapa 7: rc2**
- Reexecutar todos os casos desta lista e a regressão de UC01, UC06, UC07, UC08, UC12 a UC14, UC25, UC37 e UC38.
- Atualizar a planilha, e o CLAUDE.md §12 se algo do "ainda não existe" mudou.

## 4. Ordem e dependências

Etapa 1 (em paralelo com a 2) → 3 → 4. As etapas 5 e 6 são independentes entre si e das demais. Etapas 2, 3 e 4 mexem em arquivos diferentes (`cursos`/`cardapio`, `SearchBar`/`placesService`, serviços de cursos), então não precisam de ordem de merge, exceto se a Etapa 2 alterar o `PlaceDto` (nesse caso ela vai antes de qualquer PR que leia esse DTO).
