-- Dalilak: schema + Row Level Security
-- Run in Supabase: SQL Editor > New query > paste > Run. Safe to re-run.

create extension if not exists "pgcrypto";

-- ───────────── Tables ─────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  icon text not null default 'folder',
  position int not null default 0,
  title_ar text not null,
  title_en text not null,
  desc_ar text not null default '',
  desc_en text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- documents / steps / links are ordered jsonb arrays so the admin can reorder them freely.
--   documents: [{ "ar": "...", "en": "...", "note_ar": "...", "note_en": "..." }]
--   steps:     [{ "ar": "...", "en": "...", "detail_ar": "...", "detail_en": "..." }]
--   links:     [{ "label_ar": "...", "label_en": "...", "url": "https://..." }]
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category_id uuid not null references public.categories(id) on delete restrict,
  title_ar text not null,
  title_en text not null,
  summary_ar text not null default '',
  summary_en text not null default '',
  documents jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  fees_ar text not null default '',
  fees_en text not null default '',
  duration_ar text not null default '',
  duration_en text not null default '',
  location_ar text not null default '',
  location_en text not null default '',
  links jsonb not null default '[]'::jsonb,
  tips_ar text not null default '',
  tips_en text not null default '',
  popular boolean not null default false,
  published boolean not null default false,
  needs_review boolean not null default true,
  last_verified date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists services_category_idx on public.services(category_id);
create index if not exists services_published_idx on public.services(published);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, service_id)
);

create table if not exists public.checklist_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  checked jsonb not null default '[]'::jsonb,   -- array of ticked document indexes
  updated_at timestamptz not null default now(),
  primary key (user_id, service_id)
);

-- ───────────── Helpers ─────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists categories_touch on public.categories;
create trigger categories_touch before update on public.categories
  for each row execute function public.touch_updated_at();
drop trigger if exists services_touch on public.services;
create trigger services_touch before update on public.services
  for each row execute function public.touch_updated_at();
drop trigger if exists checklist_touch on public.checklist_state;
create trigger checklist_touch before update on public.checklist_state
  for each row execute function public.touch_updated_at();

-- Create a profile row (role = user) for every new sign-up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role) values (new.id, 'user') on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for users that existed before the trigger.
insert into public.profiles (id, role)
  select id, 'user' from auth.users on conflict do nothing;

-- ───────────── Row Level Security ─────────────
alter table public.profiles        enable row level security;
alter table public.categories      enable row level security;
alter table public.services        enable row level security;
alter table public.favorites       enable row level security;
alter table public.checklist_state enable row level security;

-- profiles: a user can read ONLY their own row; nobody can write from the client
-- (roles are changed from the SQL editor / service role, so users can never self-promote).
drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles
  for select using (id = auth.uid());

-- categories: public read, admin write
drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories
  for select using (true);
drop policy if exists "categories admin insert" on public.categories;
create policy "categories admin insert" on public.categories
  for insert with check (public.is_admin());
drop policy if exists "categories admin update" on public.categories;
create policy "categories admin update" on public.categories
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "categories admin delete" on public.categories;
create policy "categories admin delete" on public.categories
  for delete using (public.is_admin());

-- services: public can read ONLY published rows; admins can read/write everything
drop policy if exists "services public read published" on public.services;
create policy "services public read published" on public.services
  for select using (published = true or public.is_admin());
drop policy if exists "services admin insert" on public.services;
create policy "services admin insert" on public.services
  for insert with check (public.is_admin());
drop policy if exists "services admin update" on public.services;
create policy "services admin update" on public.services
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "services admin delete" on public.services;
create policy "services admin delete" on public.services
  for delete using (public.is_admin());

-- favorites: strictly own rows
drop policy if exists "favorites own select" on public.favorites;
create policy "favorites own select" on public.favorites
  for select using (user_id = auth.uid());
drop policy if exists "favorites own insert" on public.favorites;
create policy "favorites own insert" on public.favorites
  for insert with check (user_id = auth.uid());
drop policy if exists "favorites own delete" on public.favorites;
create policy "favorites own delete" on public.favorites
  for delete using (user_id = auth.uid());

-- checklist_state: strictly own rows
drop policy if exists "checklist own select" on public.checklist_state;
create policy "checklist own select" on public.checklist_state
  for select using (user_id = auth.uid());
drop policy if exists "checklist own insert" on public.checklist_state;
create policy "checklist own insert" on public.checklist_state
  for insert with check (user_id = auth.uid());
drop policy if exists "checklist own update" on public.checklist_state;
create policy "checklist own update" on public.checklist_state
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "checklist own delete" on public.checklist_state;
create policy "checklist own delete" on public.checklist_state
  for delete using (user_id = auth.uid());

-- Privileges: anon may only read; authenticated gets table access that RLS then narrows.
revoke all on public.profiles, public.categories, public.services, public.favorites, public.checklist_state from anon, authenticated;
grant select on public.categories, public.services to anon, authenticated;
grant insert, update, delete on public.categories, public.services to authenticated;
grant select on public.profiles to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select, insert, update, delete on public.checklist_state to authenticated;

-- ───────────── Make the first admin ─────────────
-- 1) Sign up on the site with your email.
-- 2) Run (replace the email):
--    update public.profiles set role = 'admin'
--    where id = (select id from auth.users where email = 'you@example.com');
