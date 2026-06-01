import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { History } from "lucide-react";

export const Route = createFileRoute("/admin/requests")({
  component: RequestsAdmin,
});

const TYPES = ["all", "egypt_security", "travel", "visa", "accommodation", "packages", "transportation", "religious", "vip", "additional"];
const STATUSES = ["all", "pending", "in_progress", "done", "cancelled"] as const;
type Status = "pending" | "in_progress" | "done" | "cancelled";

export function RequestsAdmin() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [historyFor, setHistoryFor] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["requests", filter, statusFilter, dateFrom, dateTo],
    queryFn: async () => {
      let q = supabase.from("service_requests").select("*").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("service_type", filter as never);
      if (statusFilter !== "all") q = q.eq("status", statusFilter as Status);
      if (dateFrom) q = q.gte("created_at", dateFrom);
      if (dateTo) q = q.lte("created_at", `${dateTo}T23:59:59`);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const { data: history } = useQuery({
    enabled: !!historyFor,
    queryKey: ["request-history", historyFor],
    queryFn: async () => {
      const { data, error } = await supabase.from("request_status_history")
        .select("*").eq("request_id", historyFor!).order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const setStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("service_requests").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["requests"] });
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Requests</h1>
          <p className="text-sm text-muted-foreground">Filter, manage status, and view a timeline for every request.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-4">
        <div className="grid gap-1.5">
          <Label className="text-xs">Service type</Label>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs">From</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs">To</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Booking</TableHead>
              <TableHead>Travel</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={9} className="text-center text-sm">Loading…</TableCell></TableRow>}
            {data?.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground">No requests match.</TableCell></TableRow>}
            {data?.map((r) => {
              const waText = encodeURIComponent(`Hello ${r.name}, regarding your request with Gunited Travel…`);
              const waNum = (r.phone || "").replace(/\D/g, "");
              return (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>
                    <a href={`https://wa.me/${waNum}?text=${waText}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {r.phone}
                    </a>
                  </TableCell>
                  <TableCell className="capitalize">{r.service_type.replace("_", " ")}</TableCell>
                  <TableCell className="text-xs">
                    {r.booking_type ? <div className="capitalize">{r.booking_type}</div> : "—"}
                    {(r.persons || r.travel_class) && (
                      <div className="text-muted-foreground">{r.persons ?? 1} pax · {r.travel_class ?? "—"}</div>
                    )}
                  </TableCell>
                  <TableCell>{r.travel_date ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-muted-foreground">{r.message ?? "—"}</TableCell>
                  <TableCell>
                    <Select value={r.status} onValueChange={(v) => setStatus(r.id, v as Status)}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setHistoryFor(r.id)}>
                      <History className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!historyFor} onOpenChange={(o) => !o && setHistoryFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Status timeline</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {history?.length === 0 && <p className="text-sm text-muted-foreground">No history yet.</p>}
            {history?.map((h) => (
              <div key={h.id} className="flex items-start gap-3 border-l-2 border-gold pl-3">
                <div>
                  <div className="text-sm font-medium capitalize">
                    {h.old_status ? `${h.old_status} → ${h.new_status}` : `Created · ${h.new_status}`}
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
