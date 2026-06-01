import { createFileRoute, notFound, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { findService, CATALOG } from "@/lib/services-catalog";
import { MessageCircle, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/services/$slug")({
  component: ServiceDetail,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Service not found</h1>
      </div>
    </SiteLayout>
  ),
  head: () => ({
    meta: [
      { title: "Service — Gunited Travel" },
      { name: "description", content: "Gunited Travel service details." },
    ],
  }),
});

function ServiceDetail() {
  const { slug } = useParams({ from: "/services/$slug" });
  const { lang, dir, tr } = useI18n();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const { data: dbService } = useQuery({
    queryKey: ["service-detail", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("slug", slug)
        .eq("status", "active")
        .single();
      return data ?? null;
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("whatsapp_number").eq("id", 1).single();
      return data;
    },
  });

  // Fallback to static catalog
  const staticSvc = findService(slug);

  const svc = dbService
    ? {
        slug: dbService.slug,
        title: { ar: dbService.title_ar, en: dbService.title_en },
        description: { ar: dbService.description_ar ?? "", en: dbService.description_en ?? "" },
        long: { ar: dbService.description_ar ?? "", en: dbService.description_en ?? "" },
        image: dbService.image ?? heroImg,
        category: dbService.category,
        tags: dbService.tags,
        icon: null,
      }
    : staticSvc
      ? {
          slug: staticSvc.slug,
          title: staticSvc.title,
          description: staticSvc.description,
          long: staticSvc.long,
          image: staticSvc.image ?? heroImg,
          category: staticSvc.category,
          tags: staticSvc.tags,
          icon: staticSvc.icon,
        }
      : null;

  if (!svc) {
    throw notFound();
  }

  const title = svc.title[lang];
  const desc = svc.description[lang];
  const long = svc.long[lang];
  const wa = (settings?.whatsapp_number || "249915005595").replace(/\D/g, "");

  const whatsappText = encodeURIComponent(
    lang === "ar"
      ? `مرحباً Gunited Travel 👋\nأرغب في الاستفسار/الحجز عن خدمة: ${title}\nيرجى التواصل معي.`
      : `Hello Gunited Travel 👋\nI'm interested in booking/inquiry for: ${title}\nPlease contact me.`
  );

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative h-72 w-full overflow-hidden md:h-96">
        <img src={svc.image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/60 to-primary/30" />
        <div className="relative z-10 container mx-auto flex h-full flex-col justify-end px-4 pb-8 text-primary-foreground">
          <h1 className="text-3xl font-bold md:text-5xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-primary-foreground/85 md:text-base">{desc}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {svc.tags.map((t: string) => (
              <span key={t} className="rounded-full bg-gold/20 px-3 py-1 text-xs font-medium text-gold">{t}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold text-primary">{lang === "ar" ? "عن الخدمة" : "About this service"}</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{long}</p>

          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-primary">{lang === "ar" ? "ما تشمله الخدمة" : "What's included"}</h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {(lang === "ar"
                ? ["دعم متواصل 24/7", "أفضل الأسعار المضمونة", "إجراءات سريعة وموثوقة", "حجز مرن مع إمكانية التعديل"]
                : ["24/7 support", "Best price guarantee", "Fast & reliable processing", "Flexible booking with changes"]
              ).map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 shrink-0 text-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* WhatsApp CTA sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-primary">
              {lang === "ar" ? "احجز هذه الخدمة الآن" : "Book this service now"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {lang === "ar"
                ? "تواصل مع فريقنا مباشرة عبر واتساب للحجز أو الاستفسار."
                : "Contact our team directly via WhatsApp to book or inquire."}
            </p>
            <Button
              asChild
              className="mt-4 w-full gap-2 rounded-full bg-[#25D366] text-white hover:bg-[#25D366]/90"
            >
              <a href={`https://wa.me/${wa}?text=${whatsappText}`} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" />
                {lang === "ar" ? "احجز عبر واتساب" : "Book via WhatsApp"}
              </a>
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {lang === "ar" ? "رد سريع خلال دقائق" : "Quick reply within minutes"}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h4 className="text-sm font-semibold text-primary">{lang === "ar" ? "خدمات ذات صلة" : "Related services"}</h4>
            <div className="mt-3 space-y-2">
              {CATALOG.filter((s) => s.slug !== slug).slice(0, 3).map((s) => (
                <a
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:border-gold"
                >
                  <span>{s.title[lang]}</span>
                  <Arrow className="size-3 text-gold" />
                </a>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}
