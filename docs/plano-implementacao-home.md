# Plano de implementação — Tela principal (Home)

Base: protótipo "Tela principal", Documento de Visão (RF01–RF06), Arquitetura (RNF01–RNF11) e Plano de Projeto.

## Etapa 1 — Shell da Home (feito nesta entrega)
- Header, sidebar de navegação, barra de busca com sugestões e "Últimos acessos", seletor PT/EN/ES, mapa placeholder.
- Dados mockados atrás de `services/placesService.ts`; rewrite `/api` → `localhost:8080` em `next.config.ts`.
- Sidebar vira drawer em telas pequenas (RNF10, público mobile).
- Fora desta etapa: cartão do local, mapa real, rota, persistência de idioma.

## Etapa 2 — Mapa real (RF01, 8 SP) — feito, com itens adiados
Decisões do time nesta etapa: mapa restrito ao campus da UFRPE, coordenadas só do enquadramento do campus (sem marcadores até haver posições reais), cache adiado, tiles do OSM público, popup simples com o nome.
1. [feito] `leaflet@1.9.4`, `react-leaflet@5.0.0` e `@types/leaflet@1.9.22` (versões exatas). Mapa carregado só no cliente: `MapView` (`dynamic`, `ssr: false`) → `MapCanvas`; `MapLoading` aparece durante o carregamento.
2. [feito] Tiles do OSM em `data/mapConfig.ts` (URL, atribuição, zoom máx. 19). Atribuição visível, sem prefetch. Mapa travado no campus: `CAMPUS_BOUNDS` vem do polígono "Universidade Federal Rural de Pernambuco - UFRPE" do OSM (lat -8.02296 a -8.01225, lng -34.9557 a -34.9432), com folga de ~330 m (`MAP_MAX_BOUNDS`); o zoom mínimo é calculado para mostrar essa área inteira (hoje 15 num desktop, 16 é o enquadramento inicial). Não é fonte oficial da UFRPE.
3. [parcial] `Place` ganhou `coords?` e `getMapPlaces()` em `placesService`; `MapCanvas` desenha marcadores (ícone `divIcon`, popup com o nome). Nenhum local do mock tem `coords`, então hoje não aparece marcador.
4. [adiado] Cache local dos pontos de interesse (RNF03): decidido fazer junto da Etapa 5, quando houver dados da API. Imagens leves (RNF01): ainda não há imagens de locais.
- Verificado: `tsc`, `eslint` e `next build` sem erros; página renderizada em Edge headless com tiles do OSM carregados, zoom traduzido e busca/idioma acima do mapa; marcador testado com coordenada temporária (revertida), com `tabindex` e `role="button"`.
- Limites testados em Edge headless com eventos sintéticos de mouse: arrastar até as quatro bordas para em cada limite com folga (oeste, leste, norte e sul conferidos pela coordenada sob a tela).
- Não verificado: clique/popup e teclado em navegador interativo (extensão do Chrome indisponível na sessão), teste em celular real e em 3G, contraste e foco por ferramenta.
- Pendente: coordenadas reais dos locais e enquadramento oficial do campus (ver perguntas abertas).

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

## Perguntas abertas
- Quem fornece as coordenadas reais dos locais da Sede (fonte oficial da UFRPE ou levantamento em campo)?
- Os limites do campus (hoje do OSM, com folga de ~330 m) estão certos? Confirmar com a equipe/UFRPE e ajustar `CAMPUS_BOUNDS`.
- O OSM público basta em produção? Se o acesso crescer, será preciso outro provedor (decisão fora da stack atual).
- Etapa 5: validade do cache dos pontos de interesse (RNF03) e se vale um Service Worker para uso offline.
- Está liberada a vulnerabilidade reportada pelo `npm audit` em `next` 16.0.0–16.3.7 (high)? Não veio desta etapa; precisa de avaliação do time.
