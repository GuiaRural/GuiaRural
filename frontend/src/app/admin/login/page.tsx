"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { login } from "../../services/authService";

const MESSAGES = {
  required: "Preencha todos os campos obrigatórios para continuar.",
  domain: "O e-mail deve pertencer ao domínio institucional @ufrpe.br.",
  invalid: "Não foi possível realizar o login. Verifique seus dados e tente novamente.",
  blocked: "Seu acesso ainda não foi liberado. Aguarde a aprovação ou entre em contato com a Coordenação de TI.",
} as const;

// UC12 — Fazer Login
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<keyof typeof MESSAGES | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgotInfo, setForgotInfo] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("required");
      return;
    }
    setSubmitting(true);
    const result = await login(email, password, remember);
    setSubmitting(false);
    if (result.ok) router.replace("/admin");
    else setError(result.reason);
  }

  const emailInvalid = error === "domain" || (error === "required" && !email.trim());
  const passwordInvalid = error === "required" && !password;

  return (
    <div className="flex min-h-dvh flex-col bg-navy-900">
      <header className="flex h-14 items-center gap-3 px-4 text-white">
        <div className="leading-tight">
          <p className="text-base font-semibold">GuiaRural</p>
          <p className="text-[10px] tracking-wide text-slate-300">UFRPE</p>
        </div>
      </header>
      <div className="flex items-center justify-between border-y border-white/10 px-4 py-2 text-[11px] text-slate-400">
        <span>Universidade Federal Rural de Pernambuco · GuiaRural UFRPE</span>
        <span className="hidden items-center gap-1 text-emerald-400 sm:flex">
          <span aria-hidden className="size-1.5 rounded-full bg-emerald-400" /> Conexão segura
        </span>
      </div>

      <main className="grid flex-1 place-items-center bg-[radial-gradient(ellipse_at_center,#1b2f6e_0%,#0d1b4c_60%)] px-4 py-10">
        <form onSubmit={handleSubmit} noValidate className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-2xl">
          <div className="mx-auto grid size-11 place-items-center rounded-xl bg-amber-100 text-amber-700" aria-hidden>
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </div>
          <h1 className="mt-3 text-center text-xl font-bold text-navy-900">Painel administrativo</h1>
          <p className="mt-1 text-center text-xs text-slate-500">Acesso restrito às equipes e setores da UFRPE</p>

          {error && (
            <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {MESSAGES[error]}
            </p>
          )}

          <label htmlFor="email" className="mt-5 block text-xs font-semibold text-slate-800">
            E-mail institucional
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="setor@ufrpe.br"
            value={email}
            aria-invalid={emailInvalid}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1 h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-brand-yellow ${
              emailInvalid ? "border-red-500" : "border-slate-300"
            }`}
          />

          <label htmlFor="password" className="mt-4 block text-xs font-semibold text-slate-800">
            Senha
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              aria-invalid={passwordInvalid}
              onChange={(e) => setPassword(e.target.value)}
              className={`h-10 w-full rounded-md border px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-brand-yellow ${
                passwordInvalid ? "border-red-500" : "border-slate-300"
              }`}
            />
            {/* FA-12.01: exibir senha */}
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 grid w-10 place-items-center text-slate-500 hover:text-slate-800"
            >
              <svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
                {showPassword && <path d="M3 3l18 18" strokeLinecap="round" />}
              </svg>
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-700">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 accent-navy-900" />
              Manter conectado
            </label>
            {/* FA-12.02: recuperação de senha é o UC41, fora deste escopo */}
            <button type="button" onClick={() => setForgotInfo(true)} className="font-semibold text-amber-700 hover:underline">
              Esqueci minha senha
            </button>
          </div>
          {forgotInfo && (
            <p role="status" className="mt-2 rounded-md bg-slate-50 p-2 text-[11px] text-slate-600">
              A recuperação de senha (UC41) ainda não está disponível. Procure a Coordenação de TI.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 h-11 w-full rounded-lg bg-brand-yellow text-sm font-bold text-navy-900 hover:brightness-95 disabled:opacity-70"
          >
            {submitting ? "Entrando..." : "Entrar"}
          </button>

          <p className="mt-5 border-t border-slate-200 pt-4 text-center text-[11px] text-slate-500">
            Ainda não tem acesso? Solicite ao seu setor ou à <strong className="text-navy-900">Coordenação de TI</strong>.
          </p>
          <Link href="/" className="mt-2 block text-center text-xs font-semibold text-navy-900 hover:underline">
            ← Voltar ao site público
          </Link>

          <p className="mt-4 rounded-md bg-slate-50 p-2 text-center text-[10px] text-slate-500">
            Ambiente de demonstração (sem backend): coord.ti@ufrpe.br / guiarural123
          </p>
        </form>
      </main>
    </div>
  );
}
