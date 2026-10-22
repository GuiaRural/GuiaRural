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
| Backend | Java 21, Spring Boot 4.1 (webmvc, validation, actuator), Maven Wrapper |
| Dados | PostgreSQL no Supabase |
| Mapas | Leaflet 1.9.4 + react-leaflet 5.0.0 + OpenStreetMap (integrado na Home; só cliente, via `dynamic`) |
| Infra | Docker, GitHub Actions (CI/CD), 4 ambientes: dev, teste, homologação, produção |

**Atenção ao Next.js:** esta versão tem mudanças em relação ao que a IA conhece. Antes de gerar código de Next, consulte `frontend/node_modules/next/dist/docs/` (regra do `frontend/AGENTS.md`).

## 4. Arquitetura
- Cliente-servidor em camadas. Backend monolítico, sem microsserviços.
- Backend: **Controller → Service → Repository** (API REST, DTOs nas bordas). Pacotes em `br.com.guiarural.backend`: `contacts`, `core` (`config`, `security`), `courses`, `info`, `map`.
- Frontend: componentes React tipados, separação apresentação / regra / dados.
- APIs externas (mapas, rotas) **sempre atrás de uma Facade**, expondo só os métodos usados, para permitir trocar de provedor (RNF08).
- Padrões previstos: Facade, Flyweight (reduzir memória no cliente), MVC.
- O navegador chama `/api/...`, e o Next repassa ao backend em `http://localhost:8080` (rewrite em `frontend/next.config.ts`).

## 5. Estrutura do repositório
```
backend/    API Spring Boot
frontend/src/app/
  components/common/   componentes compartilhados (Header, Sidebar, SearchBar, ...)
  components/admin/    componentes do painel admin
  context/             contextos React (ex.: LanguageContext)
  i18n/                dicionários de idioma
  data/                mocks tipados (temporário, até existir API)
  services/            acesso a dados (ponto único para trocar mock por fetch)
  hooks/ routes/ pages/ admin/ public/ assets/   (estrutura reservada)
docs/       planos e este documento
```
Mantenha os arquivos nessas pastas. Não crie estruturas paralelas.

## 6. Convenções de código
- **Frontend:** TypeScript estrito, sem `any`. Componentes de servidor por padrão; `"use client"` só quando precisar de estado/efeito. Acesso a dados somente via `services/`. Cores e tokens vêm de `globals.css` (`navy-900`, `navy-700`, `brand-yellow`), sem cores soltas em hex nos componentes.
- **Backend:** validação com Bean Validation, regras no Service, nunca no Controller. Retornar DTOs, não entidades.
- Comentários só onde o motivo não é óbvio. Código e nomes técnicos em inglês ou português, mas **consistente com o arquivo em edição**. Textos de interface em português ficam no dicionário, nunca fixos no componente.
- Mudanças pequenas e focadas. Não refatorar código não relacionado ao pedido.

## 7. Multilíngue (RF04)
- Idiomas hoje: **PT, EN, ES**. Francês aparece na Visão e na Arquitetura, mas não no Plano de Projeto: decisão pendente com o PO, não implementar sem confirmação.
- Todo texto de interface vem de `t.<seção>.<chave>` (`useLanguage()`), com entrada nos três idiomas em `i18n/dictionaries.ts`.
- Conteúdo vindo da API (locais, serviços) ainda não tem modelo de tradução definido. Não inventar; perguntar.

## 8. Requisitos não funcionais que afetam o código
- **Desempenho (RNF01):** usuários em 3G/4G e aparelhos modestos. Imagens leves (JPG/PNG até 5 MB), requisições de mapa limitadas, nada de dependências pesadas sem necessidade.
- **Disponibilidade (RNF03):** cache local no navegador para pontos de interesse prioritários.
- **Segurança (RNF02):** chamadas externas por HTTPS; criar/alterar/excluir dados só pelo painel admin autenticado, com permissões validadas **no backend**.
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

# Frontend (porta 3000)
cd frontend && npm install && npm run dev
npx tsc --noEmit && npx eslint src && npm run build   # checagem antes de commit
```

## 12. Estado atual (atualize ao mudar)
- **Pronto:** shell da Home (header, sidebar, busca, seletor de idioma), mapa Leaflet/OSM restrito ao campus Sede (limites do OSM em `data/mapConfig.ts`) com marcadores clicáveis nas coordenadas reais dos locais (`data/mockPlaces.ts`, `position` em lat/lng; as marcadas como APROXIMADA/PROVÁVEL precisam de conferência), rota em linha reta origem→destino (`services/routeService.ts`), i18n PT/EN/ES para a interface, mocks, rewrite `/api`.
- **Não existe ainda:** integração do mapa/locais com o backend (tudo ainda é mock em `services/`), cache de pontos de interesse, rota pela malha viária, catálogo, telas além da Home (links da sidebar levam a 404), endpoints do backend, banco, painel admin, testes automatizados.
- Plano detalhado: `docs/plano-implementacao-home.md`.

## 13. Modelo de prompt para a tarefa
```
Contexto: [cole este documento]

Tarefa: [o que fazer, ligado a um RF/RNF]
Arquivos envolvidos: [caminhos, se souber]
Critérios de pronto: [comportamento esperado]
Restrições extras: [prazos, bibliotecas proibidas, etc.]
```

## 14. Branchs e commits

Sempre crie branchs das versões mais atualizadas. antes de qualquer código, rode git pull a a partir da dev.
