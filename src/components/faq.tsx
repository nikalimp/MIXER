import type { Faq } from "@/content/home";

// FAQ на <details>: ответ есть в HTML и виден ботам, раскрытие работает без JavaScript.
export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="faq">
      {items.map((f) => (
        <details key={f.q}>
          <summary>
            <h3>{f.q}</h3>
            <span aria-hidden="true">+</span>
          </summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
