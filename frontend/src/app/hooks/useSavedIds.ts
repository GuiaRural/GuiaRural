"use client";

import { useSyncExternalStore } from "react";

const EMPTY = "[]";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function readRaw(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? EMPTY;
  } catch {
    return EMPTY;
  }
}

function parseIds(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

// Itens salvos ficam só no navegador (RNF04, sem login).
export function useSavedIds(key: string) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => EMPTY,
  );
  const ids = parseIds(raw);

  function toggle(id: string) {
    const next = ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id];
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      return;
    }
    listeners.forEach((callback) => callback());
  }

  return { ids, toggle };
}
