import Link from "next/link";
import { nav, site } from "@/content/site";
import { services } from "@/content/services";
import { Container } from "./container";

export function Footer() {
  const c = site.contacts;
  return (
    <footer className="border-t py-12 text-sm">
      <Container className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-semibold">{site.name}</p>
          <p className="mt-2 text-muted-foreground">{site.tagline}</p>
        </div>
        <div>
          <p className="mb-2 font-medium"><Link href="/services/" className="hover:underline">Услуги</Link></p>
          <ul className="space-y-1.5 text-muted-foreground">
            {services.map((s) => (
              <li key={s.slug}><Link href={`/services/${s.slug}/`} className="hover:text-foreground">{s.title}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 font-medium">Разделы</p>
          <ul className="space-y-1.5 text-muted-foreground">
            {nav.map((n) => (
              <li key={n.href}><Link href={n.href} className="hover:text-foreground">{n.label}</Link></li>
            ))}
            {site.socials.map((s) => (
              <li key={s.href}><a href={s.href} target="_blank" rel="noopener me" className="hover:text-foreground">{s.label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 font-medium">Контакты</p>
          <ul className="space-y-1.5 text-muted-foreground">
            {c.phone && <li><a href={`tel:${c.phone}`} className="hover:text-foreground">{c.phoneDisplay || c.phone}</a></li>}
            {c.email && <li><a href={`mailto:${c.email}`} className="hover:text-foreground">{c.email}</a></li>}
            {c.telegram && <li><a href={c.telegram} target="_blank" rel="noopener" className="hover:text-foreground">Telegram</a></li>}
            {c.address.street && <li>{[c.address.city, c.address.street].filter(Boolean).join(", ")}</li>}
            {c.hours && <li>{c.hours}</li>}
          </ul>
        </div>
      </Container>
      <Container className="mt-10 flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:justify-between">
        <span>© {new Date().getFullYear()} {site.legalName} · ИНН {site.legal.inn} · ОГРН {site.legal.ogrn}</span>
        <Link href="/privacy-policy/" className="hover:text-foreground">Политика обработки персональных данных</Link>
        {site.metaNote && <span className="w-full">{site.metaNote}</span>}
      </Container>
    </footer>
  );
}
