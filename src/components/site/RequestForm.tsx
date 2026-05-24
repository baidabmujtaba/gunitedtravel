import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(200),
  phone: z.string().trim().min(4).max(40),
  passport_number: z.string().trim().max(60).optional().or(z.literal("")),
  nationality: z.string().trim().max(60).optional().or(z.literal("")),
  travel_date: z.string().optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
});

interface Props {
  serviceType: "egypt_security" | "travel" | "visa" | "accommodation" | "packages" | "transportation" | "religious" | "vip" | "additional";
  serviceSlug?: string;
  compact?: boolean;
}

export function RequestForm({ serviceType, serviceSlug, compact }: Props) {
  const { tr, lang } = useI18n();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", passport_number: "", nationality: "", travel_date: "", message: "",
  });

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(lang === "ar" ? "يرجى تعبئة الحقول المطلوبة" : "Please fill the required fields");
      return;
    }
    setLoading(true);
    const payload = {
      ...parsed.data,
      passport_number: parsed.data.passport_number || null,
      nationality: parsed.data.nationality || null,
      travel_date: parsed.data.travel_date || null,
      message: parsed.data.message || null,
      service_type: serviceType,
      service_slug: serviceSlug ?? null,
    };
    const { error } = await supabase.from("service_requests").insert(payload);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(tr("request_thanks"));
    setForm({ name: "", phone: "", passport_number: "", nationality: "", travel_date: "", message: "" });
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className={compact ? "grid gap-4" : "grid gap-4 md:grid-cols-2"}>
        <div className="grid gap-1.5">
          <Label htmlFor="name">{tr("request_name")} *</Label>
          <Input id="name" required value={form.name} onChange={onChange("name")} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="phone">{tr("request_phone")} *</Label>
          <Input id="phone" required value={form.phone} onChange={onChange("phone")} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="passport">{tr("request_passport")}</Label>
          <Input id="passport" value={form.passport_number} onChange={onChange("passport_number")} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="nat">{tr("request_nationality")}</Label>
          <Input id="nat" value={form.nationality} onChange={onChange("nationality")} />
        </div>
        <div className="grid gap-1.5 md:col-span-2">
          <Label htmlFor="date">{tr("request_date")}</Label>
          <Input id="date" type="date" value={form.travel_date} onChange={onChange("travel_date")} />
        </div>
        <div className="grid gap-1.5 md:col-span-2">
          <Label htmlFor="msg">{tr("request_message")}</Label>
          <Textarea id="msg" rows={3} value={form.message} onChange={onChange("message")} />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
        {loading ? "…" : tr("request_submit")}
      </Button>
    </form>
  );
}
