import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data;
    },
  });
  const [form, setForm] = useState({ whatsapp_number: "", logo_url: "", primary_color: "", gold_color: "" });
  useEffect(() => {
    if (data) setForm({
      whatsapp_number: data.whatsapp_number,
      logo_url: data.logo_url ?? "",
      primary_color: data.primary_color,
      gold_color: data.gold_color,
    });
  }, [data]);

  const save = async () => {
    const { error } = await supabase.from("site_settings").update({
      whatsapp_number: form.whatsapp_number,
      logo_url: form.logo_url || null,
      primary_color: form.primary_color,
      gold_color: form.gold_color,
    }).eq("id", 1);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["site-settings"] });
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-primary">Settings</h1>
      <p className="text-sm text-muted-foreground">Logo, WhatsApp number, and brand colors.</p>
      <div className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="grid gap-1.5"><Label>WhatsApp number</Label><Input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} /></div>
        <div className="grid gap-1.5"><Label>Logo URL</Label><Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5"><Label>Primary color</Label><Input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label>Gold color</Label><Input value={form.gold_color} onChange={(e) => setForm({ ...form, gold_color: e.target.value })} /></div>
        </div>
        <Button onClick={save} className="bg-primary hover:bg-primary/90">Save settings</Button>
      </div>
    </div>
  );
}
