import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/services")({
  component: ServicesAdmin,
});

const CATS = ["travel", "accommodation", "packages", "transportation", "visa", "egypt_security", "religious", "vip", "additional"] as const;
type Cat = typeof CATS[number];

interface Form {
  id?: string;
  slug: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  image: string;
  category: Cat;
  tags: string;
  status: "active" | "draft" | "archived";
}

const empty: Form = {
  slug: "", title_ar: "", title_en: "", description_ar: "", description_en: "",
  image: "", category: "travel", tags: "", status: "active",
};

export function ServicesAdmin() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<Form>(empty);

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("services").upload(path, file, {
        cacheControl: "3600", upsert: false, contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("services").getPublicUrl(path);
      setForm((f) => ({ ...f, image: data.publicUrl }));
      toast.success("Image uploaded");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const { data } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const save = async () => {
    const payload = {
      slug: form.slug, title_ar: form.title_ar, title_en: form.title_en,
      description_ar: form.description_ar || null, description_en: form.description_en || null,
      image: form.image || null, category: form.category, status: form.status,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    const res = form.id
      ? await supabase.from("services").update(payload).eq("id", form.id)
      : await supabase.from("services").insert(payload);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("Saved");
    setOpen(false); setForm(empty);
    qc.invalidateQueries({ queryKey: ["admin-services"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-services"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Services</h1>
          <p className="text-sm text-muted-foreground">Manage services shown on the public site.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90"><Plus className="mr-2 size-4" />Add service</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{form.id ? "Edit service" : "New service"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-1.5"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Cat })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Title (AR)</Label><Input value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Title (EN)</Label><Input value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} /></div>
              <div className="grid gap-1.5 md:col-span-2">
                <Label>Image</Label>
                <div className="flex items-center gap-3">
                  <Input value={form.image} placeholder="https://… or upload" onChange={(e) => setForm({ ...form, image: e.target.value })} />
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted">
                    {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadImage(f); }} />
                  </label>
                </div>
                {form.image && <img src={form.image} alt="" className="mt-2 h-28 w-full rounded-lg object-cover" />}
              </div>
              <div className="grid gap-1.5 md:col-span-2"><Label>Description (AR)</Label><Textarea rows={3} value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} /></div>
              <div className="grid gap-1.5 md:col-span-2"><Label>Description (EN)</Label><Textarea rows={3} value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Tags (comma separated)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "active" | "draft" | "archived" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={save} className="mt-4 bg-primary hover:bg-primary/90">Save</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 grid gap-3">
        {data?.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div>
              <div className="font-medium">{s.title_en} <span className="text-xs text-muted-foreground">/ {s.title_ar}</span></div>
              <div className="text-xs text-muted-foreground">{s.category} · {s.status} · tags: {s.tags.join(", ") || "—"}</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setForm({
                id: s.id, slug: s.slug, title_ar: s.title_ar, title_en: s.title_en,
                description_ar: s.description_ar ?? "", description_en: s.description_en ?? "",
                image: s.image ?? "", category: s.category, tags: s.tags.join(", "),
                status: s.status,
              }); setOpen(true); }}><Pencil className="size-4" /></Button>
              <Button size="sm" variant="destructive" onClick={() => del(s.id)}><Trash2 className="size-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
