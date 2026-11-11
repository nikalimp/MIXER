import { site } from "@/content/site";
import { Container, Section } from "./container";
import { Button } from "./ui/button";

export function Cta({ title = "TODO(клиент): заголовок призыва", text = "TODO(клиент): что получит человек после клика" }: { title?: string; text?: string }) {
  return (
    <Section className="border-t">
      <Container className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-balance">{title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{text}</p>
        <Button asChild size="lg" className="mt-7"><a href={site.cta.href}>{site.cta.label}</a></Button>
      </Container>
    </Section>
  );
}
