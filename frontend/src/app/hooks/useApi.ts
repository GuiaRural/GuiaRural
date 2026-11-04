"use client";

import { useEffect, useState } from "react";

export type ApiState<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "error"; error: unknown };

type Settled<T> = { key: string; data: T } | { key: string; error: unknown };

// `load` deve ser uma função estável (de módulo): a chamada refaz quando `arg` muda ou em `retry()`.
export function useApi<T, A>(load: (arg: A) => Promise<T>, arg: A): ApiState<T> & { retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const key = `${String(arg)}#${attempt}`;

  useEffect(() => {
    let cancelled = false;
    load(arg).then(
      (data) => !cancelled && setSettled({ key, data }),
      (error) => !cancelled && setSettled({ key, error }),
    );
    return () => {
      cancelled = true;
    };
  }, [load, arg, key]);

  const retry = () => setAttempt((n) => n + 1);
  if (!settled || settled.key !== key) return { status: "loading", retry };
  if ("error" in settled) return { status: "error", error: settled.error, retry };
  return { status: "ready", data: settled.data, retry };
}
