-- Owner-only analytics for DoingTheDoings / rogecito.
--
-- Run this ONCE in the Supabase SQL editor (Dashboard -> SQL Editor -> New query
-- -> paste -> Run). It creates a single function that returns aggregated, privacy-
-- safe numbers (counts only, never another user's raw data) and ONLY to the owner.
--
-- "Active" means a user recorded at least one mark/tap that day (table public.checks).
-- Everything is computed server-side, so the app only ever downloads a handful of
-- numbers regardless of how many users you have.

create or replace function public.owner_stats()
returns json
language sql
security definer
set search_path = ''
as $$
  select case
    when coalesce(auth.jwt() ->> 'email', '') <> 'rogerthatheart@gmail.com'
      then json_build_object('error', 'forbidden')
    else json_build_object(
      'total_users',  (select count(*) from auth.users),
      'new_7d',       (select count(*) from auth.users where created_at >= now() - interval '7 days'),
      'new_30d',      (select count(*) from auth.users where created_at >= now() - interval '30 days'),
      'active_today', (select count(distinct user_id) from public.checks where check_date = current_date),
      'active_7d',    (select count(distinct user_id) from public.checks where check_date >= current_date - 6),
      'active_30d',   (select count(distinct user_id) from public.checks where check_date >= current_date - 29),
      'returning_7d', (
        select count(distinct c.user_id)
        from public.checks c
        join auth.users u on u.id = c.user_id
        where c.check_date >= current_date - 6
          and u.created_at < now() - interval '7 days'
      ),
      'daily', (
        select coalesce(json_agg(json_build_object('day', t.day, 'users', t.users) order by t.day), '[]'::json)
        from (
          select check_date as day, count(distinct user_id) as users
          from public.checks
          where check_date >= current_date - 13
          group by check_date
        ) t
      )
    )
  end;
$$;

-- Only logged-in users can call it; the function itself only answers the owner.
revoke all on function public.owner_stats() from public, anon;
grant execute on function public.owner_stats() to authenticated;

-- Speeds up the per-day aggregates as data grows.
create index if not exists checks_check_date_idx on public.checks (check_date);
