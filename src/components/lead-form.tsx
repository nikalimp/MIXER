"use client";
// Форма заявки → public/api/lead.php → Telegram школы (spec §7). Согласие — отдельный обязательный чекбокс (стандарт §8).
import { useState } from "react";
import { site } from "@/content/site";

type Status = "idle" | "sending" | "ok" | "error";

export function LeadForm({ source, button, dark = false, row = false }: { source: "form" | "game"; button: string; dark?: boolean; row?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const id = (n: string) => `${source}-${n}`;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("company")) return; // ловушка для ботов
    setStatus("sending");
    try {
      const r = await fetch("/api/lead.php", { method: "POST", body: fd });
      const j = await r.json().catch(() => ({ ok: false }));
      setStatus(r.ok && j.ok ? "ok" : "error");
      if (r.ok && j.ok) {
        try { (window as unknown as { ym?: (...a: unknown[]) => void }).ym?.(site.metrikaId, "reachGoal", source === "game" ? "lead_game" : "lead_form"); } catch {}
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok")
    return (
      <div className="lead-done" role="status">
        <p className="lead-done-title">Заявка отправлена</p>
        <p>Мы напишем тебе в Telegram или позвоним в ближайшее время.</p>
      </div>
    );

  return (
    <form className={`lead${dark ? " lead-dark" : ""}${row ? " lead-row" : ""}`} onSubmit={submit} noValidate={false}>
      <input type="hidden" name="source" value={source === "game" ? "Пробное из игры «Сведи трек»" : "Форма внизу сайта"} />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="lead-grid">
        <label htmlFor={id("name")}>Имя<input id={id("name")} name="name" type="text" autoComplete="name" required /></label>
        <label htmlFor={id("phone")}>Телефон<input id={id("phone")} name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+7" required pattern="[+0-9 ()\-]{10,}" /></label>
        <label htmlFor={id("tg")}>Telegram<input id={id("tg")} name="telegram" type="text" placeholder="@username" /></label>
        <label htmlFor={id("email")}>Почта<input id={id("email")} name="email" type="email" autoComplete="email" /></label>
      </div>
      <label htmlFor={id("consent")} className="lead-consent">
        <input id={id("consent")} name="consent" type="checkbox" required />
        <span>Согласен на <a href="/consent/" target="_blank">обработку персональных данных</a> и с <a href="/privacy-policy/" target="_blank">политикой</a></span>
      </label>
      <button type="submit" className="btn btn-primary lead-submit" disabled={status === "sending"}>{status === "sending" ? "Отправляем…" : button}</button>
      {status === "error" && (
        <p className="lead-error" role="alert">
          Не получилось отправить. Напиши нам в <a href="https://t.me/mixerdjschoolekb">Telegram</a>.
        </p>
      )}
    </form>
  );
}
