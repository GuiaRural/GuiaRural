// UC09 — Acessar cartilha cultural: alternância de idioma (RN-02) e fallback para o português (RN-03 / FE01).
import assert from "node:assert/strict";
import { test } from "node:test";
import { isFullyTranslated, translate } from "../src/app/services/guidesService";

test("RN-02: devolve o texto no idioma escolhido quando há tradução", () => {
  const text = { pt: "Convivência", en: "Living together", es: "Convivencia" };
  assert.deepEqual(translate(text, "en"), { text: "Living together", fallback: false });
  assert.deepEqual(translate(text, "es"), { text: "Convivencia", fallback: false });
});

test("RN-03 / FE01: sem tradução, mostra o português e sinaliza o fallback", () => {
  assert.deepEqual(translate({ pt: "Documentação" }, "en"), { text: "Documentação", fallback: true });
  assert.deepEqual(translate({ pt: "Documentação", en: "" }, "es"), { text: "Documentação", fallback: true });
});

test("em português nunca há fallback", () => {
  assert.deepEqual(translate({ pt: "Guia do calouro" }, "pt"), { text: "Guia do calouro", fallback: false });
});

test("isFullyTranslated considera título, resumo, blocos e links", () => {
  const topic = {
    id: "t-teste",
    section: "cultura",
    title: { pt: "Título", en: "Title" },
    summary: { pt: "Resumo", en: "Summary" },
    blocks: [{ type: "p", text: { pt: "Parágrafo", en: "Paragraph" } }],
    links: [{ url: "/acolhimento/documentos", label: { pt: "Documentos" } }],
  } as unknown as Parameters<typeof isFullyTranslated>[0];
  assert.equal(isFullyTranslated(topic, "pt"), true);
  assert.equal(isFullyTranslated(topic, "en"), false); // o link ainda não tem rótulo em inglês
});
