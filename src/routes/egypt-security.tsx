import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { RequestForm } from "@/components/site/RequestForm";
import { useI18n } from "@/lib/i18n";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import egyptImg from "@/assets/egypt.jpg";

export const Route = createFileRoute("/egypt-security")({
  component: EgyptPage,
  head: () => ({
    meta: [
      { title: "Egypt Security Clearance — Gunited Travel" },
      { name: "description", content: "Specialized service to obtain Egypt security clearance for Sudanese nationals. Fast processing, full document support, status tracking." },
      { property: "og:title", content: "Egypt Security Clearance" },
      { property: "og:image", content: "/og-egypt.jpg" },
    ],
  }),
});

function EgyptPage() {
  const { tr, lang } = useI18n();
  const features = lang === "ar"
    ? ["المساعدة في تقديم الطلب", "قائمة المستندات المطلوبة", "إرشادات السرعة في المعالجة", "متابعة الحالة", "دعم الاستشارة"]
    : ["Application submission assistance", "Required documents checklist", "Fast processing guidance", "Status follow-up", "Consultation support"];

  return (
    <SiteLayout>
      <section className="relative h-80 w-full overflow-hidden">
        <img src={egyptImg} alt="Egypt" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-primary/85" />
        <div className="relative z-10 container mx-auto flex h-full flex-col justify-center px-4 text-primary-foreground">
          <div className="flex items-center gap-2 text-gold">
            <ShieldCheck className="size-6" />
            <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold">High Demand · Egypt</span>
          </div>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold md:text-5xl">{tr("egypt_title")}</h1>
          <p className="mt-3 max-w-2xl text-sm text-primary-foreground/85 md:text-base">{tr("egypt_sub")}</p>
        </div>
      </section>

      <section className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-primary">{lang === "ar" ? "ما الذي تشمله الخدمة" : "What's included"}</h2>
          <ul className="mt-5 space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-gold" />
                <span className="text-sm text-foreground/85">{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-primary">{lang === "ar" ? "قدّم طلب الموافقة الآن" : "Submit your application"}</h3>
          <RequestForm serviceType="egypt_security" serviceSlug="egypt-security" />
        </div>
      </section>
    </SiteLayout>
  );
}
