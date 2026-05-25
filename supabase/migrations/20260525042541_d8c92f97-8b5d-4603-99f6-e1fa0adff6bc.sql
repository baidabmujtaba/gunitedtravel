
create or replace function public.find_user_id_by_email(_email text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from auth.users
  where email = _email
  and public.has_role(auth.uid(), 'admin')
  limit 1;
$$;
