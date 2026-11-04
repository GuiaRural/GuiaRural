"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useAdmin } from "../../../components/admin/AdminShell";
import PageHeader, { ctaButton } from "../../../components/admin/PageHeader";
import Modal, { ConfirmModal } from "../../../components/ui/Modal";
import type { AuditLog } from "../../../data/mockAuditLogs";
import { IT_SECTOR, PERMISSIONS, SECTORS, type Admin, type Permission, type Sector } from "../../../data/mockAdmins";
import { AdminValidationError, approveAdmin, createAdmin, isInstitutionalEmail, listAdmins, revokeAdmin } from "../../../services/adminsService";
import { listLogs } from "../../../services/auditService";

const STATUS_BADGE: Partial<Record<Admin["status"], [string, string]>> = {
  aguardando: ["Aguardando aprovação", "bg-amber-50 text-amber-800 ring-amber-200"],
  revogado: ["Revogado", "bg-slate-100 text-slate-600 ring-slate-200"],
};

const ACTION_LABEL: Record<AuditLog["action"], string> = {
  criado: "cadastrou",
  editado: "alterou",
  deletado: "removeu",
  restaurado: "restaurou",
};

function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

// UC13 — Cadastrar Administrador (lista + modal)
export default function AdminsPage() {
  const { session } = useAdmin();
  const [admins, setAdmins] = useState<Admin[] | null>(null);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [showChanges, setShowChanges] = useState(false);
  const [toRevoke, setToRevoke] = useState<Admin | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const isGeneral = session.permission === "geral";

  function reload() {
    listAdmins().then(setAdmins);
  }
  useEffect(reload, []);

  const q = normalize(query.trim());
  const visible = admins?.filter((a) => !q || [a.name, a.email, a.sector].some((v) => normalize(v).includes(q)));

  function openCreate() {
    setNotice(null);
    setCreating(true);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-0 flex-1 basis-64">
          <span className="sr-only">Buscar administrador</span>
          <svg aria-hidden className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar registro, administrador ou log..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-navy-700 focus:ring-2 focus:ring-brand-yellow"
          />
        </label>
        <button
          type="button"
          onClick={() => setShowChanges(true)}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
        >
          <svg aria-hidden className="size-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          Últimas mudanças
        </button>
        {isGeneral && (
          <button type="button" onClick={openCreate} className={`${ctaButton} h-10`}>
            + Novo
          </button>
        )}
      </div>

      <PageHeader
        title="Administradores"
        subtitle="Quem tem acesso ao painel e com qual permissão."
        actions={
          isGeneral ? (
            <button type="button" className={`${ctaButton} h-11 px-5 text-base`} onClick={openCreate}>
              + Cadastrar administrador
            </button>
          ) : (
            <p className="max-w-xs text-xs text-slate-500">Somente administradores gerais podem cadastrar novos administradores.</p>
          )
        }
      />

      {notice && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          {notice}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="px-6 py-4 font-semibold">Nome</th>
              <th className="px-6 py-4 font-semibold">Setor</th>
              <th className="px-6 py-4 font-semibold">E-mail</th>
              <th className="px-6 py-4 text-center font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!visible && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  Carregando...
                </td>
              </tr>
            )}
            {visible?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  Nenhum administrador encontrado.
                </td>
              </tr>
            )}
            {visible?.map((a) => {
              const badge = STATUS_BADGE[a.status];
              return (
                <tr key={a.id} className={a.status === "revogado" ? "opacity-60" : undefined}>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{a.name}</p>
                    <p className="text-xs text-slate-500">{a.email}</p>
                    {badge && (
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${badge[1]}`}>{badge[0]}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">{a.sector}</p>
                    <p className="text-xs text-slate-500">{PERMISSIONS[a.permission]}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{a.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      {isGeneral && a.status === "aguardando" && (
                        <button
                          type="button"
                          className="rounded-md bg-brand-yellow px-3 py-1.5 text-xs font-bold text-navy-900 hover:brightness-95"
                          onClick={async () => {
                            await approveAdmin(a.id, session.name);
                            setNotice(`${a.name} foi aprovado e já pode acessar o painel.`);
                            reload();
                          }}
                        >
                          Aprovar
                        </button>
                      )}
                      {isGeneral && a.status !== "revogado" && a.id !== session.adminId && (
                        <button
                          type="button"
                          className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                          onClick={() => setToRevoke(a)}
                        >
                          Revogar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">
        Permissões separadas mantêm cada setor responsável só pelo que edita: o RU publica cardápio, a Comunicação publica avisos.
      </p>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Cadastrar Novo Administrador"
        description="Atribua permissões e vincule um servidor ao painel"
        size="lg"
        icon={
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="9" cy="8" r="3.5" fill="currentColor" stroke="none" />
            <path d="M2.5 20a6.5 6.5 0 0 1 13 0Z" fill="currentColor" stroke="none" />
            <path d="M19 8v6M16 11h6" />
          </svg>
        }
      >
        <NewAdminForm
          author={session.name}
          authorSector={session.sector}
          onCancel={() => setCreating(false)}
          onCreated={(admin, sent) => {
            setCreating(false);
            const status =
              admin.status === "ativo"
                ? `${admin.name} foi cadastrado e já pode acessar o painel.`
                : `${admin.name} foi cadastrado com status "Aguardando aprovação" até que um administrador geral da Coordenação de TI o aprove.`;
            const email = sent
              ? ` As credenciais provisórias foram enviadas para ${admin.email}.`
              : " As credenciais não foram enviadas por e-mail.";
            setNotice(status + email);
            reload();
          }}
        />
      </Modal>

      <Modal open={showChanges} onClose={() => setShowChanges(false)} title="Últimas mudanças" description="Alterações recentes em administradores">
        {showChanges && <RecentChanges />}
      </Modal>

      <ConfirmModal
        open={toRevoke !== null}
        title="Revogar acesso"
        danger
        confirmLabel="Revogar"
        cancelLabel="Cancelar"
        message={`O acesso de ${toRevoke?.name} ao painel será revogado. Deseja continuar?`}
        onCancel={() => setToRevoke(null)}
        onConfirm={async () => {
          if (!toRevoke) return;
          await revokeAdmin(toRevoke.id, session.name);
          setNotice(`O acesso de ${toRevoke.name} foi revogado.`);
          setToRevoke(null);
          reload();
        }}
      />
    </div>
  );
}

function RecentChanges() {
  const [logs, setLogs] = useState<AuditLog[] | null>(null);

  useEffect(() => {
    listLogs().then((all) => setLogs(all.filter((l) => l.entity === "Administrador").slice(0, 8)));
  }, []);

  if (!logs) return <p className="text-sm text-slate-500">Carregando...</p>;
  if (logs.length === 0) return <p className="text-sm text-slate-500">Nenhuma modificação registrada.</p>;
  return (
    <ul className="divide-y divide-slate-100 text-sm">
      {logs.map((l) => (
        <li key={l.id} className="py-2.5">
          <p className="text-slate-800">
            <strong>{l.author}</strong> {ACTION_LABEL[l.action]} <strong>{l.entityName}</strong>
          </p>
          <p className="text-xs text-slate-500">{new Date(l.at).toLocaleString("pt-BR")}</p>
        </li>
      ))}
    </ul>
  );
}

type Errors = Partial<Record<"name" | "email" | "sector" | "permission" | "password" | "confirm", string>>;

const fieldClass =
  "h-11 w-full rounded-lg border bg-white px-3.5 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-navy-700 focus:ring-2 focus:ring-brand-yellow";

function NewAdminForm({
  author,
  authorSector,
  onCancel,
  onCreated,
}: {
  author: string;
  authorSector: Sector;
  onCancel: () => void;
  onCreated: (admin: Admin, credentialsSent: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sector, setSector] = useState<Sector | "">("");
  const [permission, setPermission] = useState<Permission | "">("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [sendCredentials, setSendCredentials] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [summary, setSummary] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // FE-13.02
    const next: Errors = {};
    if (!name.trim()) next.name = "Obrigatório";
    if (!email.trim()) next.email = "Obrigatório";
    if (!sector) next.sector = "Obrigatório";
    if (!permission) next.permission = "Obrigatório";
    if (!password) next.password = "Obrigatório";
    if (!confirm) next.confirm = "Obrigatório";
    if (Object.keys(next).length) {
      setErrors(next);
      setSummary("Preencha todos os campos obrigatórios para continuar.");
      return;
    }
    // FE-13.01
    if (!isInstitutionalEmail(email)) {
      setErrors({ email: "Domínio inválido" });
      setSummary("O e-mail deve pertencer ao domínio institucional @ufrpe.br.");
      return;
    }
    if (password.length < 8) {
      setErrors({ password: "Mínimo de 8 caracteres" });
      setSummary("A senha provisória deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setErrors({ confirm: "As senhas não conferem" });
      setSummary("A confirmação da senha provisória não confere.");
      return;
    }
    setSaving(true);
    try {
      const admin = await createAdmin(
        { name, email, sector: sector as Sector, permission: permission as Permission, password, sendCredentials },
        author,
        authorSector,
      );
      onCreated(admin, sendCredentials);
    } catch (err) {
      if (err instanceof AdminValidationError) {
        setErrors(err.field ? { [err.field]: err.message } : {});
        setSummary(err.message);
      } else setSummary("Não foi possível cadastrar o administrador. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const field = (key: keyof Errors) => `${fieldClass} ${errors[key] ? "border-red-500 bg-red-50/40" : "border-slate-300"}`;
  const select = (key: keyof Errors, empty: boolean) => `${field(key)} appearance-none pr-10 ${empty ? "text-slate-500" : ""}`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 sm:px-1 sm:py-1">
      {summary && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {summary}
        </p>
      )}
      {authorSector !== IT_SECTOR && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          Cadastros feitos por setores diferentes da Coordenação de TI ficam com status &quot;Aguardando aprovação&quot;.
        </p>
      )}
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        <Field id="adm-name" label="Nome completo" error={errors.name}>
          <input id="adm-name" className={field("name")} placeholder="Ex: Profa. Maria Silva" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} />
        </Field>
        <Field id="adm-email" label="E-mail institucional" error={errors.email} hint="Obrigatório domínio @ufrpe.br">
          <input id="adm-email" type="email" className={field("email")} placeholder="nome.sobrenome@ufrpe.br" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
        </Field>
        <Field id="adm-sector" label="Setor / departamento responsável" error={errors.sector}>
          <SelectWrap>
            <select id="adm-sector" className={select("sector", !sector)} value={sector} onChange={(e) => setSector(e.target.value as Sector)} aria-invalid={!!errors.sector}>
              <option value="">Selecione um setor...</option>
              {SECTORS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </SelectWrap>
        </Field>
        <Field id="adm-permission" label="Nível de permissão" error={errors.permission}>
          <SelectWrap>
            <select id="adm-permission" className={select("permission", !permission)} value={permission} onChange={(e) => setPermission(e.target.value as Permission)} aria-invalid={!!errors.permission}>
              <option value="">Defina o escopo de acesso...</option>
              {Object.entries(PERMISSIONS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </SelectWrap>
        </Field>
        <Field id="adm-password" label="Senha provisória" error={errors.password}>
          <input id="adm-password" type="password" autoComplete="new-password" placeholder="••••••••" className={field("password")} value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password} />
        </Field>
        <Field id="adm-confirm" label="Confirmar senha provisória" error={errors.confirm}>
          <input id="adm-confirm" type="password" autoComplete="new-password" placeholder="••••••••" className={field("confirm")} value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={!!errors.confirm} />
        </Field>
      </div>
      {/* FA-13.02: desmarcar evita o envio automático */}
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" checked={sendCredentials} onChange={(e) => setSendCredentials(e.target.checked)} className="mt-0.5 size-[18px] accent-blue-600" />
        <span>
          <span className="font-semibold text-slate-900">Enviar credenciais provisórias por e-mail institucional</span>
          <span className="block text-xs text-slate-500">O usuário será solicitado a alterar a senha no primeiro acesso ao painel do GuiaRural.</span>
        </span>
      </label>
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
        {/* FA-13.01 */}
        <button type="button" className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-navy-700 disabled:opacity-60">
          <span aria-hidden>✓</span>
          {saving ? "Cadastrando..." : "Cadastrar Administrador"}
        </button>
      </div>
    </form>
  );
}

function SelectWrap({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <svg aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-slate-700">
        {label} <span className="text-red-600">*</span>
      </label>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
