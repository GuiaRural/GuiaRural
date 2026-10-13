# Plano de implementação — Tela principal (Home)

Base: protótipo "Tela principal", Documento de Visão (RF01–RF06), Arquitetura (RNF01–RNF11) e Plano de Projeto.

## Etapa 1 — Shell da Home (feito nesta entrega)
- Header, sidebar de navegação, barra de busca com sugestões e "Últimos acessos", seletor PT/EN/ES, mapa placeholder.
- Dados mockados atrás de `services/placesService.ts`; rewrite `/api` → `localhost:8080` em `next.config.ts`.
- Sidebar vira drawer em telas pequenas (RNF10, público mobile).
- Fora desta etapa: cartão do local, mapa real, rota, persistência de idioma.

## Etapa 2 — Mapa real (RF01, 8 SP)
1. Instalar `leaflet` e `react-leaflet` (versões fixadas) e carregar o mapa só no cliente (`dynamic`, sem SSR).
2. Tiles do OpenStreetMap, centralizados no campus Sede; respeitar a política de uso de tiles do OSM.
3. Marcadores a partir de `placesService` (coordenadas entram no tipo `Place`).
4. Cache local dos pontos de interesse (RNF03) e imagens leves (RNF01).

## Etapa 3 — Cartão do local e busca completa (RF01, RF03)
1. Cartão (foto, horário, acessibilidade, descrição, "Ver página completa") ao clicar no marcador ou numa sugestão.
2. "Últimos acessos" e locais salvos em `localStorage` (sem login, RNF04), com `try/catch`.
3. Atalho ⌘K/Ctrl+K e botão de geolocalização (pedir permissão só ao clicar).

## Etapa 4 — Rotas (RF02, 8 SP)
1. Painel "Traçar rota" (origem, destino, a pé/bicicleta/acessível, instruções).
2. Chamadas a provedor de rotas encapsuladas numa Facade (RNF08), via HTTPS.

## Etapa 5 — Integração com o backend
1. Endpoints Spring Boot (Controller → Service → Repository) para locais e busca.
2. Trocar o mock por `fetch("/api/...")`, mantendo a assinatura do serviço.
3. Entidades novas no Supabase: seguir as regras de segurança da organização (RLS por empresa, nada para `anon`, `security_invoker` em views, `search_path` fixo, `revoke execute` em funções) e testar migrations em rollback.

## Etapa 6 — i18n completa (RF04, 5 SP)
- Persistir idioma escolhido, traduzir conteúdo vindo da API, revisão humana de EN/ES.
- Decisão pendente: incluir francês (Visão e Arquitetura citam FR; Plano de Projeto cita só PT/EN/ES).

## Etapa 7 — Demais telas do menu
Avisos, Cursos e departamentos, Serviços, Acolhimento (RF05) e Área do administrador (RF06, com guard de autenticação/perfil nas rotas).
Até lá, esses links da sidebar levam a 404.

## Pendências e riscos
- `claude/estado-do-projeto.md` e `claude/regras-seguranca-novas-entidades.md` não existem no repositório; precisam ser fornecidos.
- Logo e identidade visual oficiais da UFRPE não foram aplicados (texto no lugar do logo).
- Acessibilidade: validar contraste e navegação por teclado com ferramenta; só revisão de código foi feita.
- Testes: ainda não há testes automatizados no frontend (Fases 9 e 11 do cronograma).
