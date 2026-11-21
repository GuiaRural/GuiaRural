// CT-038.04: o botão amarelo da busca abre o traçado de rota; o painel só monta o endereço que o MapExplorer
// já entende (?rota=<destino>&origem=<id|gps:lat,lng>). A posição do GPS nunca sai do navegador (RNF04).
import assert from "node:assert/strict";
import { test } from "node:test";
import { routeHref } from "../src/app/lib/routeLink";

test("origem manual: o id do prédio ou da portaria vai na URL", () => {
  assert.equal(routeHref("biblioteca", { placeId: "portaria-principal" }), "/?rota=biblioteca&origem=portaria-principal");
});

test("origem pelo GPS: coordenadas com 6 casas, no formato gps:lat,lng", () => {
  assert.equal(
    routeHref("ceagri-1", { gps: { lat: -8.01781423456, lng: -34.9441041 } }),
    "/?rota=ceagri-1&origem=gps:-8.017814,-34.944104",
  );
});
