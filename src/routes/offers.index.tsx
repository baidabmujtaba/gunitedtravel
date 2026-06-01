import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/offers/")({
  component: OffersPage,
  head: () => ({
    meta: [
      { title: "Exclusive Travel Offers — Gunited Travel" },
      { name: "description", content: "Browse exclusive flight, hotel, Umrah and tour offers. Book instantly via WhatsApp with Gunited Travel." },
      { property: "og:title", content: "Exclusive Travel Offers — Gunited Travel" },
      { property: "og:description", content: "Best prices on flights, hotels, Umrah and tours. Book via WhatsApp." },
    ],
  }),
});

function OffersPage() {
  const { lang, tr } = useI18n();

  const { data: offers, isLoading } = useQuery({
    queryKey: ["public-offers-all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("offers").select("*").eq("status", "active")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">{tr("services_kicker")}</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{tr("offers_title")}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-primary-foreground/80">{tr("offers_sub")}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        {isLoading && <p className="text-center text-sm text-muted-foreground">…</p>}
        {!isLoading && offers && offers.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            {lang === "ar" ? "لا توجد عروض حالياً." : "No offers right now."}
          </p>
        )}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {offers?.map((o) => {
            const title = (lang === "ar" ? o.title_ar : o.title_en) || o.title_en;
            const desc = (lang === "ar" ? o.description_ar : o.description_en) || "";
            return (
              <a
                key={o.id}
                href={`/offers/${o.id}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-xl"
              >
                <div className="relative h-52 overflow-hidden">
                  <img src={o.image || heroImg} alt={title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  {o.discount_label && (
                    <span className="absolute top-3 right-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-gold-foreground">
                      {o.discount_label}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-primary">{title}</h3>
                  {desc && <p className="mt-1.5 text-sm text-muted-foreground line-clamp-3">{desc}</p>}
                  {o.valid_until && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {lang === "ar" ? "ساري حتى" : "Valid until"}: {o.valid_until}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    {o.price != null ? (
                      <div className="text-sm">
                        <span className="text-xs text-muted-foreground">{lang === "ar" ? "تبدأ من" : "From"}</span>{" "}
                        <span className="font-bold text-primary">{o.currency ?? "SAR"} {Number(o.price).toLocaleString()}</span>
                      </div>
                    ) : <span />}
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      {lang === "ar" ? "احجز الآن" : "Book now"}
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}
