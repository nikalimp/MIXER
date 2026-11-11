// Чекбокс согласия для любой формы (стандарт §8): отдельный, не отмечен заранее, обязателен, ведёт на /consent/.
// Не объединять с согласием на рассылку или акцептом оферты — для них отдельные чекбоксы.
export function ConsentCheckbox({ id = "consent" }: { id?: string }) {
  return (
    <label htmlFor={id} className="flex items-start gap-2 text-sm text-muted-foreground">
      <input id={id} name="consent" type="checkbox" required className="mt-0.5 size-4 shrink-0 accent-primary" />
      <span>
        Согласен на <a href="/consent/" target="_blank" className="underline underline-offset-4 hover:text-foreground">обработку персональных данных</a>
      </span>
    </label>
  );
}
