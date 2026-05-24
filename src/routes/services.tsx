import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ServiceCard } from "@/components/site/ServiceCard";
import { CATALOG } from "@/lib/services-catalog";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  head: () => ({ meta: [{ title: "Services — Gunited Travel" }, { name: "description", content: "All travel services: flights, hotels, visas, Egypt clearance, Umrah, VIP and more." }] }),
});

function ServicesPage() {
  const { tr, lang } = useI18n();
  return (
    <SiteLayout>
      <section className="container mx-auto px-4 py-12">
        <header className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">{tr("services_kicker")}</p>
          <h1 className="mt-2 text-3xl font-bold text-primary md:text-4xl">{lang === "ar" ? "جميع الخدمات" : "All Services"}</h1>
        </header>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CATALOG.map((s) => <ServiceCard key={s.slug} {...s} />)}
        </div>
      </section>
    </SiteLayout>
  );
}
