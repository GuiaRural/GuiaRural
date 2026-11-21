"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "../../lib/api";
import { MAX_DESCRIPTION_CHARS, PlaceValidationError, updatePlaceDescription, type Place } from "../../services/placesService";
import Modal, { ConfirmModal } from "../ui/Modal";
import { primaryButton, secondaryButton } from "./PageHeader";

// UC28 — Editar a descrição do local (decisão do time em 20/11/2026), sem abrir o formulário completo.
// Sessão expirada: a API responde 401 e o painel leva ao login com o aviso (lib/api.ts + AdminShell).
export default function PlaceDescriptionModal({
  place,
  onClose,
  onSaved,
}: {
  place: Place;
  onClose: () => void;
  onSaved: (place: Place) => void;
}) {
  const [text, setText] = useState(place.description);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const dirty = text !== place.description;

  // Cancelar com alterações pede confirmação (descarta o que foi digitado).
  function cancel() {
    if (dirty) setConfirmCancel(true);
    else onClose();
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      setError("A descrição é obrigatória.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      onSaved(await updatePlaceDescription(place.id, text));
    } catch (err) {
      if (err instanceof PlaceValidationError) setError(err.message);
      else if (err instanceof ApiError && err.status === 403) setError("Seu perfil não tem permissão para editar locais.");
      else if (err instanceof ApiError && err.status === 401) setError("Sua sessão expirou. Faça login novamente para continuar.");
      else setError("Não foi possível salvar a descrição. Nada foi alterado; tente novamente.");
      setSaving(false);
    }
  }

  const invalid = error !== null;

  return (
    <>
      <Modal open onClose={cancel} title="Editar descrição" description={place.name} size="lg">
        <form onSubmit={submit} noValidate className="space-y-4">
          {error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="place-description" className="block text-xs font-bold text-slate-800">
              Descrição <span aria-hidden className="text-red-600">*</span>
            </label>
            <textarea
              id="place-description"
              rows={8}
              value={text}
              maxLength={MAX_DESCRIPTION_CHARS}
              aria-required
              aria-invalid={invalid}
              aria-describedby="place-description-hint"
              onChange={(e) => {
                setText(e.target.value);
                setError(null);
              }}
              className={`mt-2 w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-navy-700 focus:ring-2 focus:ring-brand-yellow ${
                invalid ? "border-red-500 bg-red-50/40" : "border-slate-300"
              }`}
            />
            <p id="place-description-hint" className="mt-1 text-[11px] text-slate-500">
              {text.length}/{MAX_DESCRIPTION_CHARS} caracteres. Só o texto em português; as traduções podem ficar desatualizadas.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={cancel} className={`${secondaryButton} h-10`}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} className={`${primaryButton} h-10`}>
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmModal
        open={confirmCancel}
        title="Descartar alterações?"
        message="O texto digitado será descartado e a descrição continuará como estava."
        confirmLabel="Descartar"
        cancelLabel="Continuar editando"
        danger
        onCancel={() => setConfirmCancel(false)}
        onConfirm={onClose}
      />
    </>
  );
}
