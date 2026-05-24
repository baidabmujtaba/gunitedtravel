import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

const WA = "https://wa.me/249915005595";

export function WhatsappFloat() {
  const { tr } = useI18n();
  const onClick = () => {
    void supabase.from("click_events").insert({ kind: "whatsapp_float" });
  };
  return (
    <a
      href={WA}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      aria-label={tr("cta_whatsapp")}
      className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-110"
    >
      <MessageCircle className="size-7" />
    </a>
  );
}
