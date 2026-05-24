import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/offers")({
  component: OffersAdmin,
});

function OffersAdmin() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title_ar: "", title_en: "", description_ar: "", description_en: "", image: "", discount_label: "", valid_until: "" });

  const { data } = useQuery({
    queryKey: ["admin-offers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("offers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const save = async () => {
    const { error } = await supabase.from("offers").insert({
      title_ar: f.title_ar, title_en: f.title_en,
      description_ar: f.description_ar || null, description_en: f.description_en || null,
      image: f.image || null, discount_label: f.discount_label || null,
      valid_until: f.valid_until || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Saved"); setOpen(false);
    setF({ title_ar: "", title_en: "", description_ar: "", description_en: "", image: "", discount_label: "", valid_until: "" });
    qc.invalidateQueries({ queryKey: ["admin-offers"] });
  };
  const del = async (id: string) => {
    if (!confirm("Delete this offer?")) return;
    await supabase.from("offers").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-offers"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Offers</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-primary hover:bg-primary/90"><Plus className="mr-2 size-4" />Add offer</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New offer</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Title (AR)</Label><Input value={f.title_ar} onChange={(e) => setF({ ...f, title_ar: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Title (EN)</Label><Input value={f.title_en} onChange={(e) => setF({ ...f, title_en: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Description (AR)</Label><Textarea value={f.description_ar} onChange={(e) => setF({ ...f, description_ar: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Description (EN)</Label><Textarea value={f.description_en} onChange={(e) => setF({ ...f, description_en: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Image URL</Label><Input value={f.image} onChange={(e) => setF({ ...f, image: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Discount label</Label><Input value={f.discount_label} onChange={(e) => setF({ ...f, discount_label: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Valid until</Label><Input type="date" value={f.valid_until} onChange={(e) => setF({ ...f, valid_until: e.target.value })} /></div>
              <Button onClick={save} className="bg-primary hover:bg-primary/90">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-6 grid gap-3">
        {data?.map((o) => (
          <div key={o.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div>
              <div className="font-medium">{o.title_en} / {o.title_ar}</div>
              <div className="text-xs text-muted-foreground">{o.discount_label ?? "—"} · valid until {o.valid_until ?? "—"}</div>
            </div>
            <Button size="sm" variant="destructive" onClick={() => del(o.id)}><Trash2 className="size-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
