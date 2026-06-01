import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/services/")({
  component: ServicesPage,
  head: () => ({ meta: [{ title: "Services — Gunited Travel" }, { name: "description", content: "All travel services: flights, hotels, visas, Egypt clearance, Umrah, VIP and more." }] }),
});

function ServicesPage() {
  const { tr, lang, dir } = useI18n();
  const Arrow = dir === "rtl" ? ArrowRight : ArrowRight;

  const { data: services, isLoading } = useQuery({
    queryKey: ["public-services-all"],
    queryFn: async () => {
      const { data } = await supabase.from("services").select("*").eq("status", "active").order("sort_order");
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      <section className="container mx-auto px-4 py-12">
        <header className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">{tr("services_kicker")}</p>
          <h1 className="mt-2 text-3xl font-bold text-primary md:text-4xl">{lang === "ar" ? "جميع الخدمات" : "All Services"}</h1>
        </header>

        {isLoading && <p className="text-center text-sm text-muted-foreground">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>}

        {(!services || services.length === 0) && !isLoading && (
          <p className="text-center text-sm text-muted-foreground">
            {lang === "ar" ? "لا توجد خدمات منشورة بعد." : "No services published yet."}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services?.map((s) => (
            <a
              key={s.id}
              href={`/services/${s.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-44 overflow-hidden bg-muted">
                {s.image ? (
                  <img src={s.image} alt={lang === "ar" ? s.title_ar : s.title_en} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground"><MapPin className="size-8" /></div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold">{lang === "ar" ? s.title_ar : s.title_en}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{lang === "ar" ? s.description_ar : s.description_en}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-gold">
                  {lang === "ar" ? "اكتشف المزيد" : "Discover more"} <Arrow className="size-3" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
