-- Self-service account deletion (App Store / Play Store requirement).
-- Deletes the calling user's data and their auth account. SECURITY DEFINER
-- so it can touch auth.users; it only ever acts on auth.uid() — a caller
-- can never delete anyone else.
create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  delete from public.sub_activities where user_id = uid;
  delete from public.checks         where user_id = uid;
  delete from public.counters       where user_id = uid;
  delete from public.tablitas       where user_id = uid;
  delete from auth.users            where id = uid;
end;
$$;

revoke all on function public.delete_user() from public;
revoke all on function public.delete_user() from anon;
grant execute on function public.delete_user() to authenticated;
