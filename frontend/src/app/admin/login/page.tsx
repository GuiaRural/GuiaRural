"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import Logo from "../../components/common/Logo";
import { takeFlash } from "../../lib/flash";
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
  const [farewell, setFarewell] = useState<string | null>(null);

  // Mensagem deixada pelo logout (UC24).
  useEffect(() => {
    const flash = takeFlash();
    if (flash) queueMicrotask(() => setFarewell(flash));
  }, []);

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

  const inputClass = (invalid: boolean) =>
    `h-11 w-full rounded-lg border bg-slate-50 px-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-navy-700 focus:bg-white focus:ring-2 focus:ring-brand-yellow ${
      invalid ? "border-red-500" : "border-slate-300"
    }`;

  return (
    <div className="flex min-h-dvh flex-col bg-[#0a1638]">
      <header className="flex h-14 shrink-0 items-center gap-3 bg-navy-900 px-4 text-white shadow-md sm:px-6">
        <Logo />
        <span aria-hidden className="relative ml-2 grid size-8 place-items-center text-slate-300">
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="absolute right-1 top-0.5 size-2 rounded-full bg-red-500" />
        </span>
        <span aria-hidden className="mx-1 hidden h-6 w-px bg-white/20 sm:block" />
        <p className="hidden items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs sm:flex">
          <span aria-hidden className="size-2 rounded-full bg-emerald-400" />
          Plataforma Pública • Acesso Livre
        </p>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 bg-[#0b1736] px-4 py-2.5 text-xs text-slate-400 sm:px-6">
        <span>Universidade Federal Rural de Pernambuco • GuiaRural UFRPE © 2026</span>
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span aria-hidden className="size-1.5 rounded-full bg-emerald-400" /> Ambiente Seguro SSL 256-bit
          </span>
          <span className="text-slate-200">Termos &amp; Privacidade</span>
        </span>
      </div>

      <main className="grid flex-1 place-items-center bg-[radial-gradient(ellipse_at_center,#173061_0%,#0f2150_45%,#0a1638_100%)] px-4 py-12">
        <div className="w-full max-w-[460px]">
          <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-white/60 bg-white px-6 py-10 shadow-[0_25px_60px_rgba(0,0,0,0.45)] sm:px-10">
            <div aria-hidden className="mx-auto grid size-12 place-items-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600">
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 7h14M5 12h14M5 17h14" />
              </svg>
            </div>
            <h1 className="mt-5 text-center text-2xl font-bold text-navy-900 sm:text-[28px]">Painel administrativo</h1>
            <p className="mt-3 text-center text-sm text-slate-500">Acesso restrito às equipes e setores da UFRPE</p>

            {farewell && !error && (
              <p role="status" className="mt-6 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                <svg aria-hidden className="mt-0.5 size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12 5 5L20 7" />
                </svg>
                {farewell}
              </p>
            )}

            {error && (
              <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {MESSAGES[error]}
              </p>
            )}

            <label htmlFor="email" className="mt-7 block text-sm font-semibold text-slate-800">
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
              className={`mt-2 ${inputClass(emailInvalid)}`}
            />

            <label htmlFor="password" className="mt-5 block text-sm font-semibold text-slate-800">
              Senha
            </label>
            <div className="relative mt-2">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                aria-invalid={passwordInvalid}
                onChange={(e) => setPassword(e.target.value)}
                className={`pr-11 ${inputClass(passwordInvalid)}`}
              />
              {/* FA-12.01: exibir senha */}
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-slate-700"
              >
                <svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                  {showPassword && <path d="M3 3l18 18" strokeLinecap="round" />}
                </svg>
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 rounded accent-navy-900" />
                Manter conectado
              </label>
              {/* FA-12.02: recuperação de senha é o UC41, fora deste escopo */}
              <button type="button" onClick={() => setForgotInfo(true)} className="font-semibold text-amber-700 hover:underline">
                Esqueci minha senha
              </button>
            </div>
            {forgotInfo && (
              <p role="status" className="mt-3 rounded-md bg-slate-50 p-2.5 text-xs text-slate-600">
                A recuperação de senha (UC41) ainda não está disponível. Procure a Coordenação de TI.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-7 h-12 w-full rounded-lg bg-brand-yellow text-base font-bold text-navy-900 shadow-sm hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900 disabled:opacity-70"
            >
              {submitting ? "Entrando..." : "Entrar"}
            </button>

            <p className="mt-7 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 sm:whitespace-nowrap sm:text-[11.5px]">
              Ainda não tem acesso? Solicite ao seu setor ou à <strong className="text-navy-900">Coordenação de TI</strong>.
            </p>
            <Link href="/" className="mt-5 block text-center text-sm font-semibold text-slate-700 hover:text-navy-900 hover:underline">
              ← Voltar ao site público
            </Link>
          </form>

          <p className="mt-4 text-center text-[11px] text-slate-400">
            Ambiente de demonstração (sem backend): coord.ti@ufrpe.br / guiarural123
          </p>
        </div>
      </main>
    </div>
  );
}
