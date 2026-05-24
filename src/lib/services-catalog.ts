import {
  Plane, Hotel, FileText, ShieldCheck, Package, Car, BookMarked, Crown, Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface CatalogService {
  slug: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  long: { ar: string; en: string };
  category: "travel" | "accommodation" | "packages" | "transportation" | "visa" | "egypt_security" | "religious" | "vip" | "additional";
  tags: string[];
  icon: LucideIcon;
  cta: { ar: string; en: string };
  image?: string;
}

export const CATALOG: CatalogService[] = [
  {
    slug: "flight-booking",
    title: { ar: "حجز الطيران", en: "Flight Booking" },
    description: { ar: "أفضل العروض على الرحلات الداخلية والدولية مع مرونة تامة في التعديل والإلغاء.", en: "Best deals on domestic & international flights with full flexibility." },
    long: { ar: "نوفر حجز الرحلات (ذهاب، ذهاب وعودة، متعدد الوجهات) في جميع درجات السفر بما فيها الأعمال، مع اختيار المقعد والوجبة وإمكانية التعديل والإلغاء.", en: "One-way, round-trip and multi-city bookings across all cabins including business, with seat & meal selection and easy modifications." },
    category: "travel", tags: ["Flights"], icon: Plane,
    cta: { ar: "احجز رحلتك ←", en: "Book a flight →" },
  },
  {
    slug: "hotels",
    title: { ar: "حجز الفنادق", en: "Hotel Booking" },
    description: { ar: "إقامة فاخرة في أفضل الفنادق حول العالم بأسعار تنافسية وعروض حصرية.", en: "Luxury stays in the world's top hotels at competitive prices." },
    long: { ar: "فنادق من الاقتصادية حتى الفاخرة، شقق وشاليهات ومنتجعات وفلل خاصة.", en: "Hotels, apartments, resorts and villas — budget to luxury." },
    category: "accommodation", tags: ["Hotels"], icon: Hotel,
    cta: { ar: "استعرض الفنادق ←", en: "Browse hotels →" },
  },
  {
    slug: "visa",
    title: { ar: "التأشيرات", en: "Visa Services" },
    description: { ar: "استخراج تأشيرات الزيارة والسياحة لكافة الوجهات العالمية بسهولة وسرعة.", en: "Tourist visas to all destinations — easy and fast." },
    long: { ar: "استخراج التأشيرات السياحية، تجهيز المستندات، حجز مواعيد السفارة ومتابعة الطلب.", en: "Tourist visa processing, document preparation, embassy appointments and tracking." },
    category: "visa", tags: ["Visa"], icon: FileText,
    cta: { ar: "قدّم الآن ←", en: "Apply now →" },
  },
  {
    slug: "egypt-security",
    title: { ar: "الموافقة الأمنية (مصر)", en: "Egypt Security Clearance" },
    description: { ar: "إجراءات سريعة وموثوقة للحصول على الموافقات الأمنية لدخول مصر في وقت قياسي.", en: "Fast, reliable Egypt security approvals in record time." },
    long: { ar: "خدمة متخصصة لمساعدة المسافرين (خاصة السودانيين) في الحصول على الموافقة الأمنية قبل السفر إلى مصر، تشمل تجهيز الأوراق، التقديم، المتابعة، والاستشارة.", en: "Specialized service for travelers (especially Sudanese nationals) to obtain Egypt security clearance — submission, documents checklist, fast processing, status follow-up and consultation." },
    category: "egypt_security", tags: ["Egypt", "High Demand"], icon: ShieldCheck,
    cta: { ar: "اعرف المزيد ←", en: "Learn more →" },
  },
  {
    slug: "packages",
    title: { ar: "باقات السفر", en: "Travel Packages" },
    description: { ar: "باقات شهر العسل والعائلة والشباب والمجموعات وحتى الباقات المخصصة.", en: "Honeymoon, family, youth, group and custom packages." },
    long: { ar: "صمم رحلتك المثالية من بين باقات متعددة أو دعنا نصمم لك باقة مخصصة بالكامل.", en: "Choose from many curated packages or get a fully custom itinerary." },
    category: "packages", tags: ["Packages"], icon: Package,
    cta: { ar: "اكتشف الباقات ←", en: "Discover packages →" },
  },
  {
    slug: "transportation",
    title: { ar: "النقل والمواصلات", en: "Transport" },
    description: { ar: "تأجير السيارات، نقل المطار، وجولات المدينة الخاصة.", en: "Car rentals, airport transfers, and private city tours." },
    long: { ar: "خدمة تنقل متكاملة: تأجير سيارات، استقبال وتوديع من المطار، وجولات سياحية.", en: "Full mobility services: rentals, airport transfers, and guided city tours." },
    category: "transportation", tags: ["Transport"], icon: Car,
    cta: { ar: "اطلب الآن ←", en: "Book now →" },
  },
  {
    slug: "religious",
    title: { ar: "العمرة والحج", en: "Umrah & Hajj" },
    description: { ar: "باقات العمرة والحج بأعلى مستويات الراحة والخدمة المتميزة.", en: "Umrah and Hajj packages with premium comfort and service." },
    long: { ar: "باقات متنوعة للعمرة والحج تشمل الإقامة، التنقل، والإرشاد الديني.", en: "Diverse Umrah/Hajj packages including accommodation, transport and religious guidance." },
    category: "religious", tags: ["Religious"], icon: BookMarked,
    cta: { ar: "احجز الباقة ←", en: "Book package →" },
  },
  {
    slug: "vip",
    title: { ar: "خدمات كبار الشخصيات VIP", en: "Business & VIP" },
    description: { ar: "إدارة سفر الشركات، درجة الأعمال، Fast Track، طائرات خاصة وشوفير.", en: "Corporate travel, business class, Fast Track, private jets and chauffeur." },
    long: { ar: "خدمات حصرية لرجال الأعمال وكبار الشخصيات: حجز درجة أولى، استقبال VIP، طائرات خاصة، فنادق تنفيذية، ومدير حساب مخصص.", en: "Exclusive services for executives and VIPs: first class, VIP airport reception, private jets, executive hotels, and dedicated account manager." },
    category: "vip", tags: ["VIP"], icon: Crown,
    cta: { ar: "خدمة VIP ←", en: "Get VIP →" },
  },
  {
    slug: "additional",
    title: { ar: "خدمات إضافية", en: "Additional Services" },
    description: { ar: "تأمين السفر، حجز الأنشطة، مرشدين سياحيين وخدمات الترجمة.", en: "Travel insurance, activities, tour guides and translation." },
    long: { ar: "كل ما تحتاجه لرحلة مكتملة: تأمين، أنشطة، مرشدين، وخدمات ترجمة.", en: "Everything you need for a complete trip: insurance, activities, guides and translation." },
    category: "additional", tags: [], icon: Sparkles,
    cta: { ar: "تعرف أكثر ←", en: "Learn more →" },
  },
];

export const findService = (slug: string) => CATALOG.find((s) => s.slug === slug);
