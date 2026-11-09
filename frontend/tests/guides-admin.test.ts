// Painel do guia: ida e volta entre o JSON por idioma da API e o {pt, en, es} do editor.
import assert from "node:assert/strict";
import { test } from "node:test";
import { toGuideTopic, toWriteDto } from "../src/app/services/guidesAdminService";
import { isFullyTranslated } from "../src/app/services/guidesService";

type Dto = Parameters<typeof toGuideTopic>[0];

const FULL_EN: Dto = {
  slug: "cpf",
  section: "documentos",
  stage: "chegada",
  title: { pt: "CPF", en: "Tax ID", es: null },
  summary: { pt: "Resumo", en: "Summary", es: null },
  blocks: {
    pt: [
      { type: "p", text: "Texto" },
      { type: "list", items: ["a", "b"] },
    ],
    // "b" é igual ao português, mas o idioma está totalmente traduzido: é tradução, não fallback.
    en: [
      { type: "p", text: "Text" },
      { type: "list", items: ["a-en", "b"] },
    ],
    es: null,
  },
  links: { pt: [{ label: "Portal", url: "https://x.test" }], en: [{ label: "Portal", url: "https://x.test" }], es: null },
  source: { pt: "Cartilha", en: null, es: null },
  placeSlug: "reitoria",
  fullyTranslatedLangs: ["en"],
};

function withoutSlug(dto: Dto) {
  const rest: Partial<Dto> = { ...dto };
  delete rest.slug;
  return rest;
}

test("idioma totalmente traduzido: mantém todos os textos, mesmo os iguais ao português", () => {
  const topic = toGuideTopic(FULL_EN);
  assert.equal(topic.id, "cpf");
  assert.equal(topic.placeId, "reitoria");
  assert.deepEqual(topic.title, { pt: "CPF", en: "Tax ID" });
  assert.deepEqual(topic.blocks[1], { type: "list", items: [{ pt: "a", en: "a-en" }, { pt: "b", en: "b" }] });
  assert.equal(isFullyTranslated(topic, "en"), true);
  assert.equal(isFullyTranslated(topic, "es"), false);
});

test("idioma incompleto: o português que o servidor pôs no lugar não conta como tradução", () => {
  const partial: Dto = { ...FULL_EN, fullyTranslatedLangs: [] };
  const topic = toGuideTopic(partial);
  // "b" voltou igual ao português: é o fallback do servidor, então o campo fica sem tradução.
  assert.deepEqual(topic.blocks[1], { type: "list", items: [{ pt: "a", en: "a-en" }, { pt: "b" }] });
  assert.equal(isFullyTranslated(topic, "en"), false);
});

test("ida e volta: editar sem mudar nada reproduz o que o servidor mandou", () => {
  assert.deepEqual(toWriteDto(toGuideTopic(FULL_EN)), withoutSlug(FULL_EN));
  const partial: Dto = { ...FULL_EN, fullyTranslatedLangs: [] };
  assert.deepEqual(toWriteDto(toGuideTopic(partial)), withoutSlug(partial));
});

test("idioma sem nenhum texto traduzido vai como nulo, não como cópia do português", () => {
  const dto = toWriteDto(toGuideTopic(FULL_EN));
  assert.equal(dto.blocks.es, null);
  assert.equal(dto.links.es, null);
  assert.equal(dto.title.es, null);
});

test("traduzir um texto no editor completa o idioma e preenche o resto com o português", () => {
  const topic = toGuideTopic({ ...FULL_EN, fullyTranslatedLangs: [] });
  topic.title.es = "CPF (es)";
  const dto = toWriteDto(topic);
  assert.equal(dto.title.es, "CPF (es)");
  // O espanhol agora existe: os blocos vão em espanhol onde há, e em português onde falta.
  assert.deepEqual(dto.blocks.es, [
    { type: "p", text: "Texto" },
    { type: "list", items: ["a", "b"] },
  ]);
  assert.deepEqual(dto.fullyTranslatedLangs, []);
});

test("fullyTranslatedLangs é recalculado pelo conteúdo, não copiado do servidor", () => {
  const topic = toGuideTopic(FULL_EN);
  topic.links[0].label = { pt: "Portal" }; // tira a tradução do link
  assert.deepEqual(toWriteDto(topic).fullyTranslatedLangs, []);
});
