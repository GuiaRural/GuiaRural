# Relatório do grafo de caminhada do campus

Gerado em 2026-11-15 por `npm run graph` (frontend), a partir do OpenStreetMap (ODbL). Arquivo: `frontend/public/campus-graph.json`.
Não substitui a conferência em campo: é o que o OSM tem hoje.

## Resumo

- Vias com `highway` lidas: **371**; caminháveis 351, com `access` restrito 10 (10 passam pelo campus e estão na tabela abaixo), descartadas 10.
- Vias que passam pelo campus (com folga): 361. Nós ausentes na resposta do OSM: 0.
- **Grafo gravado:** 498 nós, 615 arestas, 44.9 km, 46 KB (sem comprimir).
- Componentes conexos: 9; o maior tem 44.9 km e é o único gravado (as ilhas ficam de fora).
- Tipos de via: residential 128, service 97, footway 78, path 24, secondary 20, trunk 8, steps 6, tertiary 4, track 2, pedestrian 2, trunk_link 1, unclassified 1.

## Vias `access` restrito (revisar uma a uma, D19.3)

Decisão em `scripts/campus-graph.config.json` (`includePrivateWays`). "Liga componentes" indica quantos componentes a via toca: com 2 ou mais, liberar a via junta pedaços do grafo.

| Via (OSM) | Tipo | Nome | Metros | Liga componentes |
|---|---|---|---|---|
| [250009110](https://www.openstreetmap.org/way/250009110) | service | — | 24 | 1 |
| [573293573](https://www.openstreetmap.org/way/573293573) | service | — | 40 | 1 |
| [573293589](https://www.openstreetmap.org/way/573293589) | service | — | 37 | 1 |
| [609330639](https://www.openstreetmap.org/way/609330639) | service | Rua Principal Priverde | 307 | 1 |
| [609330641](https://www.openstreetmap.org/way/609330641) | service | Rua Direita Priverde | 306 | 0 |
| [649783376](https://www.openstreetmap.org/way/649783376) | residential | Avenida Luiz Antônio de Araújo | 28 | 0 |
| [649784560](https://www.openstreetmap.org/way/649784560) | residential | Rua Prefeito Agostinho Nunes Machado | 38 | 0 |
| [649784561](https://www.openstreetmap.org/way/649784561) | residential | Avenida Arnaldo Paes de Andrade | 68 | 0 |
| [806820860](https://www.openstreetmap.org/way/806820860) | residential | Rua do Afeto | 89 | 1 |
| [806820861](https://www.openstreetmap.org/way/806820861) | residential | Avenida Arnaldo Paes de Andrade | 189 | 0 |

## Ilhas (partes desconectadas)

Uma ilha dentro do campus costuma ser uma ligação que falta no OSM. A folga é a menor distância até o componente principal.

| Metros | Vias | Centro (lat, lng) | Dentro do campus | Folga até o principal (m) |
|---|---|---|---|---|
| 273 | 8 | -8.02220, -34.94345 | **sim** | 74.3 |
| 377 | 5 | -8.01786, -34.94216 | não | 35.2 |
| 283 | 2 | -8.02098, -34.94252 | não | 215.3 |
| 156 | 2 | -8.01062, -34.94492 | não | 82.2 |
| 135 | 1 | -8.01970, -34.94252 | não | 175.3 |
| 98 | 1 | -8.02030, -34.94298 | não | 145.9 |
| 73 | 1 | -8.02071, -34.94191 | não | 255.7 |
| 72 | 1 | -8.01916, -34.94271 | não | 98.4 |

## Locais x via mais próxima

Locais publicados com coordenada: **35**. Distância até a via do componente principal: mediana 17 m, p90 42 m, máxima 115 m.

Acima de 40 m (o trecho final até o prédio vai tracejado; conferir a coordenada em campo):

- `teste`: 115 m
- `teste-2`: 70 m
- `medvet`: 55 m
- `hovet`: 42 m

Nenhum local tem a via mais próxima numa ilha.

