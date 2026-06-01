import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/content")({
  component: ContentAdmin,
});

interface ContentForm {
  hero_kicker_ar: string; hero_kicker_en: string;
  hero_title_ar: string; hero_title_en: string;
  hero_sub_ar: string; hero_sub_en: string;
  hero_image_url: string;
  about_ar: string; about_en: string;
}

const empty: ContentForm = {
  hero_kicker_ar: "", hero_kicker_en: "",
  hero_title_ar: "", hero_title_en: "",
  hero_sub_ar: "", hero_sub_en: "",
  hero_image_url: "",
  about_ar: "", about_en: "",
};

export function ContentAdmin() {
  const qc = useQueryClient();
  const [form, setForm] = useState<ContentForm>(empty);
  const [uploading, setUploading] = useState(false);

  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (data) setForm({
      hero_kicker_ar: data.hero_kicker_ar ?? "", hero_kicker_en: data.hero_kicker_en ?? "",
      hero_title_ar: data.hero_title_ar ?? "", hero_title_en: data.hero_title_en ?? "",
      hero_sub_ar: data.hero_sub_ar ?? "", hero_sub_en: data.hero_sub_en ?? "",
      hero_image_url: data.hero_image_url ?? "",
      about_ar: data.about_ar ?? "", about_en: data.about_en ?? "",
    });
  }, [data]);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `content/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("services").upload(path, file, {
        cacheControl: "3600", upsert: false, contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("services").getPublicUrl(path);
      setForm((p) => ({ ...p, hero_image_url: data.publicUrl }));
      toast.success("Image uploaded");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally { setUploading(false); }
  };

  const save = async () => {
    const { error } = await supabase.from("site_settings").update({
      hero_kicker_ar: form.hero_kicker_ar || null, hero_kicker_en: form.hero_kicker_en || null,
      hero_title_ar: form.hero_title_ar || null, hero_title_en: form.hero_title_en || null,
      hero_sub_ar: form.hero_sub_ar || null, hero_sub_en: form.hero_sub_en || null,
      hero_image_url: form.hero_image_url || null,
      about_ar: form.about_ar || null, about_en: form.about_en || null,
    }).eq("id", 1);
    if (error) { toast.error(error.message); return; }
    toast.success("Homepage content saved");
    qc.invalidateQueries({ queryKey: ["site-settings"] });
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-primary">Homepage content</h1>
      <p className="text-sm text-muted-foreground">Edit the hero section and about text. Leave blank to use defaults.</p>

      <div className="mt-6 grid gap-5 rounded-2xl border border-border bg-card p-5">
        <div className="grid gap-1.5">
          <Label>Hero background image</Label>
          <div className="flex items-center gap-3">
            <Input value={form.hero_image_url} placeholder="https://… or upload" onChange={(e) => setForm({ ...form, hero_image_url: e.target.value })} />
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted">
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              Upload
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file); }} />
            </label>
          </div>
          {form.hero_image_url && <img src={form.hero_image_url} alt="" className="mt-2 h-40 w-full rounded-lg object-cover" />}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-1.5"><Label>Hero kicker (AR)</Label><Input value={form.hero_kicker_ar} onChange={(e) => setForm({ ...form, hero_kicker_ar: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label>Hero kicker (EN)</Label><Input value={form.hero_kicker_en} onChange={(e) => setForm({ ...form, hero_kicker_en: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label>Hero title (AR)</Label><Input value={form.hero_title_ar} onChange={(e) => setForm({ ...form, hero_title_ar: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label>Hero title (EN)</Label><Input value={form.hero_title_en} onChange={(e) => setForm({ ...form, hero_title_en: e.target.value })} /></div>
          <div className="grid gap-1.5 md:col-span-2"><Label>Hero subtitle (AR)</Label><Textarea rows={2} value={form.hero_sub_ar} onChange={(e) => setForm({ ...form, hero_sub_ar: e.target.value })} /></div>
          <div className="grid gap-1.5 md:col-span-2"><Label>Hero subtitle (EN)</Label><Textarea rows={2} value={form.hero_sub_en} onChange={(e) => setForm({ ...form, hero_sub_en: e.target.value })} /></div>
          <div className="grid gap-1.5 md:col-span-2"><Label>About (AR)</Label><Textarea rows={4} value={form.about_ar} onChange={(e) => setForm({ ...form, about_ar: e.target.value })} /></div>
          <div className="grid gap-1.5 md:col-span-2"><Label>About (EN)</Label><Textarea rows={4} value={form.about_en} onChange={(e) => setForm({ ...form, about_en: e.target.value })} /></div>
        </div>

        <Button onClick={save} className="bg-primary hover:bg-primary/90">Save content</Button>
      </div>
    </div>
  );
}
