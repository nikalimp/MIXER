"use client";
// Попап «Бесплатное пробное занятие» — открывается только после удачного сведения в игре (decisions 2026-11-12).
import { useEffect, useRef } from "react";
import { LeadForm } from "./lead-form";

export function LeadDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="lead-dialog" onClose={onClose} aria-labelledby="gift-title">
      <button type="button" className="lead-dialog-close" onClick={onClose} aria-label="Закрыть">×</button>
      <p className="eyebrow">Ты свёл трек</p>
      <h2 id="gift-title">Дарим бесплатное пробное занятие</h2>
      <p className="lead-dialog-text">Оставь контакты — напишем и подберём время занятия в студии на Восточной 56.</p>
      <LeadForm source="game" button="Получить пробное занятие" />
    </dialog>
  );
}
