# GuiaRural — Contexto para assistentes de IA

> Como usar: cole este documento no início da conversa (ou anexe o arquivo) e depois descreva a tarefa.
> Se a IA propuser algo que contradiz este documento, peça que corrija antes de aceitar o código.
> Fonte de verdade: Documento de Visão, Documento de Arquitetura e Plano de Projeto. Em caso de conflito, eles valem mais que este resumo.

## 1. O que é o projeto
Plataforma web de **acesso livre** para orientar estudantes da UFRPE (foco em estrangeiros e calouros) no **campus Dois Irmãos (Sede)**: mapa, rotas, catálogo de serviços, guia de acolhimento e painel administrativo. Entrega como MVP, de forma iterativa.

Requisitos funcionais: RF01 mapa · RF02 rotas · RF03 catálogo de serviços · RF04 multilíngue · RF05 guia de acolhimento cultural · RF06 painel administrativo.

## 2. Escopo — o que NÃO fazer
- Sem login, cadastro ou conta para o usuário final (RNF04). Nada de armazenar histórico individual de rotas no servidor.
- Sem mapeamento interno de prédios (andares, salas, laboratórios). Só o prédio, com referência interna em texto.
- Sem outros campi (só a Sede). Não criar a entidade "unidade".
- Autenticação existe **somente** no painel administrativo.
- Não adicionar bibliotecas, serviços ou frameworks fora da stack abaixo sem consultar o time.

## 3. Stack e versões
| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS 4, React Compiler ligado |
| Backend | Java 21, Spring Boot 4.1 (webmvc, validation, actuator, data-jpa, security), Maven Wrapper |
| Dados | PostgreSQL no Supabase; schema versionado com o Supabase CLI em `supabase/migrations/` |
| Mapas | Leaflet 1.9.4 + react-leaflet 5.0.0 + OpenStreetMap (integrado na Home; só cliente, via `dynamic`) |
| Infra | Docker, GitHub Actions (CI/CD), 4 ambientes: dev, teste, homologação, produção — **planejado: ainda não há Dockerfile nem workflow no repositório** |

**Atenção ao Next.js:** esta versão tem mudanças em relação ao que a IA conhece. Antes de gerar código de Next, consulte `frontend/node_modules/next/dist/docs/` (regra do `frontend/AGENTS.md`).

## 4. Arquitetura
- Cliente-servidor em camadas. Backend monolítico, sem microsserviços.
- Backend: **Controller → Service → Repository** (API REST, DTOs nas bordas). Pacotes em `br.com.guiarural.backend`:
  - com código: `core` (`exception`, `security`, `audit`), `login` (autenticação do painel), `courses` (departamentos, cursos e matriz), `map` (locais e busca), `info` (guia de acolhimento e Guia de Recife), `msg`, `notices` (avisos), `services`;
  - ainda só placeholders (`temp.txt`): `contacts`.
- Erros: lance `ResourceNotFoundException` (vira 404); o `GlobalExceptionHandler` devolve `ProblemDetail` (404, 400 de validação, JSON malformado e ID inválido). `BadRequestException` vira 400 e `ConflictException`, 409. `msg` ainda lança `IllegalArgumentException`/`RuntimeException` e responde 500 nesses casos.
- Frontend: componentes React tipados, separação apresentação / regra / dados.
- APIs externas (mapas, rotas) **sempre atrás de uma Facade**, expondo só os métodos usados, para permitir trocar de provedor (RNF08).
- Padrões previstos: Facade, Flyweight (reduzir memória no cliente), MVC.
- O navegador chama `/api/...`, e o Next repassa ao backend em `http://localhost:8080` (rewrite em `frontend/next.config.ts`).

## 5. Estrutura do repositório
```
backend/    API Spring Boot
supabase/   projeto do Supabase CLI: config.toml e migrations/ (única fonte do schema)
frontend/src/app/
  components/{common,admin,courses,map,places,ui}/   componentes por área
  context/    contextos React (ex.: LanguageContext)
  i18n/       dicionários de idioma
  data/       mocks tipados (o que ainda não vem da API)
  services/   acesso a dados (ponto único para trocar mock por fetch)
  hooks/ lib/ routes/ pages/ admin/ public/ assets/
docs/       planos, casos de uso (.docx) e protótipos de tela (docs/telas/)
```
Mantenha os arquivos nessas pastas. Não crie estruturas paralelas (ex.: um segundo `PlaceCard` ou `MapCanvas` fora de `components/places` e `components/map`).

## 6. Convenções de código
- **Frontend:** TypeScript estrito, sem `any`. Componentes de servidor por padrão; `"use client"` só quando precisar de estado/efeito. Acesso a dados somente via `services/` (chamadas à API com `apiGet` de `lib/api.ts` e o hook `useApi` para loading/erro/retry). Cores e tokens vêm de `globals.css` (`navy-900`, `navy-700`, `brand-yellow`), sem cores soltas em hex nos componentes.
- **Backend:** validação com Bean Validation, regras no Service, nunca no Controller. Retornar DTOs, não entidades.
- Comentários só onde o motivo não é óbvio. Código e nomes técnicos em inglês ou português, mas **consistente com o arquivo em edição**. Textos de interface em português ficam no dicionário, nunca fixos no componente.
- Mudanças pequenas e focadas. Não refatorar código não relacionado ao pedido.

## 7. Multilíngue (RF04)
- Idiomas hoje: **PT, EN, ES**. Francês aparece na Visão e na Arquitetura, mas não no Plano de Projeto: decisão pendente com o PO, não implementar sem confirmação.
- Todo texto de interface vem de `t.<seção>.<chave>` (`useLanguage()`), com entrada nos três idiomas em `i18n/dictionaries.ts`. EN e ES precisam de revisão humana.
- **Guia de acolhimento e Guia de Recife** têm tradução no banco (colunas `_pt/_en/_es`, jsonb por idioma nos blocos) e `/api/guide` resolve o idioma no servidor (`?lang=`, fallback para PT). `machine_translated_langs` marca o que foi traduzido automaticamente e espera revisão humana (Guia de Recife); `fully_translated_langs` diz em quais idiomas um tópico está 100% traduzido.
- Conteúdo de locais, departamentos e cursos: as colunas `_en/_es` já existem no banco, mas a API ainda devolve só português. Não inventar tradução; perguntar.

## 8. Requisitos não funcionais que afetam o código
- **Desempenho (RNF01):** usuários em 3G/4G e aparelhos modestos. Imagens leves (JPG/PNG até 5 MB), requisições de mapa limitadas, nada de dependências pesadas sem necessidade.
- **Disponibilidade (RNF03):** cache local no navegador para pontos de interesse prioritários. Hoje só há cache em memória por sessão (`placesService`); o cache persistente ainda não existe.
- **Segurança (RNF02):** chamadas externas por HTTPS; criar/alterar/excluir dados só pelo painel admin autenticado, com permissões validadas **no backend**. Implementado com Spring Security: **nega por padrão** (`core/security/SecurityConfig`: só as leituras listadas lá são públicas), sessão por cookie `GUIARURAL_SESSION` HttpOnly + SameSite=Strict (em HTTPS defina `SESSION_COOKIE_SECURE=true`), CSRF por cookie `XSRF-TOKEN` + cabeçalho `X-XSRF-TOKEN`, senha BCrypt em `admins.password_hash` e limite de 5 erros de senha por e-mail em 15 min. Escrever exige perfil `geral` ou `editor`; `leitura` só consulta. Toda rota nova nasce protegida: liberar uma leitura pública é decisão explícita no `SecurityConfig`.
- **Privacidade (RNF04):** nada de rastreamento do usuário final. "Últimos acessos" e locais salvos ficam só no navegador (`localStorage`, sempre com `try/catch`).
- **Usabilidade/Portabilidade (RNF05, RNF10):** responsivo, mobile primeiro, identidade visual da UFRPE, acessível por teclado, com `aria-label` e contraste adequado.
- **Auditabilidade (RNF06):** alterações feitas no admin devem gerar log de auditoria no PostgreSQL.

## 9. Regras de segurança (organização)
Toda tabela, view, função e tela nova deve seguir **antes do commit**:
- RLS por empresa em toda tabela.
- Nada exposto ao papel `anon`.
- Views com `security_invoker`.
- Funções com `search_path` fixo e `revoke execute` aplicado.
- Guard de perfil em rotas protegidas (principalmente `/admin`).
- Chave de serviço **somente** sem prefixo `VITE_`/`NEXT_PUBLIC_`; nunca no frontend.
- Nunca colocar segredo real em arquivo, prompt ou chat. Usar `.env.local` (fora do Git) e `.env.example` com valores falsos.
- Nunca inventar número de versão de migration. Testar migrations em rollback antes de aplicar.

> O arquivo `claude/regras-seguranca-novas-entidades.md` citado pela organização ainda não está no repositório. Se ele existir, ele prevalece sobre este resumo.

**Como isso é aplicado aqui** (o projeto não tem conceito de "empresa"; é conteúdo público de um campus):
- Toda tabela nasce com `enable row level security` **sem policies** e com `revoke all ... from anon, authenticated`. O único caminho de acesso aos dados é o backend, que conecta como dono das tabelas e não é afetado pelo RLS.
- Migration nova: `supabase migration new <nome>` (o CLI gera a versão, nunca escreva à mão), testar em transação com `ROLLBACK`, aplicar só com autorização e, se aplicada por outro meio, renomear o arquivo para a versão que o banco registrou.
- `spring.jpa.hibernate.ddl-auto=update` cria tabelas **sem RLS, FKs nem checks** se o backend subir antes das migrations. Em ambiente novo aplique as migrations primeiro; o recomendado é `validate` ou `none`.
- Segredos do banco só em `backend/.env` (ignorado pelo Git). Nunca em arquivo versionado nem no chat.

## 10. Como a IA deve responder
1. **Se faltar informação, perguntar** em vez de supor. Não inventar endpoints, tabelas, campos ou dados institucionais da UFRPE.
2. Dizer **o que verificou e o que não verificou** (compilou? rodou testes? abriu no navegador?). Nada de afirmar "funciona" sem ter executado.
3. Entregar arquivos completos com o **caminho de destino** de cada um, seguindo a estrutura da seção 5.
4. Antes de propor biblioteca nova, justificar e confirmar que cabe na stack.
5. Não colocar dados reais de pessoas, credenciais ou chaves nos exemplos.
6. Se a tarefa conflitar com o escopo (seção 2) ou com a segurança (seção 9), avisar em vez de implementar.

## 11. Comandos úteis
```bash
# Backend (porta 8080, saúde em /actuator/health)
cd backend && ./mvnw spring-boot:run
cd backend && ./mvnw test            # usa H2 em memória (src/test/resources/application.properties): não precisa de banco nem de .env

# Frontend (porta 3000)
cd frontend && npm install && npm run dev
npx tsc --noEmit && npx eslint src && npm run build   # checagem antes de commit

# Banco (na raiz do repositório)
supabase migration new <nome>        # cria supabase/migrations/<versão>_<nome>.sql
```
O backend lê `backend/.env` com `DB_URL` (`jdbc:postgresql://HOST:PORTA/postgres`, **sem** `?` no fim: a aplicação acrescenta usuário e senha), `DB_USER` e `DB_PASSWORD`. A conexão direta do Supabase só resolve por IPv6; se der `UnknownHostException`, use o host do **Session pooler** (IPv4), na aba Connect do painel. Para uma verificação que não altere o schema: `./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.jpa.hibernate.ddl-auto=none"`.

Se o `tsc` falhar em `frontend/.next/dev/types/validator.ts`, é um arquivo gerado e ignorado pelo Git que ficou corrompido; ele é recriado pelo `next dev`/`next build`.

## 12. Estado atual (atualize ao mudar)
- **Já vem do banco (via `/api`):** mapa, busca, cartão e página do local (`/api/places`; 31 locais no banco, 29 publicados, coordenadas do Google Places ainda sem conferência em campo); origem padrão das distâncias = Prédio Central (`reitoria`); `?local=<slug>` na URL com voltar/avançar; atalho Ctrl/⌘+K; sugestões de departamentos e cursos na busca (UC38); páginas `/cursos`, `/cursos/[id]` e `/departamentos/[id]` (UC37, somente leitura); guia de acolhimento (`/acolhimento/[secao]`, com busca no servidor), Guia de Recife (`/acolhimento/recife`) e avisos (`/avisos`, `/admin/avisos`), todos via `/api/guide` e `/api/avisos`.
- **Backend:** `GET` de locais, departamentos, cursos e busca; CRUD de `services` (`GET /api/services` devolve só os ativos; `GET /api/admin/services`, todos, exige login; campos: categoria, setor, passos, requisitos, link HTTPS, prazo), `notices` (avisos) e `msg` (mensagens); `GET /api/guide/{topics, topics/{slug}, search, recife, resources, translations/topics}` (módulo `info`), `POST/PUT/DELETE /api/guide/topics` (exigem login), `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`, `GET /api/admin/audit-logs` e `POST /api/admin/audit-logs/{id}/restore`. Escritas de `services`, `notices` e `guide` gravam o histórico no servidor (`audit_logs`, mesma transação, RNF06); `msg` não é auditada. `GET /api/messages` e `/api/contacts` exigem login. `msg` não tem tela; `services` tem a tela do painel e a página pública `/servicos` (UC11: só os publicados, com busca e filtro por categoria). Migrations aplicadas: RLS das tabelas, cursos/departamentos/matriz, locais e carga inicial, tabelas de admin/auditoria/cardápio/guia, colunas de tradução, contatos/downloads/aviso de apoio, seed do guia `fully_translated_langs`, `admins.password_hash` e as regras de `services` (migrations de 09/11 ainda dependem de aplicação no banco; confira com `supabase migration list`).
- **Dados:** 9 departamentos (só nome, sigla e o local onde funcionam, tirados dos documentos). **Nenhum curso, matriz ou coordenador** — não há fonte oficial no repositório. Locais sem horário, acessibilidade, foto, telefone e endereço; sem portarias nem RU. CEU e Casa Samyr Pessoa são rascunho (sem coordenada). Guia: 20 tópicos, 10 locais e 3 dicas do Guia de Recife, contatos, cartilhas e aviso de apoio, vindos dos antigos mocks; EN/ES precisam de revisão humana e o Guia de Recife está com tradução automática marcada. Os tópicos `beneficios` e `chegada-transporte` ficaram sem local (`ru` e `portaria-principal` não existem em `places`). **Avisos: tabela vazia** (os do protótipo eram fictícios); quem publica é o painel (`/admin/avisos`, botão Novo aviso).
- **Painel admin (`/admin`):** **de verdade (API):** login (UC12) e logout (UC24), edição dos tópicos de acolhimento em PT/EN/ES (exceto Guia de Recife), lista, publicação, edição e exclusão de avisos, lista, cadastro, edição (inclui despublicar) e exclusão de serviços (UC19 a UC21) e o histórico (UC23) das mudanças feitas nesses quatro, com desfazer só para acolhimento. **Ainda mock, na memória da aba (recarregar desfaz):** administradores (UC13), locais (UC14), cardápio do RU (UC25) e o histórico dessas telas. O primeiro administrador é inserido à mão no banco (a senha nunca vai para código, migration ou chat); UC13 ainda não cria contas reais.
- **Ainda mock (`data/` + `services/`):** administradores (UC13), auditoria das telas ainda mock, cardápio, CRUD de locais do painel admin (diverge do banco), rota em linha reta (`routeService`).
- **Não existe ainda:** cadastro de administradores no backend (UC13) e senha provisória/redefinição; "manter conectado" só alonga a inatividade da sessão no servidor (o cookie não persiste após fechar o navegador); desfazer de avisos e serviços; UC35/UC36 (editar e excluir curso; o login já existe); telas `/contato`, `/acessibilidade`, `/portarias-e-paradas`, `/onde-comer` e `/espacos-de-estudo` (os links da sidebar dão 404); GPS no botão da busca (FA-38.02); cache offline persistente (RNF03); rota pela malha viária; Dockerfile e CI/CD; testes automatizados no frontend.
- Plano detalhado: `docs/plano-implementacao-home.md` (parcialmente desatualizado: foi escrito antes da integração com o banco).

## 13. Modelo de prompt para a tarefa
```
Contexto: [cole este documento]

Tarefa: [o que fazer, ligado a um RF/RNF]
Arquivos envolvidos: [caminhos, se souber]
Critérios de pronto: [comportamento esperado]
Restrições extras: [prazos, bibliotecas proibidas, etc.]
```

## 14. Branches e commits
- Sempre crie branches a partir da `dev` mais atualizada: rode `git pull` na `dev` antes de qualquer código.
- Um trabalho por branch, com commits pequenos e separados. Mensagens no formato `tipo(escopo): descrição` (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`).
- Abra PR para a `dev`. Se um branch depende de outro, diga a ordem de merge na descrição do PR. Use **merge commit** (não squash), para preservar autoria e hashes dos commits.
- **Autoria:** quando o código vem do trabalho de outra pessoa, traga o commit dela (merge ou cherry-pick) em vez de só citar com `Co-authored-by`. Nunca reescreva histórico já enviado (sem `push --force`): se precisar corrigir, faça um commit novo ou um branch novo.
- Commits feitos com ajuda da IA terminam com a linha `Co-Authored-By` da ferramenta.
