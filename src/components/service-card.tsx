import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/content/services";

export function ServiceCard({ s }: { s: Service }) {
  return (
    <Link href={`/services/${s.slug}/`} className="group flex flex-col rounded-xl border p-6 transition-colors hover:border-foreground/20 hover:bg-accent">
      <p className="flex items-center justify-between font-semibold">
        {s.title}
        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </p>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.short}</p>
      {s.prices[0] && <p className="mt-5 text-sm font-medium">{s.prices[0].value}</p>}
    </Link>
  );
}
