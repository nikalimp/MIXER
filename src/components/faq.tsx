import type { Faq } from "@/content/services";

// FAQ на <details>: ответ есть в HTML и виден ботам, раскрытие работает без JavaScript.
export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="divide-y border-y">
      {items.map((f) => (
        <details key={f.q} className="group py-4">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
            <h3 className="text-base font-medium">{f.q}</h3>
            <span aria-hidden="true" className="mt-0.5 text-muted-foreground transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-2 text-muted-foreground">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
