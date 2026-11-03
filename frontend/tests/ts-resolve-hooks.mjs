// O código do app importa módulos sem extensão ("../lib/storage"), como o Next/bundler permite.
// O Node exige a extensão; este hook tenta de novo com ".ts" quando um import relativo não é encontrado.
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (err) {
    if (err?.code === "ERR_MODULE_NOT_FOUND" && /^\.\.?\//.test(specifier)) return next(`${specifier}.ts`, context);
    throw err;
  }
}
