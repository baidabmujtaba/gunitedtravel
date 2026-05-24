
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.service_category AS ENUM ('travel', 'accommodation', 'packages', 'transportation', 'visa', 'egypt_security', 'religious', 'vip', 'additional');
CREATE TYPE public.request_status AS ENUM ('pending', 'in_progress', 'done', 'cancelled');
CREATE TYPE public.content_status AS ENUM ('active', 'draft', 'archived');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  image TEXT,
  category public.service_category NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  status public.content_status NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Service requests
CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  passport_number TEXT,
  nationality TEXT,
  travel_date DATE,
  phone TEXT NOT NULL,
  service_type public.service_category NOT NULL,
  service_slug TEXT,
  message TEXT,
  status public.request_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Offers
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  image TEXT,
  discount_label TEXT,
  valid_until DATE,
  status public.content_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Click events
CREATE TABLE public.click_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_click_events_kind_created ON public.click_events (kind, created_at DESC);

-- Site settings (singleton)
CREATE TABLE public.site_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  whatsapp_number TEXT NOT NULL DEFAULT '249915005595',
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#0F3D2E',
  gold_color TEXT NOT NULL DEFAULT '#C8A96A',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
INSERT INTO public.site_settings (id) VALUES (1);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_requests_updated BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS policies
-- profiles
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- services: public read for active, admin manage all
CREATE POLICY "Public reads active services" ON public.services FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "Admins read all services" ON public.services FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert services" ON public.services FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update services" ON public.services FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete services" ON public.services FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- offers
CREATE POLICY "Public reads active offers" ON public.offers FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "Admins manage offers" ON public.offers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- service_requests: anyone can submit, only admins can read/manage
CREATE POLICY "Anyone submits request" ON public.service_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read requests" ON public.service_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update requests" ON public.service_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete requests" ON public.service_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- click_events: anyone can insert, admins read
CREATE POLICY "Anyone records click" ON public.click_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read clicks" ON public.click_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- site_settings: public read, admin update
CREATE POLICY "Public reads settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins update settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed services
INSERT INTO public.services (slug, title_ar, title_en, description_ar, description_en, category, tags, sort_order) VALUES
('flights', 'حجز الطيران', 'Flight Booking', 'حجز رحلات داخلية ودولية، اقتصادي ودرجة رجال الأعمال', 'Domestic & international flights, economy & business class', 'travel', ARRAY[]::text[], 10),
('hotels', 'الفنادق والإقامة', 'Hotels & Accommodation', 'فنادق وشقق ومنتجعات وفلل من الاقتصادية إلى الفاخرة', 'Hotels, apartments, resorts & villas — budget to luxury', 'accommodation', ARRAY[]::text[], 20),
('packages', 'الباقات السياحية', 'Travel Packages', 'باقات شهر العسل، العائلية، الشباب، والمجموعات', 'Honeymoon, family, youth & group packages', 'packages', ARRAY[]::text[], 30),
('transport', 'المواصلات', 'Transportation', 'تأجير سيارات، خدمة المطار، والجولات السياحية', 'Car rental, airport transfers & city tours', 'transportation', ARRAY[]::text[], 40),
('visa', 'تأشيرات السفر', 'Visa Services', 'تجهيز ملفات التأشيرة ومتابعة الطلبات', 'Tourist visa processing & application tracking', 'visa', ARRAY[]::text[], 50),
('egypt-security', 'الموافقة الأمنية لدخول مصر', 'Egypt Security Clearance', 'خدمة متخصصة لاستخراج الموافقات الأمنية اللازمة لدخول مصر', 'Specialized assistance for Egypt entry security approvals', 'egypt_security', ARRAY['High Demand','Egypt']::text[], 5),
('religious', 'العمرة والحج', 'Umrah & Hajj', 'باقات العمرة والحج بإقامة فاخرة', 'Umrah & Hajj packages with premium accommodation', 'religious', ARRAY[]::text[], 60),
('vip', 'خدمات كبار الشخصيات', 'VIP & Business', 'إدارة سفر الشركات، طائرات خاصة، خدمة المطار السريعة', 'Corporate travel, private jets, VIP fast-track services', 'vip', ARRAY['VIP']::text[], 70),
('additional', 'خدمات إضافية', 'Additional Services', 'تأمين السفر، حجز الأنشطة، مرشدين سياحيين، الترجمة', 'Travel insurance, activities, tour guides & translation', 'additional', ARRAY[]::text[], 80);
