# Plano: integração completa com o banco

> Objetivo: tirar do mock tudo o que ainda não vem do PostgreSQL (via backend) e fechar as lacunas de API, tela e dados.
> Base do levantamento: branch `dev` no commit `c58cf7b` (10/11/2026), lendo o código. **Nada aqui foi executado**: o banco não foi consultado (o Supabase CLI não está vinculado nesta máquina) e o app não foi aberto.
> Regras do projeto que valem para tudo: `CLAUDE.md` (escopo da seção 2, segurança da seção 9, commits da seção 14). Em conflito, `CLAUDE.md` e os documentos de Visão/Arquitetura valem mais que este plano.
> Este plano fica em `docs/`, junto de `plano-implementacao-home.md`. Atualize-o (e a seção 12 do `CLAUDE.md`) ao fechar cada fase.

## Como usar com o time
1. Confira a **seção 2**: todas as decisões estão fechadas (as respostas às perguntas de 10/11/2026 estão em 2.1). Se algo mudar, atualize a tabela antes de implementar.
2. Pegue uma tarefa da seção 4, crie o branch a partir da `dev` atualizada (`git pull` antes) e siga o **checklist comum** (seção 3).
3. Backend e frontend de uma mesma fase podem andar em paralelo se o **contrato de API** da fase for combinado antes (cada fase traz o rascunho).
4. Estimativas: **P** ≈ até 1 dia, **M** ≈ 2 a 3 dias, **G** ≈ 4 dias ou mais. São palpites para ordenar, não compromisso.

## 1. Estado de partida

**Já integrado ao banco:** mapa e busca, página do local, departamentos e cursos (leitura), guia de acolhimento e Guia de Recife, avisos, serviços, cardápio do RU, login/sessão do painel, histórico (leitura) e desfazer de acolhimento.

**Ainda falta:**

| # | Lacuna | Onde está hoje |
|---|---|---|
| A | CRUD de **locais** no painel (UC14 a UC16) | `frontend/.../services/placesService.ts` (parte admin) sobre `data/mockPlaces.ts`; `PlaceController` só tem `GET` |
| B | **Administradores** (UC13) com senha definida por quem cadastra | `services/adminsService.ts` + `data/mockAdmins.ts` (inclui senhas de exemplo); backend só tem login/`me`/logout |
| C | **Histórico completo e desfazer** (UC23) | `auditService.ts` mistura servidor e memória; só `ACOLHIMENTO` tem `AuditRestorer` |
| D | **Contatos** (responsável/coordenador) | `/api/contacts` e `/api/messages` existem sem uso no frontend. Decisão D7: contato vira elemento de local e curso, sem tela própria |
| E | **Cursos**: só leitura | `CourseController`/`DepartmentController` só têm `GET`; UC35/UC36 e cadastro não existem; não há cursos no banco |
| F | **Tradução** de locais, departamentos e cursos | colunas `_en/_es` existem, a API devolve só PT |
| G | **Telas públicas** que dão 404 | `/portarias-e-paradas`, `/onde-comer`, `/espacos-de-estudo`. `/contato` e `/acessibilidade` **não serão criadas** (decisões D7 e D1) |
| H | **Banco/infra** | migrations de 09/11 e 10/11 sem confirmação de aplicação; `ddl-auto=update` |

Sem integração com banco, mas no backlog: rota pela malha viária, cache offline (RNF03), Dockerfile/CI, testes de página no frontend (seção 5).

## 2. Decisões

Registradas em 10/11/2026 com o time. Todas **fechadas**: podem ser implementadas.

| ID | Tema | Estado | Resultado |
|---|---|---|---|
| D1 | Campos do local | Fechada | O formulário de local passa a ter, além do núcleo (nome, nome curto, categoria, status, coordenadas, endereço, descrição): **serviços do local, cursos vinculados, foto, horário e responsável (nome + e-mail)**. **Saem do formulário:** acessibilidade, centro, código SIGA, ano de fundação, nota MEC, grupos de pesquisa, transporte, horário de atendimento, situação operacional e telefone. A coluna `phone` **continua no banco**; só sai do formulário. Não haverá página `/acessibilidade`. Detalhe do schema na Fase 1. |
| D2 | Onde guardar a foto | Fechada (aprovada) | Tabela própria no PostgreSQL, com a imagem reduzida pelo backend e servida por um endpoint do backend. Ver Fase 1. |
| D3 | Senha provisória | Fechada | Não existe. **Quem cadastra o administrador define a senha dele.** Sem troca obrigatória no primeiro acesso. |
| D4 | Redefinição de senha e envio de credenciais por e-mail | Fechada | Fora desta etapa. O campo "enviar credenciais" sai do formulário de cadastro. Se alguém precisar de senha nova, **pede ao responsável pelo projeto, que troca direto no banco** (processo manual; não vira endpoint). |
| D5 | Desfazer de administrador | Fechada | Não faz. |
| D6 | Mensagens do formulário de contato (`/api/messages`) | Fechada | **Removidas**: o módulo `msg`, o `POST /api/messages` público e o item `/contato` da sidebar. Não há retenção nem antispam a definir porque o formulário deixa de existir. |
| D7 | Contatos | Fechada | **Contato é um elemento do local e do curso**, com o e-mail do coordenador/responsável. **Não haverá tela de contato dedicada** (`/contato`). |
| D8 | Dados de coordenadores (e de cursos) | Fechada | Entram pelo **cadastro de locais e de cursos no painel**, não por carga inicial. |
| D9 | Tradução de locais, departamentos e cursos | Fechada | **Sem francês.** O admin preenche **PT** no painel; EN e ES são traduzidos **fora do sistema pelo time**, como foi no Guia de Recife, e gravados **marcados como tradução automática** (padrão `machine_translated_langs`) à espera de revisão humana. **Sem API de tradução** (serviço externo fora da stack). |
| D10 | Matriz curricular | Fechada | **Entra pelo formulário de curso** (tabela `curriculum_subjects`, que já existe). |
| D11 | "Serviços do local" | Fechada (10/11/2026, substitui o desenho anterior) | **Não é uma lista própria do local.** O local é **ligado a serviços do catálogo** (`services`): o serviço aparece em `/servicos` **e** mostra a qual local pertence. Usa a tabela `place_service` (`place_id`, `service_id`), que já existe no banco mas é órfã (sem migration e sem código); a Fase 1 a coloca sob migration. O horário de cada serviço no local deixa de existir. |
| D12 | Locais do mock no banco | Fechada, com detalhe na Fase 1 | **Opção 1:** entram no banco só os locais que existem apenas em `data/mockPlaces.ts` (`ru`, `hovet`, `portaria-principal`, `portaria-dois-irmaos`, `auditorio-novo`), por migration versionada e idempotente. Nos locais que o mock e o seed oficial têm em comum, **vale o seed**: endereço, horário e contato do mock (fictícios) não são copiados. `dzo` não entra (duplica `zootecnia`). A coordenada vinda do OpenStreetMap fica marcada em `coordinates_source` como "a conferir em campo". Em 10/11/2026 o banco tinha 31 locais (29 publicados) e 9 departamentos, conforme o seed oficial (conferido com `count(*)`). |

### 2.1 Respostas às perguntas de 10/11/2026
Q1 foto: aprovada · Q2 senha esquecida: troca manual no banco, sem endpoint · Q3 módulo `msg` e `/contato`: removidos · Q4 tradução: fora do sistema, marcada como automática · Q5 (a) sem página de acessibilidade, (b) matriz no formulário de curso, (c) `phone` fica no banco e sai do formulário.

## 3. Checklist comum a toda tarefa

**Antes:** `git pull` na `dev`, branch novo (`feat/...` ou `fix/...`), um trabalho por branch, commits pequenos no formato `tipo(escopo): descrição`.

**Backend** (`backend/src/main/java/br/com/guiarural/backend/<módulo>/`):
- Controller → Service → Repository; DTOs nas bordas (nunca entidade); Bean Validation nos DTOs; regra no Service.
- Erros: `ResourceNotFoundException` (404), `BadRequestException` (400), `ConflictException` (409).
- **Auditoria:** toda escrita chama `AuditService.record(...)` na mesma transação (`@Transactional`), como em `ServiceService`. A entidade precisa existir no enum `AuditService.Entity` **e** no `check` de `audit_logs.entity` (hoje: `local`, `servico`, `cardapio`, `aviso`, `acolhimento`, `administrador`). Entidade nova ⇒ migration que altera o check.
- **Segurança** (`core/security/SecurityConfig`): toda rota nasce protegida. Escritas em `/api/**` já exigem `GERAL` ou `EDITOR`; leituras só são públicas se estiverem em `PUBLIC_READS`. Rota exclusiva de `GERAL` precisa de matcher próprio **antes** do laço `WRITES` (a primeira regra que casa vale).
- Snapshots de auditoria **nunca** incluem `password_hash`.
- Testes: `*ServiceTest` e teste de integração com MockMvc como em `AdminSecurityIntegrationTest` (sem login → 401, `leitura` → 403, `editor`/`geral` → ok). `./mvnw test` usa H2 em memória.

**Banco** (seção 9 do `CLAUDE.md`):
- `supabase migration new <nome>` (nunca escrever a versão à mão). Tabela nova: `enable row level security` **sem policies** e `revoke all ... from anon, authenticated`. Funções com `search_path` fixo e `revoke execute`.
- Testar a migration em transação com `ROLLBACK`; aplicar só com autorização; se aplicada por outro meio, renomear o arquivo para a versão que o banco registrou.
- Nenhum segredo em arquivo, prompt ou chat (`backend/.env` fora do Git).

**Frontend** (`frontend/src/app/`):
- Dados só via `services/` (`apiGet/apiPost/apiPut/apiDelete` de `lib/api.ts`, hook `useApi`). Sem `any`. Cores só por tokens de `globals.css`.
- Todo texto de interface em `i18n/dictionaries.ts` nos três idiomas (PT, EN, ES). Conteúdo vindo do banco que for só em PT leva `lang="pt"`.
- Responsivo, navegável por teclado, `aria-label`, contraste (RNF05, RNF10).
- Antes do commit: `npx tsc --noEmit && npx eslint src && npm run build` e `npm test`.

**Pronto quando:** compila e passa nos testes (backend e frontend), foi aberto no navegador contra o backend, a seção 12 do `CLAUDE.md` foi atualizada, e o PR (para `dev`, merge commit, ordem de merge descrita) diz o que foi e o que **não** foi verificado.

## 4. Fases

Ordem sugerida: **0 → 1 → 2 → 3**, com 4, 5, 6 e 7 em paralelo conforme as decisões saírem. 0 é pré-requisito de tudo que mexe em schema.

### Fase 0: Banco em dia (H) — P
Pré-requisito para todas as outras.
- [x] Conferir as migrations aplicadas (feito em 10/11/2026 pelo MCP do Supabase): só faltava `cardapio_vegetariano_obrigatorio`; foi testada em rollback, aplicada (versão registrada `20261110143039`) e o arquivo foi renomeado para essa versão.
- [x] Subir o backend com `ddl-auto=validate` contra o banco real: subiu sem erro de schema.
- [x] Trocar `ddl-auto` para `validate` em `application.properties`; `./mvnw test` continua passando (os testes usam H2 com `create-drop` próprio).
- [ ] Abrir o PR da Fase 0 (rename da migration + `validate` + `CLAUDE.md`).
- Achados que alimentam a Fase 1: existe a tabela órfã `place_service` (0 linhas, sem migration e sem código); `places` já tem as colunas `photo_url` e `accessibility` (sem uso pelo backend); `places` só tem 12 campos mapeados na entidade. Atenção: o `rows` do `list_tables` do MCP é **estimativa** e mostrou 0 onde havia dados; use `select count(*)`.
- Pronto quando: `migration list` sem pendência, backend sobe com `validate`.

### Fase 1: Locais no painel (A, UC14 a UC16) — G
Maior divergência hoje: o que o admin edita não chega ao mapa. D1 e D2 estão fechadas.

**Schema (uma migration, `supabase migration new`; tabelas novas já com RLS sem policies e `revoke ... from anon, authenticated`)**

| Item | Como | Observação |
|---|---|---|
| Horário | coluna `places.hours` (já existe) | |
| Responsável | **reaproveitar a tabela `contacts`** (já tem `name`, `email`, `phone`, `place_id`, API e teste) | O local passa a devolver os contatos dentro do próprio DTO. Só nome e e-mail vão ao formulário. |
| Serviços do local (D11) | tabela **existente** `place_service` (`place_id`, `service_id`), colocada sob migration: `service_id not null`, `unique (place_id, service_id)`, FKs com `on delete cascade`, RLS e `revoke` (hoje está com 0 linhas e fora das migrations) | O local escolhe serviços do **catálogo** (`services`). O `ServiceResponseDTO` passa a devolver os locais (slug e nome, só os publicados) para `/servicos` mostrar onde o serviço é prestado. Aproveita `services.location_reference` (texto livre) como complemento. |
| Cursos vinculados | tabela nova `place_courses` (`place_id`, `course_id`, chave composta, `cascade` nos dois lados) | O formulário atual já escolhe cursos de uma lista. Alternativa sem tabela: derivar por `departments.place_id`, mas aí o formulário não poderia escolher. |
| Foto | tabela nova `place_photos` (ver D2) | Separada de `places` para a lista do mapa não carregar bytes. |

**D2, foto (aprovada):**
- Guardar a imagem em `place_photos` (`place_id` único, `content_type`, `bytes` como `bytea`, `updated_at`). Para ~30 locais com uma foto reduzida cada, o volume é pequeno (confira o limite do plano do Supabase). Cabe na stack, entra no backup do banco e mantém a regra de que **só o backend acessa os dados** (nada exposto ao papel `anon`).
- `POST/PUT /api/admin/places/{slug}/photo` (multipart, limite de 5 MB por RNF01) e `DELETE`. O backend decodifica com `javax.imageio` (já vem no JDK, **sem dependência nova**), aceita só JPG/PNG, redimensiona (ex.: lado maior de 1280 px) e regrava em JPEG. Isso também descarta metadados (EXIF/GPS) e recusa arquivo que não é imagem; SVG não passa.
- `GET /api/places/{slug}/photo` público, com `ETag` e `Cache-Control` para o navegador não baixar de novo em 3G/4G. O `PlaceDTO` devolve só a URL (ou `null`).
- A foto **não** entra no snapshot de auditoria (só a data/hash).
- Interface `PhotoStorage` fina por trás, para trocar por Supabase Storage no futuro sem mexer no resto (mesma ideia de Facade do RNF08).
- Alternativa descartada por ora: Supabase Storage. É parte da plataforma que já usamos, mas pede chave de serviço no backend, bucket e regras próprias, e o `CLAUDE.md` (seção 2) pede consultar o time antes de serviço novo.

**Contrato proposto**

| Método e rota | Quem | Observação |
|---|---|---|
| `GET /api/admin/places` e `/{slug}` | logado | todos, inclusive `rascunho` |
| `POST /api/places` | `geral`/`editor` | cria; slug único (409 se repetir). Recebe ids de serviços, ids de cursos e contatos aninhados |
| `PUT /api/places/{slug}` | `geral`/`editor` | substitui as listas aninhadas; inclui publicar/despublicar |
| `DELETE /api/places/{slug}` | `geral`/`editor` | `departments.place_id` já é `on delete set null`; o resto cai por cascade |
| `.../photo` | ver D2 | |

Regras que o banco já impõe (devolver 400 amigável, não estourar o `check`): RN-UC14.01 publicar exige latitude e longitude; as coordenadas andam juntas; só `publicado` aparece no mapa e na busca (RN-UC14.02); categoria e status em lista fechada.

**Backend**
- [ ] Migration, entidades e repositórios novos, `PlaceRequestDTO` com validação, escrita em `PlaceService` com `AuditService.record(Entity.LOCAL, slug, nome, ...)`. O id de auditoria do local é o **slug**.
- [ ] O snapshot de auditoria do local inclui serviços, ids de cursos e contatos (sem a foto).
- [ ] Testes: serviço (publicar sem coordenada, slug repetido, excluir com departamento vinculado, listas aninhadas) e integração de segurança (401/403/ok).

**Frontend**
- [ ] Reescrever as funções de admin de `placesService.ts` (`listAllPlaces`, `getPlaceForAdmin`, `savePlace`, `setPlaceStatus`, `deletePlace`) para a API; remover o estado em memória, `recordChange`/`snapshot` locais e `restorePlace`; invalidar `publicCache` ao escrever.
- [ ] **Encolher o tipo `Place` e o `PlaceForm`** aos campos de D1. Os campos removidos aparecem hoje em outros componentes (cartão, página do local, histórico): procurar e retirar `accessibility`, `center`, `sigaCode`, `foundedYear`, `mecGrade`, `researchGroups`, `transport`, `officeHours`, `operation`, `phone`, `head`.
- [ ] O seletor de cursos do `PlaceForm` hoje lê `MOCK_COURSES`: passar para `coursesService` (API).
- [ ] Foto: trocar `photoDataUrl` por upload ao endpoint e exibição pela URL.
- [ ] Dashboard (`admin/(painel)/page.tsx`) e `data/mockPlaces.ts`: contar pela API; manter do mock só o que ainda for usado (`DEFAULT_ORIGIN_ID`) e mover os tipos para `services/`.
- Pronto quando: criar, editar, publicar, despublicar e excluir um local (com serviços, cursos, responsável e foto) reflete no mapa, na busca e na página do local após recarregar, e cada ação aparece no histórico.

### Fase 2: Administradores (B, UC13) — M
**Implementada** no branch `feat/admins-api`. Decisões fechadas (D3, D4, D5). A listagem (`GET`) ficou aberta a qualquer administrador logado, como a tela já mostrava; só as escritas são exclusivas de `GERAL`. Reaproveita `AdminEntity`/`AdminRepository` do módulo `login`.

**Contrato proposto** (rotas exclusivas de `GERAL`, com matcher próprio no `SecurityConfig`)

| Método e rota | Observação |
|---|---|
| `GET /api/admin/admins` | lista; **sem** `passwordHash` no DTO |
| `POST /api/admin/admins` | recebe a **senha definida por quem cadastra**; e-mail `@ufrpe.br` em minúsculas e único (o banco já exige); RN-UC13.01: setor "Coordenação de TI" nasce `ativo`, os demais `aguardando` |
| `PATCH /api/admin/admins/{id}` | aprovar (`aguardando`→`ativo`), mudar perfil, revogar (`revogado`). **Não** muda senha: se alguém precisar de senha nova, o responsável pelo projeto troca direto no banco (D4) |

- A linha de um administrador **nunca é apagada** (a auditoria referencia `admin_id`): "excluir" = `revogado`.
- [x] Senha: de 8 a 72 caracteres (72 bytes é o limite do BCrypt), BCrypt com o `PasswordEncoder` existente, nunca logada nem devolvida (o `toString` do DTO omite a senha).
- [x] **Sem** endpoint de troca de senha, **sem** coluna de "trocar no primeiro acesso" e **sem** envio de e-mail (D3/D4).
- [x] Impedir revogar ou rebaixar o **último** administrador `geral` ativo (409), e ninguém altera o próprio acesso (400).
- [x] Conta revogada perde a sessão ativa: não perdia (o `AdminPrincipal` ficava na sessão até expirar). O `AdminSessionRefreshFilter` relê a conta a cada requisição autenticada: fora de `ativo`, encerra a sessão (401); perfil trocado vale na hora, sem novo login.
- [x] Auditar com `Entity.ADMINISTRADOR`, sem hash nem senha nos snapshots (o snapshot é o `AdminResponseDTO`).
- [x] Frontend: `adminsService.ts` para a API; **apagar `MOCK_PASSWORDS` e `checkPassword`**; retirar `sendCredentials` de `NewAdmin` e do formulário; mover os tipos `Admin`, `Permission`, `Sector` para fora de `data/mockAdmins.ts` (`authService.ts` importa `Permission` de lá); atualizar `admin/(painel)/administradores/page.tsx`.
- [ ] O primeiro administrador continua sendo inserido à mão no banco (a senha nunca vai para código, migration ou chat).
- Pronto quando: um `geral` cadastra (com senha própria), aprova e revoga contas reais, e o novo administrador consegue entrar.

### Fase 3: Histórico completo e desfazer (C, UC23) — M
Depende das Fases 1 e 2 (locais e administradores no servidor).
- [ ] `AuditRestorer` para `LOCAL`, `SERVICO`, `AVISO` e `CARDAPIO` (interface em `core/audit/AuditRestorer.java`; `ACOLHIMENTO` é o modelo). **`ADMINISTRADOR` não tem desfazer (D5).**
- [ ] Desfazer de um **registro excluído**: recriar com o id original (as tabelas usam `generated by default`, então aceitam id explícito) e conferir conflito de slug/unicidade (cardápio: um por data e turno, 409).
- [ ] Desfazer de **local excluído** devolve serviços, cursos e contatos (estão no snapshot), mas **não a foto**, que não vai para o snapshot. Documentar isso na tela.
- [ ] `restoreService.ts`: tudo pela API; `auditService.ts`: remover o histórico em memória (`MOCK_AUDIT_LOGS`, `recordChange`, `snapshot`) e o aviso de "só o que está em memória"; apagar `data/mockAuditLogs.ts` mantendo os tipos em arquivo próprio.
- Pronto quando: tudo que o painel altera tem log no servidor e o desfazer funciona para as quatro entidades, com teste de cada restorer.

### Fase 4: Contatos como elemento de local e curso (D, D7) — M
Substitui o antigo plano de "tela de contato e caixa de mensagens". Depende da Fase 1 (local) e da Fase 5 (curso).
- **Local:** o responsável (nome + e-mail) vive em `contacts` e vai no formulário de local (Fase 1).
- **Curso:** a tabela `courses` **já tem** `coordinator_name`, `vice_coordinator_name`, `email` e `secondary_email`; não precisa de tabela nova. O formulário de curso (Fase 5) expõe esses campos.
- [ ] Exibir o responsável e o e-mail (link `mailto:`) na página do local e na do curso, sem inventar dado (campo vazio não aparece).
- [ ] O `ContactController` avulso (`/api/contacts`) fica redundante: remover ou restringir ao painel depois de confirmar que ninguém o consome (nada no frontend o chama hoje).
- [ ] Conforme D6: **remover** o módulo `msg` (código, testes e a regra de `POST /api/messages` público e isento de CSRF no `SecurityConfig`) e o item `/contato` da sidebar. A tabela `messages` pode ficar no banco ou sair por migration própria (decidir ao implementar, com cuidado: é DDL destrutivo).
- [ ] Atualizar o `CLAUDE.md` (hoje descreve `contacts` como placeholder).
- Pronto quando: a página de um local e a de um curso mostram o responsável e o e-mail cadastrados no painel, e não sobra rota pública sem uso.

### Fase 5: Cursos, escrita e dados (E) — G
Sem carga inicial: os dados entram pelo painel (D8).
- [ ] `POST/PUT/DELETE` em `/api/courses` (UC35, UC36 e cadastro), validação e erros padrão. O formulário inclui coordenador, vice, e-mail e e-mail secundário.
- [ ] **Matriz curricular no formulário de curso (D10):** edição da lista de disciplinas (`curriculum_subjects`: período, código etc.; `null` = bloco "Optativas / Eletivas") junto com o curso, na mesma transação. Excluir o curso remove a matriz (`on delete cascade`, UC36). Pode ser dividida em duas entregas: curso sem matriz, depois a matriz.
- [ ] Auditoria: a entidade `curso` **não existe** no `check` de `audit_logs.entity` ⇒ migration + enum `AuditService.Entity` (+ restorer, se for desfazível). O snapshot inclui a matriz.
- [ ] Telas do painel para cursos (casos de uso `[UC35]` e `[UC36]` em `docs/`).
- [ ] Verificar se `data/mockCourses.ts` ainda é importado em algum lugar; se não, é código morto e pode sair.
- Pronto quando: um curso é criado, editado e excluído no painel e aparece em `/cursos`, na busca e na lista de cursos vinculados do formulário de local.

### Fase 6: Conteúdo multilíngue de locais, departamentos e cursos (F, RF04) — M
Idiomas: PT, EN e ES (**sem francês**), conforme D9: o painel edita só PT; EN e ES são traduzidos **fora do sistema pelo time** (como no Guia de Recife) e gravados marcados como tradução automática.
- [ ] Conferir em `places`, `departments` e `courses` quais colunas `_en/_es` e qual marcador de tradução automática já existem (o `CLAUDE.md` diz que as `_en/_es` existem; não verifiquei o marcador) e criar por migration o que faltar, seguindo `machine_translated_langs` do Guia de Recife.
- [ ] API aceita `?lang=` e resolve no servidor com fallback para PT, como `/api/guide` (módulo `info` é o modelo).
- [ ] Como o time grava EN/ES (carga por script/SQL, como no Guia de Recife) e **o que fazer quando o PT for editado depois** (a tradução fica desatualizada): decidir e documentar. Sugestão: ao editar o PT, a interface avisa que EN/ES podem estar defasados.
- [ ] A interface sinaliza "tradução automática, aguardando revisão" onde o idioma estiver marcado.
- [ ] Frontend consome o idioma da `LanguageContext`.
- Pronto quando: trocar o idioma altera nome e descrição de locais, departamentos e cursos que tenham tradução, e cai em PT quando não tiver.

### Fase 7: Telas públicas que dão 404 (G) — M
Depende da Fase 1.
- `/portarias-e-paradas`, `/onde-comer` e `/espacos-de-estudo` podem ser **visões filtradas de `places`** (a tabela já tem as categorias `portaria`, `alimentacao` e `sala`), sem tabela nova. **Confirmar com o PO** antes de assumir.
- `/acessibilidade`: **não será criada** (D1: o local não terá campo de acessibilidade). Tirar o link da sidebar.
- `/contato`: **não será criada** (D7 e D6); tirar o link da sidebar.
- O banco ainda **não tem** portarias nem RU cadastrados; o conteúdo entra pelo painel (Fase 1).
- Enquanto a página não existir, considerar esconder o item da sidebar em vez de deixar 404.

## 5. Backlog fora do banco (sem detalhamento)
Rota pela malha viária atrás de uma Facade (RNF08; `services/routeService.ts` hoje liga origem e destino em linha reta) · cache offline persistente (RNF03) · Dockerfile e GitHub Actions (CI/CD, 4 ambientes) · testes de página no frontend · GPS no botão da busca (FA-38.02) · "manter conectado" com cookie persistente.

## 6. Mapa de dependências e paralelização

```
Fase 0 ─┬─> Fase 1 ─┬─> Fase 3
        │           ├─> Fase 4   (contato do local)
        │           └─> Fase 7
        ├─> Fase 2 ──> Fase 3
        ├─> Fase 5 ──> Fase 4   (contato do curso)
        └─> Fase 6
```

Divisão possível para o time: uma pessoa na Fase 0 e depois no backend da Fase 1; outra no frontend da Fase 1 assim que o contrato for aceito; uma terceira na Fase 2. A Fase 3 espera 1 e 2. Fases 4, 5 e 6 podem ser pegas por quem estiver livre quando suas decisões saírem.

## 7. Comandos de verificação
```bash
cd backend && ./mvnw test
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.jpa.hibernate.ddl-auto=validate"
cd frontend && npx tsc --noEmit && npx eslint src && npm run build && npm test
supabase migration list     # exige `supabase link`
```
