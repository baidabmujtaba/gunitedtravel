import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { nav({ to: "/auth" }); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      const isAdmin = !!roles?.some((r) => r.role === "admin");
      if (!mounted) return;
      setAuthorized(isAdmin); setReady(true);
    };
    void check();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { if (!session) nav({ to: "/auth" }); });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [nav]);

  if (!ready) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;

  if (!authorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="max-w-md text-sm text-muted-foreground">Your account doesn't have admin access.</p>
        <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/auth" }); }}>Sign out</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40" dir="ltr">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-6 py-3 backdrop-blur">
        <Link to="/" className="text-lg font-bold text-primary">Gunited Admin</Link>
        <Button variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/auth" }); }}>
          <LogOut className="mr-2 size-4" /> Sign out
        </Button>
      </header>
      <main className="mx-auto max-w-7xl p-6">
        <Outlet />
      </main>
    </div>
  );
}
