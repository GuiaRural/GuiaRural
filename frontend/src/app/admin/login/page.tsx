"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, type FormEvent } from "react";
import { useAdmin } from "../../components/admin/AdminShell";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setSession } = useAdmin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      setError("Sua sessão expirou. Faça login novamente para continuar.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.endsWith("@ufrpe.br")) {
      setError("O e-mail deve pertenecer ao domínio institucional @ufrpe.br.");
      return;
    }

    if (!password) {
      setError("Por favor, insira a sua palavra-passe.");
      return;
    }

    setLoading(true);

    try {
      const mockName = cleanEmail.split("@")[0].replace(".", " ");
      const formattedName = mockName.charAt(0).toUpperCase() + mockName.slice(1);

      const sessionData = {
        name: formattedName,
        email: cleanEmail,
        role: "Administrador geral",
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("ru_admin_session", JSON.stringify(sessionData));
      }

      setSession(sessionData);
      router.push("/admin/cardapio");
    } catch {
      setError("Não foi possível realizar o login. Verifique as suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 space-y-6 shadow-2xl">
      <div className="flex justify-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 font-bold text-xl">
          ≡
        </div>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Painel administrativo</h1>
        <p className="text-xs text-slate-500">Acesso restrito às equipes e setores da UFRPE</p>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5">
            E-mail institucional
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="setor@ufrpe.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1.5">
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-slate-300 text-slate-900 focus:ring-amber-400"
            />
            Manter conectado
          </label>
          <a href="#" className="font-semibold text-amber-600 hover:underline">
            Esqueci minha senha
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-slate-900 font-bold text-sm text-white hover:bg-slate-800 transition flex items-center justify-center gap-2 mt-2"
        >
          {loading && <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-4">
      <Suspense fallback={<div className="text-white text-sm">Carregando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}