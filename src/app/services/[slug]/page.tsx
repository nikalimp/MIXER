import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { serviceBySlug, services } from "@/content/services";
import { site } from "@/content/site";
import { Container, Eyebrow, Section } from "@/components/container";
import { Crumbs } from "@/components/crumbs";
import { Cta } from "@/components/cta";
import { FaqList } from "@/components/faq";
import { ServiceCard } from "@/components/service-card";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbs, faqSchema, graph, serviceSchema } from "@/lib/schema";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = serviceBySlug((await params).slug);
  if (!s) return {};
  return {
    title: s.metaTitle,
    description: s.metaDescription,
    alternates: { canonical: `/services/${s.slug}/` },
    openGraph: { title: s.metaTitle, description: s.metaDescription, url: `${site.url}/services/${s.slug}/`, images: ["/og.png"] },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const s = serviceBySlug((await params).slug);
  if (!s) notFound();
  const path = `/services/${s.slug}/`;
  const related = s.related.map(serviceBySlug).filter((x): x is NonNullable<typeof x> => Boolean(x));

  return (
    <>
      <JsonLd data={graph(serviceSchema(s), breadcrumbs([{ name: "Главная", path: "/" }, { name: "Услуги", path: "/services/" }, { name: s.title, path }]), s.faq.length > 0 && faqSchema(s.faq))} />

      <Section className="pt-12">
        <Container className="max-w-3xl">
          <Crumbs items={[{ name: "Главная", path: "/" }, { name: "Услуги", path: "/services/" }, { name: s.title }]} />
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">{s.h1}</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{s.answer}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg"><a href={site.cta.href}>{site.cta.label}</a></Button>
            {s.prices[0] && <p className="text-sm text-muted-foreground">{s.prices[0].value} · {s.timeline}</p>}
          </div>
        </Container>
      </Section>

      {s.forWhom.length > 0 && (
        <Section className="border-t bg-card">
          <Container className="max-w-3xl">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight">Кому подходит</h2>
            <ul className="space-y-3">
              {s.forWhom.map((f) => (
                <li key={f} className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-brand" />{f}</li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <Section className="border-t">
        <Container className="max-w-3xl">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight">Что входит</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {s.includes.map((i) => (
              <div key={i.title}>
                <h3 className="font-medium">{i.title}</h3>
                <p className="mt-1.5 text-muted-foreground">{i.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t bg-card">
        <Container className="max-w-3xl">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight">Этапы</h2>
          <ol className="space-y-6">
            {s.process.map((p, i) => (
              <li key={p.title} className="flex gap-4">
                <span className="font-mono text-sm text-brand">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-medium">{p.title}</h3>
                  <p className="mt-1 text-muted-foreground">{p.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section className="border-t">
        <Container className="max-w-3xl">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight">Стоимость</h2>
          <table className="w-full text-left">
            <tbody className="divide-y border-y">
              {s.prices.map((p) => (
                <tr key={p.name}>
                  <th scope="row" className="py-4 pr-4 font-medium">
                    {p.name}
                    {p.note && <span className="block text-sm font-normal text-muted-foreground">{p.note}</span>}
                  </th>
                  <td className="py-4 text-right font-semibold tabular-nums">{p.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-sm text-muted-foreground">Срок: {s.timeline}</p>
        </Container>
      </Section>

      {s.faq.length > 0 && (
        <Section className="border-t bg-card">
          <Container className="max-w-3xl">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight">Частые вопросы</h2>
            <FaqList items={s.faq} />
          </Container>
        </Section>
      )}

      {related.length > 0 && (
        <Section className="border-t">
          <Container>
            <Eyebrow>Вместе с этим</Eyebrow>
            <h2 className="mb-8 text-2xl font-semibold tracking-tight">Связанные услуги</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => <ServiceCard key={r.slug} s={r} />)}
            </div>
          </Container>
        </Section>
      )}

      <Cta />
    </>
  );
}
