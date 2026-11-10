"use client";

import { useState } from "react";
import AppShell from "../components/common/AppShell";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import ServiceCard from "../components/services/ServiceCard";
import { useLanguage } from "../context/LanguageContext";
import { useApi } from "../hooks/useApi";
import { categoriesOf, filterServicos, listServicosPublicos } from "../services/servicosService";

const noArg = null;

const chip = "rounded-full px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700";

// UC11 — catálogo público de serviços estudantis. Só aparecem os publicados no painel (/admin/servicos).
export default function ServicesPage() {
  const { t } = useLanguage();
  const state = useApi(listServicosPublicos, noArg);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const servicos = state.status === "ready" ? state.data : null;
  const categories = servicos ? categoriesOf(servicos) : [];
  const visible = servicos ? filterServicos(servicos, query, category) : [];
  const filtering = Boolean(query.trim() || category);

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-navy-900">{t.services.title}</h1>
              <p className="mt-1 text-sm text-text-2nd">{t.services.subtitle}</p>
            </div>
            <LanguageSwitcher />
          </div>

          {t.services.portugueseOnly && <p className="mt-4 text-xs text-text-2nd">{t.services.portugueseOnly}</p>}

          {state.status === "error" && (
            <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {t.services.error}{" "}
              <button type="button" onClick={state.retry} className="font-semibold underline">
                {t.services.retry}
              </button>
            </div>
          )}
          {state.status === "loading" && <p className="mt-6 text-sm text-slate-600">{t.common.loading}</p>}
          {servicos?.length === 0 && <p className="mt-6 rounded-lg bg-white p-4 text-sm text-slate-600 shadow-sm">{t.services.empty}</p>}

          {servicos && servicos.length > 0 && (
            <>
              <div className="mt-6 space-y-3">
                <label className="block">
                  <span className="sr-only">{t.services.searchLabel}</span>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.services.searchPlaceholder}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-navy-700"
                  />
                </label>
                {categories.length > 1 && (
                  <div role="group" aria-label={t.services.categoryFilter} className="flex flex-wrap gap-2">
                    {["", ...categories].map((c) => {
                      const selected = c === category;
                      return (
                        <button
                          key={c || "all"}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setCategory(c)}
                          className={`${chip} ${selected ? "bg-navy-700 text-white" : "bg-white text-navy-700 ring-1 ring-slate-300 hover:bg-slate-100"}`}
                        >
                          {c || t.services.allCategories}
                        </button>
                      );
                    })}
                  </div>
                )}
                <p role="status" className="text-xs text-text-2nd">
                  {visible.length} {t.services.resultsCount}
                </p>
              </div>

              {visible.length === 0 ? (
                <p className="mt-4 rounded-lg bg-white p-4 text-sm text-slate-600 shadow-sm">
                  {t.services.noResults}{" "}
                  {filtering && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setCategory("");
                      }}
                      className="font-semibold text-navy-700 underline"
                    >
                      {t.services.clearFilters}
                    </button>
                  )}
                </p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {visible.map((servico) => (
                    <li key={servico.id}>
                      <ServiceCard servico={servico} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
