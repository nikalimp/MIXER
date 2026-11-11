import { home } from "@/content/home";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { Container, Eyebrow, Section } from "@/components/container";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/service-card";
import { FaqList } from "@/components/faq";
import { Cta } from "@/components/cta";
import { JsonLd } from "@/components/json-ld";
import { faqSchema, graph } from "@/lib/schema";

// Блоки главной — по specs/02-spec.md, §5. Добавляй и убирай секции по карте блоков.
export default function Home() {
  return (
    <>
      <JsonLd data={graph(home.faq.length > 0 && faqSchema(home.faq))} />

      <Section className="pt-16 sm:pt-24">
        <Container className="max-w-3xl">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl">{home.h1}</h1>
          {/* Прямой ответ: первый абзац страницы, его цитируют нейросети */}
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{home.answer}</p>
          <Button asChild size="lg" className="mt-8"><a href={site.cta.href}>{site.cta.label}</a></Button>
        </Container>
      </Section>

      <Section className="border-t">
        <Container>
          <Eyebrow>Услуги</Eyebrow>
          <h2 className="mb-8 text-3xl font-semibold tracking-tight">Чем мы поможем</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => <ServiceCard key={s.slug} s={s} />)}
          </div>
        </Container>
      </Section>

      <Section className="border-t bg-card">
        <Container>
          <dl className="grid gap-8 sm:grid-cols-3">
            {home.facts.map((f) => (
              <div key={f.label}>
                <dt className="text-sm text-muted-foreground">{f.label}</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <Section className="border-t">
        <Container>
          <Eyebrow>Как работаем</Eyebrow>
          <ol className="grid gap-8 sm:grid-cols-3">
            {home.steps.map((s, i) => (
              <li key={s.title}>
                <p className="font-mono text-sm text-brand">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {home.faq.length > 0 && (
        <Section className="border-t bg-card">
          <Container className="max-w-3xl">
            <Eyebrow>Вопросы</Eyebrow>
            <h2 className="mb-6 text-3xl font-semibold tracking-tight">Частые вопросы</h2>
            <FaqList items={home.faq} />
          </Container>
        </Section>
      )}

      <Cta />
    </>
  );
}
