
-- 1. Storage bucket for service images
insert into storage.buckets (id, name, public)
values ('services', 'services', true)
on conflict (id) do nothing;

create policy "Public read services bucket"
on storage.objects for select
using (bucket_id = 'services');

create policy "Admins upload to services bucket"
on storage.objects for insert to authenticated
with check (bucket_id = 'services' and public.has_role(auth.uid(), 'admin'));

create policy "Admins update services bucket"
on storage.objects for update to authenticated
using (bucket_id = 'services' and public.has_role(auth.uid(), 'admin'));

create policy "Admins delete services bucket"
on storage.objects for delete to authenticated
using (bucket_id = 'services' and public.has_role(auth.uid(), 'admin'));

-- 2. Page views analytics table
create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index idx_page_views_created_at on public.page_views (created_at desc);
create index idx_page_views_path on public.page_views (path);

alter table public.page_views enable row level security;

create policy "Anyone records page view"
on public.page_views for insert to anon, authenticated
with check (char_length(path) between 1 and 500);

create policy "Admins read page views"
on public.page_views for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- 3. Auto-grant admin role to designated owner email on signup
create or replace function public.grant_owner_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email = 'gunitedtravel@gmail.com' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_grant_admin on auth.users;
create trigger on_auth_user_created_grant_admin
after insert on auth.users
for each row execute function public.grant_owner_admin();

-- 4. If the owner has already signed up, grant role now
insert into public.user_roles (user_id, role)
select id, 'admin'::app_role from auth.users
where email = 'gunitedtravel@gmail.com'
on conflict do nothing;

-- 5. Allow admins to look up emails for invites (read-only RPC)
create or replace function public.find_user_id_by_email(_email text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from auth.users where email = _email limit 1;
$$;

revoke all on function public.find_user_id_by_email(text) from public, anon;
grant execute on function public.find_user_id_by_email(text) to authenticated;

-- 6. List admin emails (admins only)
create or replace function public.list_admin_users()
returns table (user_id uuid, email text, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select u.id, u.email::text, ur.created_at
  from public.user_roles ur
  join auth.users u on u.id = ur.user_id
  where ur.role = 'admin'
  and public.has_role(auth.uid(), 'admin');
$$;

revoke all on function public.list_admin_users() from public, anon;
grant execute on function public.list_admin_users() to authenticated;
