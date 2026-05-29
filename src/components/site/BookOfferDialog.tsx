import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { z } from "zod";
import { MessageCircle } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(2).max(200),
  phone: z.string().trim().min(4).max(40),
  travel_date: z.string().optional().or(z.literal("")),
  passport_number: z.string().trim().max(60).optional().or(z.literal("")),
  nationality: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
});

interface Props {
  offerTitle: string;
  whatsappNumber?: string | null;
  trigger?: React.ReactNode;
}

export function BookOfferDialog({ offerTitle, whatsappNumber, trigger }: Props) {
  const { tr, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", travel_date: "", passport_number: "", nationality: "", message: "",
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
    const noteForOffer = `[Offer] ${offerTitle}${parsed.data.message ? ` — ${parsed.data.message}` : ""}`;
    const { error } = await supabase.from("service_requests").insert({
      name: parsed.data.name,
      phone: parsed.data.phone,
      passport_number: parsed.data.passport_number || null,
      nationality: parsed.data.nationality || null,
      travel_date: parsed.data.travel_date || null,
      message: noteForOffer,
      service_type: "packages",
      service_slug: null,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }

    void supabase.from("click_events").insert({ kind: "offer_booking", meta: { offer: offerTitle } });

    // Build WhatsApp message
    const lines = lang === "ar"
      ? [
          `مرحباً Gunited Travel 👋`,
          `أرغب في حجز العرض: ${offerTitle}`,
          `الاسم: ${parsed.data.name}`,
          `الهاتف: ${parsed.data.phone}`,
          parsed.data.travel_date ? `تاريخ السفر: ${parsed.data.travel_date}` : "",
          parsed.data.nationality ? `الجنسية: ${parsed.data.nationality}` : "",
          parsed.data.passport_number ? `جواز السفر: ${parsed.data.passport_number}` : "",
          parsed.data.message ? `ملاحظات: ${parsed.data.message}` : "",
        ]
      : [
          `Hello Gunited Travel 👋`,
          `I'd like to book the offer: ${offerTitle}`,
          `Name: ${parsed.data.name}`,
          `Phone: ${parsed.data.phone}`,
          parsed.data.travel_date ? `Travel date: ${parsed.data.travel_date}` : "",
          parsed.data.nationality ? `Nationality: ${parsed.data.nationality}` : "",
          parsed.data.passport_number ? `Passport: ${parsed.data.passport_number}` : "",
          parsed.data.message ? `Notes: ${parsed.data.message}` : "",
        ];
    const text = encodeURIComponent(lines.filter(Boolean).join("\n"));
    const num = (whatsappNumber || "249915005595").replace(/\D/g, "");
    window.open(`https://wa.me/${num}?text=${text}`, "_blank", "noopener,noreferrer");

    toast.success(tr("request_thanks"));
    setOpen(false);
    setForm({ name: "", phone: "", travel_date: "", passport_number: "", nationality: "", message: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90">
            {tr("offers_book")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{lang === "ar" ? `حجز: ${offerTitle}` : `Book: ${offerTitle}`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="bn">{tr("request_name")} *</Label>
            <Input id="bn" required value={form.name} onChange={onChange("name")} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="bp">{tr("request_phone")} *</Label>
            <Input id="bp" required value={form.phone} onChange={onChange("phone")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="bd">{tr("request_date")}</Label>
              <Input id="bd" type="date" value={form.travel_date} onChange={onChange("travel_date")} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bnat">{tr("request_nationality")}</Label>
              <Input id="bnat" value={form.nationality} onChange={onChange("nationality")} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="bpass">{tr("request_passport")}</Label>
            <Input id="bpass" value={form.passport_number} onChange={onChange("passport_number")} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="bm">{tr("request_message")}</Label>
            <Textarea id="bm" rows={3} value={form.message} onChange={onChange("message")} />
          </div>
          <Button type="submit" disabled={loading} className="bg-[#25D366] hover:bg-[#25D366]/90 text-white">
            <MessageCircle className="mr-2 size-4" />
            {loading ? "…" : (lang === "ar" ? "إرسال عبر واتساب" : "Send via WhatsApp")}
          </Button>
          <p className="text-xs text-muted-foreground">
            {lang === "ar"
              ? "سيتم حفظ طلبك وفتح محادثة واتساب مع فريقنا."
              : "Your request is saved and a WhatsApp chat with our team opens automatically."}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
