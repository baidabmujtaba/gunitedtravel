import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Trash2, KeyRound, UserPlus } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: UsersAdmin,
});

export function UsersAdmin() {
  const qc = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const { data: admins } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_admin_users");
      if (error) throw error;
      return data;
    },
  });

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });

  const invite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;
    const { data: uid, error } = await supabase.rpc("find_user_id_by_email", { _email: email });
    if (error) { toast.error(error.message); return; }
    if (!uid) { toast.error("No account found for that email. Ask them to sign up at /auth first."); return; }
    const { error: e2 } = await supabase.from("user_roles").insert({ user_id: uid, role: "admin" });
    if (e2) { toast.error(e2.message); return; }
    toast.success("Admin role granted");
    setInviteEmail("");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const revoke = async (userId: string) => {
    if (userId === me?.id) { toast.error("You can't revoke your own admin role."); return; }
    if (!confirm("Revoke admin access?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const changePassword = async () => {
    if (pw.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (pw !== pw2) { toast.error("Passwords do not match."); return; }
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    setPw(""); setPw2("");
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-primary">Admin users</h1>
      <p className="text-sm text-muted-foreground">Grant or revoke admin access and change your password.</p>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><UserPlus className="size-4" /> Grant admin access</h2>
        <p className="mt-1 text-xs text-muted-foreground">The person must sign up at /auth first. Then enter their email here.</p>
        <div className="mt-3 flex gap-2">
          <Input type="email" placeholder="person@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
          <Button onClick={invite} className="bg-primary hover:bg-primary/90">Grant</Button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="size-4" /> Current admins</h2>
        <div className="mt-3 divide-y divide-border">
          {(admins ?? []).length === 0 && <p className="py-3 text-sm text-muted-foreground">No admins yet.</p>}
          {(admins ?? []).map((a) => (
            <div key={a.user_id} className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium">{a.email}</div>
                <div className="text-xs text-muted-foreground">Since {new Date(a.created_at).toLocaleDateString()}</div>
              </div>
              <Button size="sm" variant="destructive" disabled={a.user_id === me?.id} onClick={() => revoke(a.user_id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><KeyRound className="size-4" /> Change your password</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="grid gap-1.5"><Label>New password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label>Confirm new password</Label><Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
        </div>
        <Button onClick={changePassword} className="mt-4 bg-primary hover:bg-primary/90">Update password</Button>
      </section>
    </div>
  );
}
