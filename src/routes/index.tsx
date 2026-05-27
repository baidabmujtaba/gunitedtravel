import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ServiceCard } from "@/components/site/ServiceCard";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { CATALOG } from "@/lib/services-catalog";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero.jpg";
import egyptImg from "@/assets/egypt.jpg";
import { Zap, BadgeDollarSign, HeadphonesIcon, Star } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Gunited Travel — Premium Travel Agency & Egypt Security Clearance" },
      { name: "description", content: "Book flights, hotels, visas, Umrah, and Egypt security clearance with Gunited Travel — premium service, best prices, 24/7 support." },
    ],
  }),
});

function HomePage() {
  const { tr, lang, dir } = useI18n();
  const featured = CATALOG.slice(0, 4);

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      return data;
    },
  });

  const { data: dbOffers } = useQuery({
    queryKey: ["public-offers"],
    queryFn: async () => {
      const { data } = await supabase.from("offers").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(6);
      return data ?? [];
    },
  });

  const heroKicker = (lang === "ar" ? settings?.hero_kicker_ar : settings?.hero_kicker_en) || tr("hero_kicker");
  const heroTitle = (lang === "ar" ? settings?.hero_title_ar : settings?.hero_title_en) || tr("hero_title");
  const heroSub = (lang === "ar" ? settings?.hero_sub_ar : settings?.hero_sub_en) || tr("hero_sub");
  const heroImage = settings?.hero_image_url || heroImg;

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="relative h-[560px] w-full md:h-[640px]">
          <img src={heroImg} alt="Gunited Travel agency" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-primary/10" />
          <div className="relative z-10 container mx-auto flex h-full flex-col items-start justify-end px-4 pb-16 text-primary-foreground md:items-end md:pb-20">
            <div className={`max-w-xl ${dir === "rtl" ? "text-right" : "text-left"}`}>
              <p className="text-sm font-medium text-gold">{tr("hero_kicker")}</p>
              <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">
                {tr("hero_title").split("Gunited Travel")[0]}
                <span className="text-gold">Gunited Travel</span>
                {tr("hero_title").split("Gunited Travel")[1]}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-primary-foreground/85 md:text-base">{tr("hero_sub")}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full bg-gold text-gold-foreground hover:bg-gold/90">
                  <Link to="/contact">{tr("hero_cta_primary")}</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20">
                  <Link to="/services">{tr("hero_cta_secondary")}</Link>
                </Button>
              </div>
              <div className="mt-6 flex items-center gap-3 text-xs text-primary-foreground/80">
                <div className="flex -space-x-2">
                  {[1,2,3].map((i) => (
                    <div key={i} className="h-7 w-7 rounded-full border-2 border-primary bg-gold/80" />
                  ))}
                </div>
                <span>{tr("trust_travelers")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">{tr("services_kicker")}</p>
          <h2 className="mt-2 text-2xl font-bold text-primary md:text-3xl">{tr("services_title")}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {featured.map((s) => (
            <ServiceCard key={s.slug} {...s} />
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-muted/40 py-16">
        <div className="container mx-auto grid items-center gap-10 px-4 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-primary md:text-3xl">{tr("why_title")}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{tr("why_sub")}</p>
            <div className="mt-6 space-y-5">
              {[
                { icon: Zap, t: tr("why_1_t"), d: tr("why_1_d") },
                { icon: BadgeDollarSign, t: tr("why_2_t"), d: tr("why_2_d") },
                { icon: HeadphonesIcon, t: tr("why_3_t"), d: tr("why_3_d") },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-gold">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{t}</h4>
                    <p className="text-xs text-muted-foreground">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <img src={egyptImg} alt="Egypt" className="aspect-square h-full w-full rounded-2xl object-cover" />
            <img src={heroImg} alt="Dubai" className="aspect-square h-full w-full rounded-2xl object-cover" />
            <img src={egyptImg} alt="Hotel" className="aspect-square h-full w-full rounded-2xl object-cover" />
            <div className="flex aspect-square items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <div className="text-center">
                <div className="text-3xl font-bold text-gold">24/7</div>
                <div className="mt-1 text-xs">{tr("why_24")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OFFERS */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-primary md:text-3xl">{tr("offers_title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{tr("offers_sub")}</p>
          </div>
          <Link to="/services" className="text-sm font-medium text-gold hover:underline">{tr("offers_view_all")}</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { t: lang === "ar" ? "دبي - سحر الحداثة" : "Dubai — modern wonder", p: "2,499", img: heroImg, badge: lang === "ar" ? "عرض خاص" : "Special" },
            { t: lang === "ar" ? "القاهرة - عبق التاريخ" : "Cairo — timeless", p: "1,850", img: egyptImg, badge: lang === "ar" ? "الأكثر طلباً" : "Top pick" },
            { t: lang === "ar" ? "إسطنبول - بوابة الشرق" : "Istanbul — gateway", p: "3,200", img: heroImg },
          ].map((o, i) => (
            <article key={i} className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg">
              <div className="relative h-48 overflow-hidden">
                <img src={o.img} alt={o.t} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                {o.badge && <span className="absolute top-3 right-3 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">{o.badge}</span>}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold">{o.t}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{lang === "ar" ? `تبدأ من ${o.p} ريال` : `From SAR ${o.p}`}</p>
                <Button asChild size="sm" className="mt-3 rounded-full bg-primary hover:bg-primary/90">
                  <Link to="/contact">{tr("offers_book")}</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-bold text-primary md:text-3xl">{tr("testimonials_title")}</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { n: lang === "ar" ? "أحمد المنصوري" : "Ahmed Al-Mansouri", q: lang === "ar" ? "خدمة ممتازة في كل تفاصيل الحجز. حصلت على الموافقة الأمنية بأقل من 24 ساعة. شكراً Gunited!" : "Excellent end-to-end service. I got my Egypt clearance in under 24 hours. Thank you Gunited!" },
              { n: lang === "ar" ? "سارة عبد الله" : "Sara Abdullah", q: lang === "ar" ? "أفضل وكالة تعاملت معها. أسعار رائعة ودعم متواصل." : "Best agency I've worked with. Great prices and constant support." },
              { n: lang === "ar" ? "محمد علي" : "Mohammed Ali", q: lang === "ar" ? "تجربة VIP حقيقية. مدير حسابي اهتم بأدق التفاصيل." : "A true VIP experience. My account manager handled every detail." },
            ].map((t) => (
              <div key={t.n} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex gap-0.5 text-gold">
                  {[1,2,3,4,5].map((s) => <Star key={s} className="size-4 fill-current" />)}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">"{t.q}"</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-primary/10" />
                  <div className="text-sm font-medium">{t.n}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
