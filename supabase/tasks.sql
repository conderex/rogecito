-- To-Do list (Eisenhower matrix) for DoingTheDoings / rogecito.
--
-- Run this ONCE in the Supabase SQL editor (Dashboard -> SQL Editor -> New
-- query -> paste -> Run). It creates the `tasks` table plus row-level
-- security so each user only ever sees their own rows.
--
-- Shape: one row per task. `quadrant` is one of
--   'do'       — Urgente + Importante        (HAZLO YA)
--   'schedule' — No urgente + Importante     (AGÉNDALO)
--   'delegate' — Urgente + No importante     (DELEGA / RECORTA)
--   'drop'     — No urgente + No importante  (SUÉLTALO)
-- `done_at` is null while the task is open; set to now() when marked done.
-- `sort_order` lets us reorder cards inside a column without renumbering
-- neighbours (higher = later; we default to epoch seconds at insert time).

create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  -- Default to the caller's uid so client inserts can omit `user_id` (matches
  -- the pattern used for tablitas / counters). The RLS policies below still
  -- enforce ownership regardless of what the client sends.
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  quadrant    text not null check (quadrant in ('do','schedule','delegate','drop')),
  text        text not null check (char_length(text) between 1 and 500),
  done_at     timestamptz,
  sort_order  double precision not null default extract(epoch from now()),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.tasks enable row level security;

drop policy if exists tasks_select_own on public.tasks;
drop policy if exists tasks_insert_own on public.tasks;
drop policy if exists tasks_update_own on public.tasks;
drop policy if exists tasks_delete_own on public.tasks;

create policy tasks_select_own on public.tasks
  for select using (auth.uid() = user_id);

create policy tasks_insert_own on public.tasks
  for insert with check (auth.uid() = user_id);

create policy tasks_update_own on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy tasks_delete_own on public.tasks
  for delete using (auth.uid() = user_id);

-- Keep updated_at fresh on every edit.
create or replace function public.tasks_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists tasks_touch_updated_at on public.tasks;
create trigger tasks_touch_updated_at
  before update on public.tasks
  for each row execute function public.tasks_touch_updated_at();

-- Fast per-user, per-column reads sorted by sort_order.
create index if not exists tasks_user_quadrant_idx
  on public.tasks (user_id, quadrant, done_at nulls first, sort_order);

-- Also make delete_user() reach these rows if it wipes by user_id lists.
-- (delete_user already cascades from auth.users via the FK above; nothing extra needed.)
