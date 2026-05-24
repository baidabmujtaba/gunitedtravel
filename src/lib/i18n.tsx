import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

type Dict = Record<string, { ar: string; en: string }>;

export const t: Dict = {
  brand: { ar: "Gunited Travel", en: "Gunited Travel" },
  nav_home: { ar: "الرئيسية", en: "Home" },
  nav_services: { ar: "خدماتنا", en: "Services" },
  nav_egypt: { ar: "الموافقة الأمنية لمصر", en: "Egypt Clearance" },
  nav_about: { ar: "من نحن", en: "About" },
  nav_contact: { ar: "تواصل معنا", en: "Contact" },
  nav_book: { ar: "احجز الآن", en: "Book Now" },
  cta_whatsapp: { ar: "تواصل معنا الآن", en: "Chat on WhatsApp" },
  hero_kicker: { ar: "خدمات سفر متكاملة", en: "Premium travel services" },
  hero_title: { ar: "ابدأ رحلتك مع Gunited Travel", en: "Start your journey with Gunited Travel" },
  hero_sub: {
    ar: "أفضل الأسعار، أسرع الإجراءات، وخدمة موثوقة. نحن هنا لنجعل سفرك تجربة فاخرة من البداية إلى النهاية.",
    en: "Best prices, fastest processing, and trusted service — luxury travel from start to finish.",
  },
  hero_cta_primary: { ar: "احجز الآن", en: "Book Now" },
  hero_cta_secondary: { ar: "اكتشف العروض", en: "Explore Offers" },
  trust_travelers: { ar: "+10,000 مسافر سعيد", en: "+10,000 happy travelers" },
  services_kicker: { ar: "خدماتنا المتميزة", en: "Our Services" },
  services_title: { ar: "حلول سفر متكاملة بلمسة واحدة", en: "Complete travel solutions in one click" },
  why_title: { ar: "لماذا يختار المسافرون Gunited Travel؟", en: "Why travelers choose Gunited Travel" },
  why_sub: {
    ar: "نحن نرى أن السفر ليس مجرد رحلة، بل هو تجربة حياة. لذلك نحرص على توفير أعلى مستويات الراحة والأمان.",
    en: "Travel isn't just a trip — it's a lifestyle. We deliver the highest level of comfort and security.",
  },
  why_1_t: { ar: "سرعة فائقة", en: "Lightning speed" },
  why_1_d: { ar: "نقدم لك الإجراءات بأسرع وقت ممكن دون أي تعقيدات.", en: "Bookings and approvals processed quickly with no friction." },
  why_2_t: { ar: "أسعار تنافسية", en: "Best prices" },
  why_2_d: { ar: "نضمن أفضل الأسعار في السوق مع جودة لا تضاهى.", en: "We guarantee market-leading prices with premium quality." },
  why_3_t: { ar: "دعم 24/7", en: "24/7 support" },
  why_3_d: { ar: "فريق دعم متاح على مدار الساعة لمساعدتك في أي وقت.", en: "Our team is available around the clock." },
  why_24: { ar: "دعم متواصل غير وقت", en: "Always-on support" },
  offers_title: { ar: "عروضنا الحصرية", en: "Exclusive Offers" },
  offers_sub: { ar: "استكشف الوجهات الأكثر طلباً بأفضل الأسعار", en: "Explore top destinations at unbeatable prices" },
  offers_view_all: { ar: "عرض جميع الوجهات", en: "View all destinations" },
  offers_book: { ar: "احجز", en: "Book" },
  testimonials_title: { ar: "ماذا يقول عملاؤنا", en: "What our clients say" },
  footer_quick: { ar: "روابط سريعة", en: "Quick links" },
  footer_contact: { ar: "تواصل معنا", en: "Contact us" },
  footer_about: {
    ar: "وكالتكم الموثوقة للتنظيم رحلات السفر والعمرة واستخراج التأشيرات والموافقات الأمنية. نحن نهتم بكل التفاصيل لضمان راحتكم.",
    en: "Your trusted partner for travel, Umrah, visas, and security clearance. We handle every detail so you can relax.",
  },
  footer_rights: { ar: "جميع الحقوق محفوظة", en: "All rights reserved" },
  request_name: { ar: "الاسم الكامل", en: "Full name" },
  request_passport: { ar: "رقم جواز السفر", en: "Passport number" },
  request_nationality: { ar: "الجنسية", en: "Nationality" },
  request_date: { ar: "تاريخ السفر", en: "Travel date" },
  request_phone: { ar: "رقم الهاتف", en: "Phone number" },
  request_message: { ar: "ملاحظات إضافية", en: "Additional notes" },
  request_submit: { ar: "قدم الآن", en: "Submit" },
  request_thanks: { ar: "تم استلام طلبك! سنتواصل معك قريباً.", en: "Request received! We'll contact you shortly." },
  egypt_title: { ar: "الموافقة الأمنية لدخول مصر", en: "Egypt Security Clearance" },
  egypt_sub: {
    ar: "خدمة متخصصة لمساعدة المسافرين (خاصة المواطنين السودانيين) في الحصول على الموافقات الأمنية المطلوبة قبل دخول مصر.",
    en: "Specialized service helping travelers (especially Sudanese nationals) obtain required security approvals before entering Egypt.",
  },
};

interface Ctx {
  lang: Lang;
  dir: "rtl" | "ltr";
  toggle: () => void;
  setLang: (l: Lang) => void;
  tr: (k: keyof typeof t) => string;
}

const I18n = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "ar";
    return (localStorage.getItem("lang") as Lang) || "ar";
  });
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem("lang", lang);
  }, [lang, dir]);

  const value: Ctx = {
    lang,
    dir,
    setLang,
    toggle: () => setLang(lang === "ar" ? "en" : "ar"),
    tr: (k) => t[k]?.[lang] ?? String(k),
  };

  return <I18n.Provider value={value}>{children}</I18n.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18n);
  if (!ctx) throw new Error("useI18n outside provider");
  return ctx;
}
