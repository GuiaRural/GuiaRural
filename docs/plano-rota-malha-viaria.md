# Plano: rota pela malha viária (RF02, RNF08)

> Escrito em 15/11/2026. Complementa a etapa 4 de `plano-implementacao-home.md` e o backlog de `plano-integracao-banco.md`.
> Fonte de verdade: Documento de Visão e de Arquitetura. Em conflito, eles valem mais que este plano.

## 1. Situação de partida
- `frontend/src/app/services/routeService.ts`: `computeRoute` é **síncrono** e liga origem e destino em **linha reta**, a 80 m/min (`lib/geo.ts`). Subestima a distância real a pé. O próprio arquivo já diz que a troca de provedor acontece só ali (Facade, RNF08).
- Consumidores: `MapExplorer` (polilinha e painel de rota), `PlaceCard` e `locais/[id]` (só distância e tempo a partir da Reitoria, `DEFAULT_ORIGIN_ID`).
- Limites do campus: `CAMPUS_BOUNDS` em `data/mapConfig.ts` (polígono do OSM, não oficial).
- Restrições do projeto: RNF08 (APIs externas atrás de Facade), RNF01 (3G/4G, poucas requisições), RNF03 (cache offline), RNF04 (sem rastreio nem histórico de rotas), sem biblioteca ou serviço novo sem consultar o time, sem mapeamento interno de prédios.

## 2. Decisões (D19, 15/11/2026)
| # | Decisão | Valor |
|---|---|---|
| D19.1 | Onde calcular a rota | **No navegador, sobre um grafo do campus** (opção C). Descartados: provedor externo (a posição do GPS iria a terceiro, RNF04; o OSRM público não serve para produção; uma requisição por cartão no 3G) e backend próprio (cada rota passa pelo servidor). A Facade continua, com interface de provedor, para trocar por OSRM/ORS no futuro sem mexer nas telas. |
| D19.2 | Modos no MVP | **Só a pé.** Bicicleta e "acessível" ficam de fora: o OSM raramente tem `wheelchair`, `incline` e `smoothness` no campus, e "acessível" sem dado seria uma promessa falsa. |
| D19.3 | Vias `access=private` | Entram no grafo **depois de revisão caso a caso** (campus costuma marcar como privadas vias que as pessoas usam). O relatório da etapa 0 lista cada uma. |
| D19.4 | Coleta dos dados | Script de **desenvolvimento** que lê o OSM, sem uso em runtime e sem biblioteca nova. |
| D19.5 | Onde fica o grafo | **Arquivo estático no repositório** (`frontend/public/campus-graph.json`), revisado em PR. Servir pelo backend só se a atualização ficar frequente. |

> D19.3 a D19.5 foram assumidas com o padrão recomendado quando o time respondeu "sim" ao plano. Dizer se alguma deve mudar.

## 3. Etapas
**Etapa 0 — Viabilidade dos dados.** Medir no OSM: quantas vias, de que tipo, quantas com `foot=no` ou `access=private`, componentes desconectados, e quantos locais publicados ficam a mais de 40 m de uma via. Decide se o OSM basta ou se precisa ser corrigido antes. Resultado em `## 5`.

**Etapa 1 — Gerador do grafo.** Script de desenvolvimento que gera `frontend/public/campus-graph.json`: nós de grau 2 colapsados em polilinhas, coordenadas inteiras (1e-5), data da extração, caixa e atribuição ODbL. Gera também um relatório de qualidade (ilhas desconectadas, locais longe de vias). **Feita em 15/11/2026** (`feat/rota-gerador-grafo`): ver `## 7`.

**Etapa 2 — Biblioteca de roteamento pura (`lib/routing`).** Montar o grafo, encaixar o ponto na via mais próxima (projeção no segmento, com nó virtual) e rodar A*. Sem caminho ou sem grafo: linha reta marcada como estimativa. Testes com `node:test` em grafos sintéticos (menor caminho, encaixe, desconexão, determinismo, tempo). **Feita em 15/11/2026** (`feat/rota-biblioteca`): ver `## 8`.

**Etapa 3 — Facade assíncrona.** `getRoute(origem, destino): Promise<Route>`, com `source: "network" | "straight"`. O grafo carrega sob demanda, fora do bundle principal. `MapExplorer`, `PlaceCard` e `locais/[id]` passam a usar `useApi` com chave `origem|destino`. **Feita em 15/11/2026** (`feat/rota-facade-telas`): ver `## 9`. A etapa 4 (interface) entrou junto: o trecho tracejado, o aviso de estimativa e a atribuição já estão nas telas.

**Etapa 4 — Interface.** Trecho final tracejado do ponto da via até o prédio (o local é um ponto, não uma entrada), aviso "estimativa em linha reta" e atribuição ao OSM nos três idiomas (dicionário, EN/ES para revisão humana).

**Etapa 5 — Fechamento.** Validar de 5 a 10 rotas a pé no campus e ajustar os 80 m/min; atualizar `CLAUDE.md` e o plano; verificar no navegador.

## 4. Fora do escopo desta fase
Bicicleta e acessível (D19.2) · instruções passo a passo (só valem com vias nomeadas) · cache offline do grafo (RNF03, tarefa própria) · entrada do prédio como campo do local (D1 mantém o local mínimo).

## 5. Riscos
- OSM do campus incompleto ou com vias `private` caminháveis: é a incerteza principal; a etapa 0 mede.
- Os locais vêm do Google Places e ainda não foram conferidos em campo: parte dos encaixes terá distâncias grandes.
- A rota vai ao centro do prédio enquanto o modelo não tiver entrada.
- 80 m/min ignora ladeira e calor.
- Licença: dados do OSM (ODbL) exigem atribuição onde a rota aparecer.
- `computeRoute` hoje é síncrono: os três consumidores ganham estado de carregamento.

## 6. Resultado da etapa 0 (15/11/2026)
**Como foi medido:** consulta ao Overpass (`way["highway"]`) na caixa `MAP_MAX_BOUNDS` (campus mais ~330 m de folga), cruzada com os locais do banco (somente leitura). Script descartável, fora do repositório; o gerador definitivo é a etapa 1. **Não** verifiquei em campo nem no mapa: é só o que o OSM tem hoje.

**Veredito: a opção C (grafo do campus no navegador) é viável.** O OSM do campus tem malha suficiente e quase toda conectada.

| Medida | Resultado |
|---|---|
| Vias `highway` na caixa | 490: `residential` 167, `service` 114, `footway` 86, `path` 45, `secondary` 41, `trunk` 14, `steps` 9, demais 14 |
| Classificação | 448 caminháveis · **25 `access=private` a revisar** · 16 descartadas por tipo (`trunk` e `trunk_link`) · 1 `area=yes` |
| Tamanho do grafo | **só o campus:** 266 vias, 1.666 nós, 33,4 km, JSON estimado ~38 KB · **campus + 165 m de folga:** 361 vias, 2.224 nós, 47,5 km, ~51 KB (antes de comprimir). Cabe folgado num arquivo estático |
| Conectividade (caixa inteira) | 98% do comprimento num só componente (57,8 de 59,0 km); 9 ilhas |
| Conectividade (campus + folga) | 10 componentes. **2 ilhas dentro do campus:** 273 m em (-8.02215, -34.94341) e 193 m em (-8.01405, -34.94809), que parecem ligações faltando no OSM. As outras 7 ficam fora do campus |
| Acessibilidade no OSM | `wheelchair`, `incline` e `tactile_paving`: **0 vias**. Confirma D19.2 (nada de modo "acessível") |
| Nomes e superfície | 263 de 490 vias com nome; 350 sem `surface` |
| Locais publicados (35) × via mais próxima | mediana **17 m**, p90 44 m, máx. 115 m. Acima de 40 m: 5; acima de 80 m: 1 |
| Locais longe da via | `teste` 115 m, `teste-2` 70 m, `medvet` 55 m, `propesq` 44 m, `hovet` 42 m |
| Local que encaixa numa ilha | `propesq` (a via mais próxima está fora do componente principal) |
| Incluir as 25 vias `private` | acrescenta 2,8 km e nenhuma mudou o encaixe de local algum. Das 12 primeiras, 10 são `service` sem nome e 2 são ruas nomeadas (Avenida Luiz Antonio de Araujo, Rua Alfredo Vieira) |

**Achados fora do roteamento:**
- Há dois locais **publicados** de teste no banco (`teste` e `teste-2`, nome "teste"), além de `teste-3` em rascunho. Eles aparecem no mapa público e distorcem esta estatística (sem eles, só 3 locais passam de 40 m).
- 3 locais em rascunho não têm coordenada (`auditorio-novo`, `casa-samyr-pessoa`, `ceu`): não entram em rota até serem georreferenciados.

**O que muda no plano:**
1. **Etapa 1** recorta o grafo no campus com ~165 m de folga (as ruas das portarias), cerca de 50 KB.
2. **Duas ligações faltando no OSM dentro do campus** precisam ser conferidas e, se confirmadas, corrigidas no OpenStreetMap (a correção entra no grafo na próxima extração). Enquanto não forem, o roteador cai em linha reta para quem estiver nessas ilhas, e o relatório da etapa 1 lista cada uma.
3. **D19.3:** revisar as 25 vias `private` uma a uma no relatório. O relatório da etapa 1 vai listar todas por id.
4. Locais a mais de 40 m de uma via (`medvet`, `propesq`, `hovet`) ganham o trecho final tracejado; conferir em campo junto com a conferência das coordenadas que já está pendente.

## 7. Resultado da etapa 1 (15/11/2026)
**O que existe:** `npm run graph` (em `frontend`) lê o OSM e grava `frontend/public/campus-graph.json` e `docs/rota-malha-relatorio.md`.
- Código: `frontend/scripts/campus-graph/build.ts` (funções puras, testadas sem rede), `report.ts` (Markdown) e `frontend/scripts/build-campus-graph.ts` (leitura, gravação e Overpass). Sem dependência nova.
- Decisões de revisão em `frontend/scripts/campus-graph.config.json`: `includePrivateWays`, `excludeWays`, `padding` e `keepIslands`. Hoje: nada liberado, nada excluído, ilhas fora do arquivo.
- Opções: `--places <arquivo|url>` confere os locais (arquivo JSON ou `GET /api/places`), `--input` usa um download já salvo, `--save-raw` guarda o que veio do OSM.
- Saída determinística (nós ordenados pelo id do OSM): atualizar o grafo gera um diff pequeno e revisável no PR.

**Formato do arquivo (`version` 1):** `nodes` = `[lat, lng, ...]` inteiros em 1e-5 grau (cruzamentos e pontas) e `edges` = `[de, para, metros, flags, [lat, lng, ...]]`, com os pontos do meio da via como geometria. `flags`: 1 = escada. Sem sentido único (a pé). Cabeçalho com data, fonte (ODbL) e caixa consultada.

**Grafo gerado hoje:** 492 nós, 608 arestas, 44,7 km, **46 KB (14 KB comprimido)**, um só componente. Os números do relatório batem com os da etapa 0 (35 locais publicados, mediana de 17 m até a via, p90 44 m, 5 acima de 40 m).

**O que o relatório mostra e ainda precisa de gente:**
1. **Ilhas dentro do campus** (D19, "ligações que faltam no OSM"): a de 193 m em (-8.01412, -34.94780) tem **folga de só 3,4 m** até o componente principal, quase certamente um nó que falta ligar; a de 273 m em (-8.02220, -34.94345) tem folga de **74 m**, então ali pode haver um caminho de fato não mapeado. As outras 7 ilhas ficam fora do campus.
2. **Vias `access` restrito:** 25 na caixa, **10 passam pelo campus**: 3 `service` sem nome (24, 37 e 40 m) e 7 ruas nomeadas do entorno (Priverde, Avenida Arnaldo Paes de Andrade, Rua do Afeto, entre outras). **Nenhuma liga duas partes do grafo**, então não liberar nenhuma não isola ninguém; liberar só faz sentido onde se confirmar que o pedestre passa.
3. **Locais longe da via** (acima de 40 m): `teste`, `teste-2` (locais de teste publicados), `medvet` 55 m, `propesq` 44 m, `hovet` 42 m.

**Limites:** o Overpass é instável (502 e timeouts em 3 de 4 tentativas hoje); o script tenta dois espelhos e falha sem gravar nada se nenhum responder. O arquivo gerado hoje usou o download da etapa 0, feito no mesmo dia com a mesma consulta (`--input`).

**Atualização do grafo em 15/11/2026** (depois da correção no OSM): download direto do Overpass pelo próprio `npm run graph` (valida o caminho de rede que a primeira geração não exercitou). 498 nós, 615 arestas, 44,9 km, 46 KB.
- A ilha de 193 m (calçadas perto de `propesq`, `medvet` e `hovet`) **foi ligada ao resto**: componentes 10 → 9, ilhas dentro do campus 2 → 1.
- `propesq` deixou de ter a via mais próxima numa ilha e saiu da lista de locais a mais de 40 m (44 m → dentro do limite); acima de 40 m ficam 4 (`teste`, `teste-2`, `medvet`, `hovet`).
- Resta a ilha de 273 m (vias `service` sem nome, folga de 74 m), a mais de 1 km de qualquer local com problema; segue sem ação até alguém confirmar no local se existe uma entrada.
- Os números de "vias lidas" (490 → 371) e "access restrito" (25 → 10) caíram porque a primeira geração usou o download da etapa 0, que cobria a caixa maior do mapa; o grafo em si cresceu (+6 nós, +7 arestas).

## 8. Resultado da etapa 2 (15/11/2026)
**O que existe** (`frontend/src/app/lib/routing/`, puro, sem rede nem DOM, sem dependência nova):
- `format.ts`: o contrato do arquivo (`CampusGraph`, `GRAPH_SCALE`, `FLAG_STEPS`) e `parseGraph`, que recusa versão errada, escala errada, pares de coordenadas incompletos e índices fora da lista. O gerador (`scripts/campus-graph/build.ts`) passou a importar daqui: um só dono do formato.
- `network.ts`: `buildNetwork` decodifica o arquivo (graus, geometria de ponta a ponta, arestas por nó); `snapToNetwork` encaixa um ponto na via mais próxima **em qualquer ponto da aresta**, não só nos cruzamentos; `pointsBetween` devolve o trecho de uma aresta na ordem percorrida.
- `router.ts`: `findRoute(rede, origem, destino)`. Origem e destino viram dois nós virtuais ligados às pontas da aresta em que caíram, e a busca é um A* com heap binário (heurística: linha reta até o destino). Devolve `points` prontos para desenhar (origem, trecho de acesso, vias, trecho de acesso, destino), `meters`, `networkMeters`, `accessMeters` (o trecho em linha reta entre o ponto e a via, que não é via mapeada), `network` e `stepsMeters` (escada, só informativo). Devolve **null** quando não há caminho ou quando origem ou destino ficam a mais de 150 m de qualquer via: é o sinal para a Facade (etapa 3) cair na linha reta marcada como estimativa.
- Posições nas arestas usam os metros do arquivo; a geometria quantizada (1e-5 grau) pode diferir centímetros do comprimento gravado, e uma razão converte entre as duas medidas.

**Testes** (`tests/routing.test.ts`, 16 novos, 132 no total): grafos pequenos montados à mão (L, meio de via, mesma via, dois caminhos, geometria, desconexão, limite de encaixe, escada, validação do formato) e **conferência contra o grafo real** (`public/campus-graph.json` e `tests/fixtures/campus-places.json`, os 33 locais publicados reais, sem os de teste):
- todo local publicado tem rota desde a Reitoria, nunca menor que a linha reta (menos a folga de encaixe);
- ida e volta dão a mesma distância (±1 m);
- o A* dá o mesmo comprimento que o Dijkstra puro em mais de 50 pares;
- **0,55 ms por rota em média** (limite do teste: 25 ms).

**Números reais, partindo da Reitoria (32 locais):** razão rota/linha reta mínima 1,12, **mediana 1,30**, máxima 2,90. Rota mais longa: `deagri`, 1.085 m. Só `cegen` tem escada no caminho (7 m).

**Para conferir em campo ou no OSM (razão rota/reta alta):** `hovet` (239 m em reta, 694 m de rota, 2,9x), `medvet` (254 → 699 m, 2,75x) e `cegen` (197 → 511 m, 2,6x). Podem ser desvios reais (cerca, prédio no meio) ou atalhos que faltam no OSM; é o mesmo conjunto de locais que passou de 40 m de via no relatório do grafo. `quimica` tem razão 2,7x, mas em 44 m de reta (119 m de rota), o que pesa pouco.

**Limites:** o grafo ainda não é carregado por nenhuma tela (etapa 3); a velocidade a pé segue em 80 m/min até a validação em campo (etapa 5); o encaixe percorre todos os segmentos (~2 mil), suficiente neste tamanho de grafo.

## 9. Resultado da etapa 3 (15/11/2026)
**Facade (`services/routeService.ts`):** `computeRoute(origem, destino)` agora é **assíncrona** e devolve `Route` com `points` (desenho completo), `solid` (vias, linha cheia), `dashed` (trechos que não são via mapeada), `meters`, `minutes`, `stepsMeters` e `source` (`"network"` ou `"straight"`).
- O grafo é buscado em `/campus-graph.json` **uma vez por sessão** (várias rotas ao mesmo tempo compartilham a mesma busca) e montado por `buildNetwork`. Fica fora do bundle principal.
- **Nunca rejeita.** Sem o arquivo (404), com o arquivo corrompido ou de outra versão, sem caminho, ou com origem/destino a mais de 150 m de via, devolve a **linha reta marcada como estimativa** (`source: "straight"`, toda tracejada). Falha de rede não fica gravada: a próxima rota tenta de novo.
- `getRoute(chave)` existe porque o `useApi` aceita um argumento só: a chave é `"lat,lng>lat,lng"` (6 casas); chave vazia (`NO_ROUTE`) = sem rota.

**Telas** (as três que usavam a rota em linha reta):
- `MapExplorer`: pede a rota quando há `?rota=` e **só monta o mapa depois que ela fica pronta**, porque o `CampusMap` enquadra o trajeto apenas na montagem. O painel mostra o aviso de estimativa (âmbar), os metros de escada quando houver e a atribuição ao OSM quando a rota veio da malha.
- `CampusMap`: `routeSolid` (linha cheia com contorno branco) e `routeDashed` (azul pontilhado); sem eles, `route` vai todo em linha cheia como antes.
- `PlaceCard` e `locais/[id]`: distância e tempo desde a Reitoria pela malha; na estimativa, o cartão mostra "≈" e a página mostra o aviso.
- Dicionário (PT/EN/ES): `route.estimate`, `route.steps` e `route.attribution`. EN e ES precisam de revisão humana.

**Verificado no navegador** (Next em modo dev com um servidor de mentira para `/api/places` servindo os 33 locais reais; não toquei no banco nem no backend):
- Reitoria → Biblioteca Central: linha cheia pelas vias com um trecho pontilhado em cada ponta, painel com **313 m e 4 min** e a atribuição "Caminhos: © colaboradores do OpenStreetMap".
- Origem em (-8.0300, -34.9400), fora do campus: linha reta tracejada, **2.057 m e 26 min**, aviso "Estimativa em linha reta: o caminho pelas vias não está disponível." e sem atribuição.
- Página do local e cartão da Biblioteca: **313 m, 4 min**, os mesmos números do painel.
- Console sem erros.

**Testes** (`tests/route-service.test.ts`, 7 novos, 139 no total): rota pela malha com acessos tracejados, uma única busca do grafo, 404, grafo corrompido, falha de rede seguida de recuperação, ponto fora do campus e a chave de texto.

**Não verificado:** a troca de idioma na tela da rota (EN/ES); o toque no celular; o comportamento com o backend real (só o servidor de mentira); nada foi conferido a pé no campus (etapa 5). O mapa remonta quando a rota muda de origem pela URL (carrega de novo o enquadramento), como já remontava ao trocar de idioma.

