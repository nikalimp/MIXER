import Link from "next/link";

// Видимые хлебные крошки. JSON-LD BreadcrumbList — через breadcrumbs() из lib/schema.
export function Crumbs({ items }: { items: { name: string; path?: string }[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="mb-6 text-sm text-muted-foreground">
      {items.map((it, i) => (
        <span key={it.name}>
          {i > 0 && " / "}
          {it.path ? <Link href={it.path} className="hover:text-foreground">{it.name}</Link> : it.name}
        </span>
      ))}
    </nav>
  );
}
