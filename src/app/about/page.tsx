import type { Metadata } from "next";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { about } from "@/content/home";
import { Container, Section } from "@/components/container";
import { Cta } from "@/components/cta";
import { JsonLd } from "@/components/json-ld";
import { graph, orgId } from "@/lib/schema";

export const metadata: Metadata = {
  title: about.metaTitle,
  description: about.metaDescription,
  alternates: { canonical: "/about/" },
};

export default function About() {
  return (
    <>
      <JsonLd data={graph({ "@type": "AboutPage", mainEntity: { "@id": orgId } })} />
      <Section className="pt-12">
        <Container className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{about.h1}</h1>
          <div className="prose-site mt-8">
            <Markdown remarkPlugins={[remarkGfm]}>{about.body}</Markdown>
          </div>
        </Container>
      </Section>
      <Cta />
    </>
  );
}
