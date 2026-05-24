import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ListChecks, FileBox, Sparkles, Settings, LogOut, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        nav({ to: "/auth" });
        return;
      }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      const isAdmin = !!roles?.some((r) => r.role === "admin");
      if (!mounted) return;
      setAuthorized(isAdmin);
      setReady(true);
    };
    void check();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) nav({ to: "/auth" });
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [nav]);

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  }

  if (!authorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Your account doesn't have admin access. Ask an existing admin to grant you the role
          (insert a row into <code>user_roles</code> with role <code>admin</code>).
        </p>
        <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/auth" }); }}>Sign out</Button>
      </div>
    );
  }

  const items = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/services", label: "Services", icon: FileBox },
    { to: "/admin/requests", label: "Requests", icon: ListChecks },
    { to: "/admin/offers", label: "Offers", icon: Sparkles },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/40" dir="ltr">
      <div className="grid min-h-screen md:grid-cols-[240px_1fr]">
        <aside className="hidden border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground md:block">
          <Link to="/" className="block text-lg font-bold text-sidebar-primary">Gunited Admin</Link>
          <nav className="mt-8 space-y-1">
            {items.map(({ to, label, icon: Icon, exact }) => {
              const active = exact ? path === to : path.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent"
                  }`}
                >
                  <Icon className="size-4" /> {label}
                </Link>
              );
            })}
          </nav>
          <Button
            variant="ghost"
            className="mt-8 w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={async () => { await supabase.auth.signOut(); nav({ to: "/auth" }); }}
          >
            <LogOut className="mr-2 size-4" /> Sign out
          </Button>
        </aside>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
