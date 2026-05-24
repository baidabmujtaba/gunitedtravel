import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { RequestForm } from "@/components/site/RequestForm";
import { useI18n } from "@/lib/i18n";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({ meta: [{ title: "Contact — Gunited Travel" }, { name: "description", content: "Reach Gunited Travel via WhatsApp, phone, or email." }] }),
});

function ContactPage() {
  const { lang } = useI18n();
  return (
    <SiteLayout>
      <section className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold text-primary md:text-4xl">{lang === "ar" ? "تواصل معنا" : "Get in touch"}</h1>
          <p className="mt-3 text-muted-foreground">{lang === "ar" ? "نحن هنا لمساعدتك في تخطيط رحلتك المثالية." : "We're here to help plan your perfect trip."}</p>
          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-center gap-3"><Phone className="size-5 text-gold" /> +249 91 500 5595</li>
            <li className="flex items-center gap-3"><Mail className="size-5 text-gold" /> gunitedtravel@gmail.com</li>
            <li className="flex items-center gap-3"><MapPin className="size-5 text-gold" /> Dubai, UAE</li>
            <li>
              <a href="https://wa.me/249915005595" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white">
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-primary">{lang === "ar" ? "أرسل طلبك" : "Send a request"}</h2>
          <RequestForm serviceType="travel" />
        </div>
      </section>
    </SiteLayout>
  );
}
