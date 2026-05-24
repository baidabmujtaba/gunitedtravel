import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { findService } from "@/lib/services-catalog";
import { useI18n } from "@/lib/i18n";
import { RequestForm } from "@/components/site/RequestForm";
import { Badge } from "@/components/ui/badge";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const svc = findService(params.slug);
    if (!svc) throw notFound();
    return svc;
  },
  component: ServiceDetail,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Service not found</h1>
      </div>
    </SiteLayout>
  ),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title.en} — Gunited Travel` : "Service" },
      { name: "description", content: loaderData?.description.en ?? "" },
    ],
  }),
});

function ServiceDetail() {
  const svc = Route.useLoaderData();
  const { lang } = useI18n();
  const Icon = svc.icon;
  return (
    <SiteLayout>
      <section className="relative h-64 w-full overflow-hidden md:h-80">
        <img src={heroImg} alt={svc.title.en} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-primary/80" />
        <div className="relative z-10 container mx-auto flex h-full flex-col justify-end px-4 pb-8 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold text-gold-foreground">
              <Icon className="size-6" />
            </div>
            <h1 className="text-3xl font-bold md:text-4xl">{svc.title[lang]}</h1>
          </div>
          <div className="mt-3 flex gap-2">
            {svc.tags.map((t: string) => <Badge key={t} className="bg-gold text-gold-foreground">{t}</Badge>)}
          </div>
        </div>
      </section>
      <section className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold text-primary">{lang === "ar" ? "عن الخدمة" : "About this service"}</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{svc.long[lang]}</p>
        </div>
        <aside className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 text-lg font-semibold text-primary">{lang === "ar" ? "اطلب هذه الخدمة" : "Request this service"}</h3>
          <RequestForm serviceType={svc.category} serviceSlug={svc.slug} compact />
        </aside>
      </section>
    </SiteLayout>
  );
}
