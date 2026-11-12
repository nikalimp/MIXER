import type { Metadata } from "next";
import "@fontsource-variable/unbounded/wght.css"; // Unbounded — заголовки, кнопки, цифры (decisions 2026-11-11)
import "@fontsource-variable/onest/wght.css"; // Onest — основной текст (Ник, v0.3: читаемость)
import "./globals.css";
import { site } from "@/content/site";
import { SiteHeader } from "@/components/site-header";
import { Reveal } from "@/components/reveal";
import { Footer } from "@/components/footer";
import { CookieBanner } from "@/components/cookie-banner";
import { JsonLd } from "@/components/json-ld";
import { graph, orgSchema, websiteSchema } from "@/lib/schema";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.brandLine}` },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: site.locale, siteName: site.brandLine, title: site.title, description: site.description, url: site.url, images: ["/og.png"] },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};

const metrikaScript = (id: number) =>
  `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${id}','ym');ym(${id},'init',{ssr:true,webvisor:true,clickmap:true,referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.lang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {site.metrikaId > 0 && <script dangerouslySetInnerHTML={{ __html: metrikaScript(site.metrikaId) }} />}
        <JsonLd data={graph(websiteSchema, orgSchema)} />
      </head>
      <body>
        {site.metrikaId > 0 && (
          <noscript><div><img src={`https://mc.yandex.ru/watch/${site.metrikaId}`} style={{ position: "absolute", left: "-9999px" }} alt="" /></div></noscript>
        )}
        <a href="#main" className="skip">К содержанию</a>
        <SiteHeader />
        <main id="main">{children}</main>
        <Footer />
        <Reveal />
        <CookieBanner />
      </body>
    </html>
  );
}
