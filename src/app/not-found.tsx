import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Страница не найдена",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <section className="legal">
      <p className="eyebrow">404</p>
      <h1>Страница не найдена</h1>
      <a href="/" className="btn btn-primary" style={{ marginTop: 24 }}>На главную</a>
    </section>
  );
}
