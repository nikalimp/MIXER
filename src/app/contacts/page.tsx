import type { Metadata } from "next";
import { site } from "@/content/site";
import { Container, Section } from "@/components/container";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { graph, orgId } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Контакты: телефон, адрес и часы работы", // бренд добавит шаблон title из layout
  description: `Как связаться с ${site.name}: телефон, мессенджеры, адрес и часы работы.`,
  alternates: { canonical: "/contacts/" },
};

export default function Contacts() {
  const c = site.contacts;
  const rows = [
    c.phone && { label: "Телефон", value: c.phoneDisplay || c.phone, href: `tel:${c.phone}` },
    c.email && { label: "Почта", value: c.email, href: `mailto:${c.email}` },
    c.telegram && { label: "Telegram", value: c.telegram.replace("https://t.me/", "@"), href: c.telegram },
    c.whatsapp && { label: "WhatsApp", value: "Написать в WhatsApp", href: c.whatsapp },
    c.address.street && { label: "Адрес", value: [c.address.postalCode, c.address.city, c.address.street].filter(Boolean).join(", ") },
    c.hours && { label: "Часы работы", value: c.hours },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  return (
    <>
      <JsonLd data={graph({ "@type": "ContactPage", about: { "@id": orgId } })} />
      <Section className="pt-12">
        <Container className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Контакты</h1>
          <dl className="mt-8 divide-y border-y">
            {rows.length === 0 && <p className="py-4 text-muted-foreground">TODO(клиент): контакты в src/content/site.ts</p>}
            {rows.map((r) => (
              <div key={r.label} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr]">
                <dt className="text-muted-foreground">{r.label}</dt>
                <dd>{r.href ? <a href={r.href} className="underline underline-offset-4">{r.value}</a> : r.value}</dd>
              </div>
            ))}
          </dl>
          <Button asChild size="lg" className="mt-8"><a href={site.cta.href}>{site.cta.label}</a></Button>
          <p className="mt-10 text-sm text-muted-foreground">{site.legalName} · ИНН {site.legal.inn} · ОГРН {site.legal.ogrn}</p>
        </Container>
      </Section>
    </>
  );
}
