import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileBox, ListChecks, MousePointerClick, Sparkles, Eye, Users as UsersIcon } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
      const since30 = new Date(Date.now() - 30 * 86400_000).toISOString();
      const [svc, req, offers, clicks, views, recentReq, recentViews, topReq, topPaths] = await Promise.all([
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("service_requests").select("id", { count: "exact", head: true }),
        supabase.from("offers").select("id", { count: "exact", head: true }),
        supabase.from("click_events").select("id", { count: "exact", head: true }).eq("kind", "whatsapp_float"),
        supabase.from("page_views").select("id", { count: "exact", head: true }),
        supabase.from("service_requests").select("id,name,phone,service_type,status,created_at").order("created_at", { ascending: false }).limit(8),
        supabase.from("page_views").select("created_at").gte("created_at", since30).order("created_at", { ascending: true }).limit(5000),
        supabase.from("service_requests").select("service_type"),
        supabase.from("page_views").select("path").gte("created_at", since30).limit(5000),
      ]);

      const dayMap: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
        dayMap[d] = 0;
      }
      (recentViews.data ?? []).forEach((r) => {
        const d = r.created_at.slice(0, 10);
        if (d in dayMap) dayMap[d]++;
      });
      const chart = Object.entries(dayMap).map(([date, views]) => ({ date: date.slice(5), views }));

      const reqCounts: Record<string, number> = {};
      (topReq.data ?? []).forEach((r) => { reqCounts[r.service_type] = (reqCounts[r.service_type] ?? 0) + 1; });
      const top = Object.entries(reqCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

      const pathCounts: Record<string, number> = {};
      (topPaths.data ?? []).forEach((r) => { pathCounts[r.path] = (pathCounts[r.path] ?? 0) + 1; });
      const topPages = Object.entries(pathCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

      return {
        services: svc.count ?? 0,
        requests: req.count ?? 0,
        offers: offers.count ?? 0,
        clicks: clicks.count ?? 0,
        views: views.count ?? 0,
        chart, top, topPages,
        recent: recentReq.data ?? [],
      };
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Live activity across the public site.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Stat label="Page views" value={data?.views ?? "…"} icon={Eye} />
        <Stat label="Requests" value={data?.requests ?? "…"} icon={ListChecks} />
        <Stat label="WhatsApp clicks" value={data?.clicks ?? "…"} icon={MousePointerClick} />
        <Stat label="Services" value={data?.services ?? "…"} icon={FileBox} />
        <Stat label="Offers" value={data?.offers ?? "…"} icon={Sparkles} />
        <Stat label="Conversion" value={data ? `${data.views ? Math.round((data.requests / data.views) * 100) : 0}%` : "…"} icon={UsersIcon} />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Visitors — last 30 days</h2>
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.chart ?? []}>
              <defs>
                <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" fontSize={11} />
              <YAxis fontSize={11} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#v)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Top requested services</h2>
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
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Top pages (30d)</h2>
          <div className="mt-4 space-y-2">
            {(data?.topPages ?? []).length === 0 && <p className="text-sm text-muted-foreground">No visits yet.</p>}
            {(data?.topPages ?? []).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-sm">
                <span className="truncate">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent requests</h2>
          <Link to="/admin/requests" className="text-xs text-primary hover:underline">View all →</Link>
        </div>
        <div className="mt-4 divide-y divide-border">
          {(data?.recent ?? []).length === 0 && <p className="py-3 text-sm text-muted-foreground">No requests yet.</p>}
          {(data?.recent ?? []).map((r) => (
            <div key={r.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <div className="font-medium">{r.name} <span className="text-xs text-muted-foreground">· {r.phone}</span></div>
                <div className="text-xs text-muted-foreground capitalize">{r.service_type.replace("_", " ")} · {new Date(r.created_at).toLocaleString()}</div>
              </div>
              <span className="rounded-full bg-muted px-2 py-1 text-xs">{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
