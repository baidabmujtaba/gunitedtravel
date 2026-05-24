import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({ meta: [{ title: "About — Gunited Travel" }, { name: "description", content: "About Gunited Travel — your trusted premium travel partner." }] }),
});

function AboutPage() {
  const { lang } = useI18n();
  return (
    <SiteLayout>
      <section className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold text-primary md:text-4xl">{lang === "ar" ? "من نحن" : "About Gunited Travel"}</h1>
        <p className="mt-5 leading-relaxed text-muted-foreground">
          {lang === "ar"
            ? "Gunited Travel وكالة سفر متكاملة متخصصة في حجوزات الطيران والفنادق وتأشيرات السفر، مع خبرة عميقة في استخراج الموافقات الأمنية لدخول مصر للمواطنين السودانيين. هدفنا أن نجعل كل رحلة تجربة فاخرة وآمنة."
            : "Gunited Travel is a full-service travel agency specializing in flights, hotels, visa processing — with deep expertise in obtaining Egypt security clearance for Sudanese nationals. Our mission is to make every journey luxurious and safe."}
        </p>
      </section>
    </SiteLayout>
  );
}
