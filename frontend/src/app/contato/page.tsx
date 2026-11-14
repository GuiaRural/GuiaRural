"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import AppShell from "../components/common/AppShell";
import Icon from "../components/common/Icon";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import Modal from "../components/ui/Modal";
import { useLanguage } from "../context/LanguageContext";
import {
  ContactValidationError,
  MESSAGE_MAX_LENGTH,
  TEXT_MAX_LENGTH,
  sendMessage,
  type ContactErrors,
  type ContactField,
  type ContactMessage,
} from "../services/messagesService";

const EMPTY: ContactMessage = { name: "", email: "", phone: "", message: "" };
// Ordem dos campos na tela: ao fechar o aviso de erro, o foco vai para o primeiro com problema.
const FIELD_ORDER: ContactField[] = ["name", "email", "phone", "message"];

type Alert = "success" | "invalid" | "failure";

const fieldBase =
  "w-full rounded-xl border bg-slate-100 px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-navy-700";

function CheckIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5 9-10" />
    </svg>
  );
}

function CrossIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

// UC39 — Mandar mensagem para o administrador. Página pública, sem login (RNF04).
export default function ContactPage() {
  const { t } = useLanguage();
  const id = useId();
  const [values, setValues] = useState<ContactMessage>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState<Alert | null>(null);
  const fields = useRef<Partial<Record<ContactField, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const focusAfterClose = useRef<ContactField | null>(null);

  // Roda depois que o Modal fecha o <dialog> (que devolve o foco ao botão Enviar), então este foco prevalece.
  useEffect(() => {
    if (alert !== null || !focusAfterClose.current) return;
    fields.current[focusAfterClose.current]?.focus();
    focusAfterClose.current = null;
  }, [alert]);

  function update(field: ContactField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      await sendMessage(values);
      // Pós-condição do UC39: avisa o sucesso e limpa os campos.
      setValues(EMPTY);
      setErrors({});
      focusAfterClose.current = "name";
      setAlert("success");
    } catch (error) {
      if (error instanceof ContactValidationError) {
        // FE-39.01: o aviso do protótipo e, em cada campo, o motivo.
        setErrors(error.errors);
        focusAfterClose.current = FIELD_ORDER.find((field) => error.errors[field]) ?? null;
        setAlert("invalid");
      } else {
        // Rede ou servidor: o texto digitado continua na tela para tentar de novo.
        setAlert("failure");
      }
    } finally {
      setSending(false);
    }
  }

  const errorId = (field: ContactField) => `${id}-${field}-error`;
  const describedBy = (field: ContactField, ...extra: string[]) =>
    [errors[field] ? errorId(field) : "", ...extra].filter(Boolean).join(" ") || undefined;
  const borderOf = (field: ContactField) => (errors[field] ? "border-red-600" : "border-transparent");

  function fieldError(field: ContactField) {
    const error = errors[field];
    if (!error) return null;
    return (
      <p id={errorId(field)} className="mt-1.5 text-sm font-medium text-red-700">
        {t.contact.fieldErrors[error]}
      </p>
    );
  }

  function label(field: ContactField, text: string, required = false) {
    return (
      <label htmlFor={`${id}-${field}`} className="mb-1.5 block text-sm font-semibold text-navy-900">
        {text}
        {required && <span aria-hidden> *</span>}
      </label>
    );
  }

  const success = alert === "success";

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          <div className="flex justify-end">
            <LanguageSwitcher />
          </div>

          <section className="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-10">
            <h1 className="text-center text-2xl font-bold text-navy-900">{t.contact.title}</h1>
            <p className="mt-2 text-center text-xs text-text-2nd">{t.contact.requiredHint}</p>

            <form noValidate onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                {label("name", t.contact.nameLabel, true)}
                <input
                  id={`${id}-name`}
                  ref={(el) => {
                    fields.current.name = el;
                  }}
                  type="text"
                  autoComplete="name"
                  maxLength={TEXT_MAX_LENGTH}
                  value={values.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder={t.contact.namePlaceholder}
                  aria-required
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={describedBy("name")}
                  className={`${fieldBase} ${borderOf("name")}`}
                />
                {fieldError("name")}
              </div>

              <div>
                {label("email", t.contact.emailLabel, true)}
                <input
                  id={`${id}-email`}
                  ref={(el) => {
                    fields.current.email = el;
                  }}
                  type="email"
                  autoComplete="email"
                  maxLength={TEXT_MAX_LENGTH}
                  value={values.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder={t.contact.emailPlaceholder}
                  aria-required
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={describedBy("email")}
                  className={`${fieldBase} ${borderOf("email")}`}
                />
                {fieldError("email")}
              </div>

              <div>
                {label("phone", t.contact.phoneLabel)}
                <input
                  id={`${id}-phone`}
                  ref={(el) => {
                    fields.current.phone = el;
                  }}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={values.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder={t.contact.phonePlaceholder}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={describedBy("phone", `${id}-phone-hint`)}
                  className={`${fieldBase} ${borderOf("phone")}`}
                />
                <p id={`${id}-phone-hint`} className="mt-1.5 text-xs text-text-2nd">
                  {t.contact.phoneHint}
                </p>
                {fieldError("phone")}
              </div>

              <div>
                {label("message", t.contact.messageLabel, true)}
                <textarea
                  id={`${id}-message`}
                  ref={(el) => {
                    fields.current.message = el;
                  }}
                  rows={6}
                  maxLength={MESSAGE_MAX_LENGTH}
                  value={values.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder={t.contact.messagePlaceholder}
                  aria-required
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={describedBy("message", `${id}-count`)}
                  className={`${fieldBase} ${borderOf("message")} resize-y`}
                />
                <div className="mt-1.5 flex items-start justify-between gap-3">
                  {fieldError("message")}
                  <p id={`${id}-count`} className="ml-auto shrink-0 text-xs text-text-2nd">
                    {values.message.length}/{MESSAGE_MAX_LENGTH} {t.contact.characters}
                  </p>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-lg bg-navy-900 px-10 py-3 text-lg font-bold text-white shadow-sm hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700 disabled:cursor-wait disabled:opacity-60"
                >
                  {sending ? t.contact.sending : t.contact.send}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

      <Modal
        open={alert !== null}
        onClose={() => setAlert(null)}
        closeOnBackdrop
        size="sm"
        title={success ? t.contact.successTitle : t.contact.errorTitle}
        icon={success ? <CheckIcon className="size-4" /> : <Icon name="alert" className="size-4" />}
      >
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <p className="text-sm text-slate-700">
            {success ? t.contact.success : alert === "invalid" ? t.contact.invalidFields : t.contact.sendError}
          </p>
          {success ? <CheckIcon className="size-8 text-emerald-700" /> : <CrossIcon className="size-8 text-red-700" />}
          <button
            type="button"
            onClick={() => setAlert(null)}
            className="rounded-lg bg-navy-900 px-6 py-2 text-sm font-bold text-white hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700"
          >
            {t.contact.ok}
          </button>
        </div>
      </Modal>
    </AppShell>
  );
}
