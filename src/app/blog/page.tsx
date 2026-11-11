import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { formatDate, getPosts } from "@/lib/posts";
import { Container, Section } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { graph } from "@/lib/schema";

export const metadata: Metadata = {
  title: "TODO(клиент): Блог — статьи и ответы на вопросы",
  description: "TODO(клиент): о чём блог и кому он полезен, 120⁠–⁠160 символов.",
  alternates: { canonical: "/blog/" },
  ...(!site.features.blog && { robots: { index: false, follow: true } }),
};

export default function Blog() {
  const posts = getPosts();
  return (
    <>
      <JsonLd data={graph({ "@type": "Blog", name: `Блог ${site.name}`, url: `${site.url}/blog/` })} />
      <Section className="pt-12">
        <Container className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Блог</h1>
          <div className="mt-10 divide-y border-y">
            {posts.length === 0 && <p className="py-6 text-muted-foreground">Статьи скоро появятся.</p>}
            {posts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}/`} className="block py-6 hover:opacity-80">
                <p className="text-sm text-muted-foreground"><time dateTime={p.date}>{formatDate(p.date)}</time></p>
                <h2 className="mt-1 text-xl font-semibold">{p.title}</h2>
                <p className="mt-2 text-muted-foreground">{p.description}</p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
