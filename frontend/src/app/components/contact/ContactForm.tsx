"use client";

import { useState, type FormEvent } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { ApiError } from "../../lib/api";
import {
  CONTATO_MAX_LENGTH,
  MENSAGEM_MAX_LENGTH,
  MessageValidationError,
  NOME_MAX_LENGTH,
  sendMessage,
  type MessageFieldErrors,
  type MessageInput,
} from "../../services/messagesService";

const EMPTY: MessageInput = { nome: "", contato: "", mensagem: "" };

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-navy-900 aria-[invalid=true]:border-red-500";

// UC39: mensagem para a equipe. Sem login; nome e contato são opcionais (RNF04).
export default function ContactForm() {
  const { t } = useLanguage();
  const c = t.contact;
  const [values, setValues] = useState<MessageInput>(EMPTY);
  const [errors, setErrors] = useState<MessageFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function change(field: keyof MessageInput, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  const errorText = {
    nome: errors.nome ? c.errors.tooLong : null,
    contato: errors.contato === "invalid" ? c.errors.contactInvalid : errors.contato ? c.errors.tooLong : null,
    mensagem: errors.mensagem === "required" ? c.errors.messageRequired : errors.mensagem ? c.errors.tooLong : null,
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setFormError(null);
    try {
      await sendMessage(values);
      setValues(EMPTY);
      setErrors({});
      setSent(true);
    } catch (error) {
      if (error instanceof MessageValidationError) setErrors(error.errors);
      else if (error instanceof ApiError && error.status === 429) setFormError(c.errors.rateLimited);
      else setFormError(c.errors.generic);
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div role="status" className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
        <h2 className="text-lg font-bold">{c.successTitle}</h2>
        <p className="mt-1 text-sm">{c.successText}</p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-4 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
        >
          {c.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
      <p className="text-xs text-text-2nd">{c.privacy}</p>

      <div>
        <label htmlFor="contact-name" className="text-sm font-semibold text-navy-900">
          {c.nameLabel}
        </label>
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          maxLength={NOME_MAX_LENGTH}
          value={values.nome}
          onChange={(e) => change("nome", e.target.value)}
          aria-invalid={errorText.nome ? true : undefined}
          aria-describedby={errorText.nome ? "contact-name-error" : undefined}
          className={inputClass}
        />
        {errorText.nome && (
          <p id="contact-name-error" role="alert" className="mt-1 text-xs font-semibold text-red-700">
            {errorText.nome}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-contact" className="text-sm font-semibold text-navy-900">
          {c.contactLabel}
        </label>
        <input
          id="contact-contact"
          type="text"
          inputMode="email"
          autoComplete="off"
          maxLength={CONTATO_MAX_LENGTH}
          value={values.contato}
          onChange={(e) => change("contato", e.target.value)}
          aria-invalid={errorText.contato ? true : undefined}
          aria-describedby={errorText.contato ? "contact-contact-hint contact-contact-error" : "contact-contact-hint"}
          className={inputClass}
        />
        <p id="contact-contact-hint" className="mt-1 text-xs text-text-2nd">
          {c.contactHint}
        </p>
        {errorText.contato && (
          <p id="contact-contact-error" role="alert" className="mt-1 text-xs font-semibold text-red-700">
            {errorText.contato}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-message" className="text-sm font-semibold text-navy-900">
          {c.messageLabel}
        </label>
        <textarea
          id="contact-message"
          rows={6}
          required
          aria-required="true"
          value={values.mensagem}
          onChange={(e) => change("mensagem", e.target.value)}
          aria-invalid={errorText.mensagem ? true : undefined}
          aria-describedby={errorText.mensagem ? "contact-message-count contact-message-error" : "contact-message-count"}
          className={inputClass}
        />
        <p id="contact-message-count" className="mt-1 text-right text-xs text-text-2nd">
          {values.mensagem.length}/{MENSAGEM_MAX_LENGTH} {c.messageHint}
        </p>
        {errorText.mensagem && (
          <p id="contact-message-error" role="alert" className="mt-1 text-xs font-semibold text-red-700">
            {errorText.mensagem}
          </p>
        )}
      </div>

      {formError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow disabled:opacity-60"
      >
        {sending ? c.sending : c.submit}
      </button>
    </form>
  );
}
