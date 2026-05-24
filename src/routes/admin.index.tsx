import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileBox, ListChecks, MousePointerClick, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Stat({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="size-4 text-gold" />
      </div>
      <div className="mt-3 text-3xl font-bold text-primary">{value}</div>
    </div>
  );
}

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [svc, req, offers, clicks, topReq] = await Promise.all([
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("service_requests").select("id", { count: "exact", head: true }),
        supabase.from("offers").select("id", { count: "exact", head: true }),
        supabase.from("click_events").select("id", { count: "exact", head: true }).eq("kind", "whatsapp_float"),
        supabase.from("service_requests").select("service_type"),
      ]);
      const counts: Record<string, number> = {};
      (topReq.data ?? []).forEach((r) => { counts[r.service_type] = (counts[r.service_type] ?? 0) + 1; });
      const top = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0, 5);
      return {
        services: svc.count ?? 0,
        requests: req.count ?? 0,
        offers: offers.count ?? 0,
        clicks: clicks.count ?? 0,
        top,
      };
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Overview of activity across the platform.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat label="Services" value={data?.services ?? "…"} icon={FileBox} />
        <Stat label="Requests" value={data?.requests ?? "…"} icon={ListChecks} />
        <Stat label="Offers" value={data?.offers ?? "…"} icon={Sparkles} />
        <Stat label="WhatsApp clicks" value={data?.clicks ?? "…"} icon={MousePointerClick} />
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Most requested services</h2>
        <div className="mt-4 space-y-2">
          {(data?.top ?? []).length === 0 && <p className="text-sm text-muted-foreground">No requests yet.</p>}
          {(data?.top ?? []).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between text-sm">
              <span className="capitalize">{k.replace("_", " ")}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
