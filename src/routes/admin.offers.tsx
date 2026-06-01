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

export const Route = createFileRoute("/admin/offers")({
  component: OffersAdmin,
});

interface Form {
  id?: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  image: string;
  discount_label: string;
  valid_until: string;
  price: string;
  currency: string;
  status: "active" | "draft" | "archived";
}

const empty: Form = {
  title_ar: "", title_en: "", description_ar: "", description_en: "",
  image: "", discount_label: "", valid_until: "", price: "", currency: "SAR", status: "active",
};

export function OffersAdmin() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [f, setF] = useState<Form>(empty);

  const { data } = useQuery({
    queryKey: ["admin-offers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("offers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `offers/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("services").upload(path, file, {
        cacheControl: "3600", upsert: false, contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("services").getPublicUrl(path);
      setF((p) => ({ ...p, image: data.publicUrl }));
      toast.success("Image uploaded");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    const payload = {
      title_ar: f.title_ar, title_en: f.title_en,
      description_ar: f.description_ar || null, description_en: f.description_en || null,
      image: f.image || null, discount_label: f.discount_label || null,
      valid_until: f.valid_until || null, status: f.status,
      price: f.price ? Number(f.price) : null,
      currency: f.currency || "SAR",
    };
    const res = f.id
      ? await supabase.from("offers").update(payload).eq("id", f.id)
      : await supabase.from("offers").insert(payload);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("Saved");
    setOpen(false); setF(empty);
    qc.invalidateQueries({ queryKey: ["admin-offers"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this offer?")) return;
    const { error } = await supabase.from("offers").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-offers"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Offers</h1>
          <p className="text-sm text-muted-foreground">Promotions shown on the homepage and offers section.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setF(empty); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90"><Plus className="mr-2 size-4" />Add offer</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader><DialogTitle>{f.id ? "Edit offer" : "New offer"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-1.5"><Label>Title (AR)</Label><Input value={f.title_ar} onChange={(e) => setF({ ...f, title_ar: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Title (EN)</Label><Input value={f.title_en} onChange={(e) => setF({ ...f, title_en: e.target.value })} /></div>
              <div className="grid gap-1.5 md:col-span-2">
                <Label>Image</Label>
                <div className="flex items-center gap-3">
                  <Input value={f.image} placeholder="https://… or upload" onChange={(e) => setF({ ...f, image: e.target.value })} />
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted">
                    {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadImage(file); }} />
                  </label>
                </div>
                {f.image && <img src={f.image} alt="" className="mt-2 h-32 w-full rounded-lg object-cover" />}
              </div>
              <div className="grid gap-1.5 md:col-span-2"><Label>Description (AR)</Label><Textarea rows={3} value={f.description_ar} onChange={(e) => setF({ ...f, description_ar: e.target.value })} /></div>
              <div className="grid gap-1.5 md:col-span-2"><Label>Description (EN)</Label><Textarea rows={3} value={f.description_en} onChange={(e) => setF({ ...f, description_en: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Discount label</Label><Input placeholder="-30% / Special" value={f.discount_label} onChange={(e) => setF({ ...f, discount_label: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Valid until</Label><Input type="date" value={f.valid_until} onChange={(e) => setF({ ...f, valid_until: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Price (starting from)</Label><Input type="number" placeholder="2499" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Currency</Label><Input placeholder="SAR" value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value })} /></div>
              <div className="grid gap-1.5 md:col-span-2"><Label>Status</Label>
                <Select value={f.status} onValueChange={(v) => setF({ ...f, status: v as Form["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={save} className="mt-4 bg-primary hover:bg-primary/90">Save</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((o) => (
          <div key={o.id} className="overflow-hidden rounded-xl border border-border bg-card">
            {o.image && <img src={o.image} alt={o.title_en} className="h-40 w-full object-cover" />}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{o.title_en}</div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{o.status}</span>
              </div>
              <div className="text-xs text-muted-foreground">{o.title_ar}</div>
              <div className="mt-1 text-xs text-muted-foreground">{o.discount_label ?? "—"} · until {o.valid_until ?? "—"}</div>
              {o.price != null && <div className="mt-1 text-sm font-semibold text-primary">{o.currency ?? "SAR"} {Number(o.price).toLocaleString()}</div>}
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  setF({
                    id: o.id, title_ar: o.title_ar, title_en: o.title_en,
                    description_ar: o.description_ar ?? "", description_en: o.description_en ?? "",
                    image: o.image ?? "", discount_label: o.discount_label ?? "",
                    valid_until: o.valid_until ?? "", status: o.status,
                    price: o.price != null ? String(o.price) : "",
                    currency: o.currency ?? "SAR",
                  });
                  setOpen(true);
                }}><Pencil className="size-4" /></Button>
                <Button size="sm" variant="destructive" onClick={() => del(o.id)}><Trash2 className="size-4" /></Button>
              </div>
            </div>
          </div>
        ))}
        {data?.length === 0 && <p className="text-sm text-muted-foreground">No offers yet.</p>}
      </div>
    </div>
  );
}
