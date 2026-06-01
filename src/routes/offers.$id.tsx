import { createFileRoute, notFound, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { MessageCircle, ArrowLeft, ArrowRight, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/offers/$id")({
  component: OfferDetail,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Offer not found</h1>
      </div>
    </SiteLayout>
  ),
  head: () => ({
    meta: [
      { title: "Offer — Gunited Travel" },
      { name: "description", content: "Exclusive travel offer from Gunited Travel." },
    ],
  }),
});

function OfferDetail() {
  const { id } = useParams({ from: "/offers/$id" });
  const { lang, dir } = useI18n();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const { data: offer, isLoading } = useQuery({
    queryKey: ["offer-detail", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("offers")
        .select("*")
        .eq("id", id)
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

  const { data: otherOffers } = useQuery({
    queryKey: ["offer-detail-related", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("offers")
        .select("id, title_ar, title_en, image, price, currency")
        .eq("status", "active")
        .neq("id", id)
        .order("created_at", { ascending: false })
        .limit(3);
      return data ?? [];
    },
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-sm text-muted-foreground">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>
        </div>
      </SiteLayout>
    );
  }

  if (!offer) {
    throw notFound();
  }

  const title = (lang === "ar" ? offer.title_ar : offer.title_en) || offer.title_en;
  const desc = (lang === "ar" ? offer.description_ar : offer.description_en) || "";
  const wa = (settings?.whatsapp_number || "249915005595").replace(/\D/g, "");

  const whatsappText = encodeURIComponent(
    lang === "ar"
      ? `مرحباً Gunited Travel 👋\nأرغب في حجز العرض: ${title}\nيرجى التواصل معي للتفاصيل.`
      : `Hello Gunited Travel 👋\nI'd like to book the offer: ${title}\nPlease contact me with details.`
  );

  return (
    <SiteLayout>
      {/* Hero with image */}
      <section className="relative h-72 w-full overflow-hidden md:h-96">
        <img src={offer.image || heroImg} alt={title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/60 to-primary/30" />
        <div className="relative z-10 container mx-auto flex h-full flex-col justify-end px-4 pb-8 text-primary-foreground">
          {offer.discount_label && (
            <span className="mb-3 w-fit rounded-full bg-gold px-3 py-1 text-xs font-semibold text-gold-foreground">
              {offer.discount_label}
            </span>
          )}
          <h1 className="text-3xl font-bold md:text-5xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-primary-foreground/85 md:text-base">{desc}</p>
        </div>
      </section>

      <section className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-3">
        <div className="md:col-span-2">
          {offer.price != null && (
            <div className="mb-6 flex items-center gap-3">
              <Tag className="size-5 text-gold" />
              <div>
                <span className="text-xs text-muted-foreground">{lang === "ar" ? "السعر" : "Price"}</span>
                <div className="text-2xl font-bold text-primary">
                  {offer.currency ?? "SAR"} {Number(offer.price).toLocaleString()}
                </div>
              </div>
            </div>
          )}
          {offer.valid_until && (
            <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              {lang === "ar" ? `ساري حتى: ${offer.valid_until}` : `Valid until: ${offer.valid_until}`}
            </div>
          )}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-primary">{lang === "ar" ? "تفاصيل العرض" : "Offer details"}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{desc}</p>
          </div>
        </div>

        {/* WhatsApp CTA sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-primary">
              {lang === "ar" ? "احجز هذا العرض الآن" : "Book this offer now"}
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

          {otherOffers && otherOffers.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h4 className="text-sm font-semibold text-primary">{lang === "ar" ? "عروض أخرى" : "More offers"}</h4>
              <div className="mt-3 space-y-3">
                {otherOffers.map((o) => {
                  const t = (lang === "ar" ? o.title_ar : o.title_en) || o.title_en;
                  return (
                    <a
                      key={o.id}
                      href={`/offers/${o.id}`}
                      className="flex items-center gap-3 rounded-lg border border-border bg-background p-2 transition-colors hover:border-gold"
                    >
                      <img src={o.image || heroImg} alt={t} className="h-12 w-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{t}</p>
                        {o.price != null && (
                          <p className="text-xs text-muted-foreground">{o.currency ?? "SAR"} {Number(o.price).toLocaleString()}</p>
                        )}
                      </div>
                      <Arrow className="size-3 shrink-0 text-gold" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </section>
    </SiteLayout>
  );
}
