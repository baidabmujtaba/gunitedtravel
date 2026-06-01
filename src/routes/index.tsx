import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BookOfferDialog } from "@/components/site/BookOfferDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero.jpg";
import egyptImg from "@/assets/egypt.jpg";
import { Plane, Hotel, FileCheck, Search, Zap, BadgeDollarSign, HeadphonesIcon, Star, MapPin, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Gunited Travel — Premium Travel Agency & Egypt Security Clearance" },
      { name: "description", content: "Book flights, hotels, visas, Umrah, and Egypt security clearance with Gunited Travel — premium service, best prices, 24/7 support." },
    ],
  }),
});

type Tab = "flights" | "hotels" | "visa";

function HomePage() {
  const { tr, lang, dir } = useI18n();
  
  const [tab, setTab] = useState<Tab>("flights");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [depart, setDepart] = useState("");
  const [pax, setPax] = useState("1");

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      return data;
    },
  });

  const { data: services } = useQuery({
    queryKey: ["public-services"],
    queryFn: async () => {
      const { data } = await supabase.from("services").select("*").eq("status", "active").order("sort_order").limit(8);
      return data ?? [];
    },
  });

  const { data: offers } = useQuery({
    queryKey: ["public-offers"],
    queryFn: async () => {
      const { data } = await supabase.from("offers").select("*").eq("status", "active").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const heroKicker = (lang === "ar" ? settings?.hero_kicker_ar : settings?.hero_kicker_en) || tr("hero_kicker");
  const heroTitle = (lang === "ar" ? settings?.hero_title_ar : settings?.hero_title_en) || tr("hero_title");
  const heroSub = (lang === "ar" ? settings?.hero_sub_ar : settings?.hero_sub_en) || tr("hero_sub");
  const heroImage = settings?.hero_image_url || heroImg;

  const tabs: { id: Tab; icon: typeof Plane; label: string }[] = [
    { id: "flights", icon: Plane, label: lang === "ar" ? "رحلات" : "Flights" },
    { id: "hotels", icon: Hotel, label: lang === "ar" ? "فنادق" : "Hotels" },
    { id: "visa", icon: FileCheck, label: lang === "ar" ? "تأشيرات" : "Visa" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const summary = lang === "ar"
      ? `بحث ${tabs.find(t=>t.id===tab)?.label} من ${from || "—"} إلى ${to || "—"} في ${depart || "—"} لـ ${pax} مسافر`
      : `Search ${tab} from ${from || "—"} to ${to || "—"} on ${depart || "—"} for ${pax} traveler(s)`;
    const num = (settings?.whatsapp_number || "249915005595").replace(/\D/g, "");
    void supabase.from("click_events").insert({ kind: "hero_search", meta: { tab, from, to, depart, pax } });
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(summary)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <SiteLayout>
      {/* HERO + SEARCH (Travelocity style) */}
      <section className="relative overflow-hidden">
        <div className="relative min-h-[640px] w-full">
          <img src={heroImage} alt="Gunited Travel" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/55 to-primary/85" />
          <div className={`relative z-10 container mx-auto px-4 pb-12 pt-12 md:pt-20 ${dir === "rtl" ? "text-right" : "text-left"}`}>
            <p className="text-sm font-medium text-gold">{heroKicker}</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-bold leading-tight text-primary-foreground md:text-5xl">
              {heroTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-primary-foreground/85 md:text-base">{heroSub}</p>

            {/* Search card */}
            <div className="mt-8 rounded-2xl bg-background p-2 shadow-2xl md:p-3">
              <div className="flex flex-wrap gap-1 border-b border-border px-2 pt-1">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTab(t.id)}
                      className={`flex items-center gap-2 rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                        active ? "border-b-2 border-gold text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
              <form onSubmit={handleSearch} className="grid gap-3 p-3 md:grid-cols-5">
                <div className="grid gap-1.5 md:col-span-1">
                  <Label className="text-xs">{tab === "hotels" ? (lang==="ar"?"المدينة":"City") : (lang==="ar"?"من":"From")}</Label>
                  <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder={lang==="ar"?"الخرطوم":"Khartoum"} />
                </div>
                {tab !== "hotels" && (
                  <div className="grid gap-1.5">
                    <Label className="text-xs">{lang==="ar"?"إلى":"To"}</Label>
                    <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder={lang==="ar"?"القاهرة":"Cairo"} />
                  </div>
                )}
                <div className="grid gap-1.5">
                  <Label className="text-xs">{tab === "visa" ? (lang==="ar"?"تاريخ السفر":"Travel date") : (lang==="ar"?"المغادرة":"Departure")}</Label>
                  <Input type="date" value={depart} onChange={(e) => setDepart(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">{lang==="ar"?"المسافرون":"Travelers"}</Label>
                  <Input type="number" min="1" max="20" value={pax} onChange={(e) => setPax(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="h-10 w-full gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                    <Search className="size-4" />
                    {lang === "ar" ? "بحث" : "Search"}
                  </Button>
                </div>
              </form>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-primary-foreground/80">
              <div className="flex -space-x-2">
                {[1,2,3].map((i) => <div key={i} className="h-7 w-7 rounded-full border-2 border-primary bg-gold/80" />)}
              </div>
              <span>{tr("trust_travelers")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES from DB */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">{tr("services_kicker")}</p>
          <h2 className="mt-2 text-2xl font-bold text-primary md:text-3xl">{tr("services_title")}</h2>
        </div>
        {(!services || services.length === 0) && (
          <p className="text-center text-sm text-muted-foreground">
            {lang === "ar" ? "لا توجد خدمات منشورة بعد." : "No services published yet."}
          </p>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {services?.map((s) => (
            <Link
              key={s.id}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-44 overflow-hidden bg-muted">
                {s.image ? (
                  <img src={s.image} alt={lang==="ar"?s.title_ar:s.title_en} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground"><MapPin className="size-8" /></div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold">{lang === "ar" ? s.title_ar : s.title_en}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{lang === "ar" ? s.description_ar : s.description_en}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-gold">
                  {lang === "ar" ? "اكتشف المزيد" : "Discover more"} <ArrowRight className="size-3" />
                </div>
              </div>
            </Link>
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

      {/* OFFERS (DB only) */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-primary md:text-3xl">{tr("offers_title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{tr("offers_sub")}</p>
          </div>
          <Link to="/offers" className="text-sm font-medium text-gold hover:underline">{tr("offers_view_all")}</Link>
        </div>
        {(!offers || offers.length === 0) ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "لا توجد عروض نشطة حالياً. تواصل معنا لعروض مخصصة." : "No active offers right now. Contact us for custom deals."}
            </p>
          </div>
        ) : (
        <div className="grid gap-5 md:grid-cols-3">
            {offers.slice(0, 6).map((o) => {
              const title = (lang === "ar" ? o.title_ar : o.title_en) || o.title_en;
              const desc = (lang === "ar" ? o.description_ar : o.description_en) || "";
              return (
                <a
                  key={o.id}
                  href={`/offers/${o.id}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
                >
                  <div className="relative h-48 overflow-hidden bg-muted">
                    {o.image ? (
                      <img src={o.image} alt={title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground"><MapPin className="size-8" /></div>
                    )}
                    {o.discount_label && <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">{o.discount_label}</span>}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{desc}</p>
                    <div className="mt-3 flex items-center justify-between">
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
        )}
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-bold text-primary md:text-3xl">{tr("testimonials_title")}</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { n: lang === "ar" ? "أحمد المنصوري" : "Ahmed Al-Mansouri", q: lang === "ar" ? "خدمة ممتازة في كل تفاصيل الحجز. حصلت على الموافقة الأمنية بأقل من 24 ساعة." : "Excellent end-to-end service. Egypt clearance in under 24 hours." },
              { n: lang === "ar" ? "سارة عبد الله" : "Sara Abdullah", q: lang === "ar" ? "أفضل وكالة تعاملت معها. أسعار رائعة ودعم متواصل." : "Best agency I've worked with. Great prices and constant support." },
              { n: lang === "ar" ? "محمد علي" : "Mohammed Ali", q: lang === "ar" ? "تجربة VIP حقيقية. مدير حسابي اهتم بأدق التفاصيل." : "A true VIP experience." },
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
