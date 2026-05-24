import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  slug: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  icon: LucideIcon;
  cta: { ar: string; en: string };
}

export function ServiceCard({ slug, title, description, icon: Icon, cta }: Props) {
  const { lang, dir } = useI18n();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  return (
    <Link
      to="/services/$slug"
      params={{ slug }}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-gold hover:shadow-lg"
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 text-gold">
        <Icon className="size-5" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title[lang]}</h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3">{description[lang]}</p>
      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gold opacity-80 transition-opacity group-hover:opacity-100">
        {cta[lang]} <Arrow className="size-3" />
      </div>
    </Link>
  );
}
