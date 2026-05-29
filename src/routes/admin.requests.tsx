import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/requests")({
  component: RequestsAdmin,
});

const TYPES = ["all", "egypt_security", "travel", "visa", "accommodation", "packages", "transportation", "religious", "vip", "additional"];

function RequestsAdmin() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const { data, isLoading } = useQuery({
    queryKey: ["requests", filter],
    queryFn: async () => {
      let q = supabase.from("service_requests").select("*").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("service_type", filter as never);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const setStatus = async (id: string, status: "pending" | "in_progress" | "done" | "cancelled") => {
    const { error } = await supabase.from("service_requests").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["requests"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Requests</h1>
          <p className="text-sm text-muted-foreground">All form submissions from the public site.</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Travel</TableHead>
              <TableHead>Notes / Offer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="text-center text-sm">Loading…</TableCell></TableRow>}
            {data?.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground">No requests yet.</TableCell></TableRow>}
            {data?.map((r) => {
              const waText = encodeURIComponent(`Hello ${r.name}, regarding your request with Gunited Travel…`);
              const waNum = (r.phone || "").replace(/\D/g, "");
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>
                    <a href={`https://wa.me/${waNum}?text=${waText}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {r.phone}
                    </a>
                  </TableCell>
                  <TableCell className="capitalize">{r.service_type.replace("_", " ")}</TableCell>
                  <TableCell>{r.travel_date ?? "—"}</TableCell>
                  <TableCell className="max-w-xs text-xs text-muted-foreground">{r.message ?? "—"}</TableCell>
                  <TableCell><span className="rounded-full bg-muted px-2 py-1 text-xs">{r.status}</span></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "in_progress")}>Progress</Button>
                      <Button size="sm" onClick={() => setStatus(r.id, "done")} className="bg-primary hover:bg-primary/90">Done</Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>

          </TableBody>
        </Table>
      </div>
    </div>
  );
}
