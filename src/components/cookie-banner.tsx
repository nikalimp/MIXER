"use client";

// Уведомление о cookies и метрических программах (152-ФЗ).
// Клиентский компонент: скрывается через React state и localStorage, не зависит от CSS [hidden]
// и не теряет обработчик клика после гидратации или мягкой навигации.
import { useEffect, useState } from "react";

const STORAGE_KEY = "cookie-ok";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setVisible(false);
  };

  return (
    <div
      id="cookie-banner"
      role="region"
      aria-label="Уведомление о cookies"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-xl flex-col gap-3 rounded-xl border bg-background p-4 text-sm shadow-lg sm:flex-row sm:items-center"
    >
      <p className="flex-1 text-muted-foreground">
        Сайт использует cookies и Яндекс Метрику. Оставаясь на сайте, вы соглашаетесь с <a href="/privacy-policy/" className="underline underline-offset-4 hover:text-foreground">политикой обработки данных</a>.
      </p>
      <button
        type="button"
        data-accept
        onClick={accept}
        className="h-9 shrink-0 cursor-pointer rounded-md bg-primary px-4 font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Понятно
      </button>
    </div>
  );
}
