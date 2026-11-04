// Carregado com `node --import` pelo script `npm test`: testes com o executor nativo do Node, sem dependências novas.
import { register } from "node:module";

register("./ts-resolve-hooks.mjs", import.meta.url);
