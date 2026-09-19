create extension if not exists pgcrypto;

create table public.datasets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug in ('assignment-15','expanded-50')),
  title text not null,
  version integer not null check (version > 0),
  checksum_sha256 text not null check (checksum_sha256 ~ '^[0-9a-f]{64}$'),
  source_manifest jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.countries (
  iso3 text primary key check (iso3 ~ '^[A-Z]{3}$'),
  name_en text not null unique
);

create table public.energy_records (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references public.datasets(id) on delete cascade,
  country_iso3 text not null references public.countries(iso3),
  household_price jsonb not null,
  business_price jsonb not null,
  consumption jsonb not null,
  production jsonb not null,
  trade_exposure jsonb not null,
  electricity_generation jsonb not null,
  electricity jsonb not null,
  sources jsonb not null,
  unique(dataset_id,country_iso3)
);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text check (theme in ('light','dark','system')),
  locale text check (locale in ('en','zh-CN','es','ar','fr','pt-BR')),
  dashboard_state jsonb,
  updated_at timestamptz not null default now()
);

create table public.saved_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  state jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index saved_views_user_id_idx on public.saved_views(user_id);

create or replace function public.enforce_saved_view_limit() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if (select count(*) from public.saved_views where user_id = new.user_id) >= 25 then
    raise exception 'A user may save at most 25 views';
  end if;
  return new;
end $$;
create trigger saved_view_limit before insert on public.saved_views for each row execute function public.enforce_saved_view_limit();

create view public.atlas_records with (security_invoker = true) as
select d.slug as dataset_scope, c.iso3, c.name_en as country,
  e.household_price, e.business_price, e.consumption, e.production, e.trade_exposure,
  e.electricity_generation, e.electricity, e.sources
from public.energy_records e
join public.datasets d on d.id = e.dataset_id
join public.countries c on c.iso3 = e.country_iso3;

alter table public.datasets enable row level security;
alter table public.countries enable row level security;
alter table public.energy_records enable row level security;
alter table public.profiles enable row level security;
alter table public.saved_views enable row level security;

revoke all on public.datasets, public.countries, public.energy_records, public.profiles, public.saved_views from anon;
revoke all on public.atlas_records from anon;
grant select on public.datasets, public.countries, public.energy_records, public.atlas_records to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.saved_views to authenticated;

create policy "authenticated datasets" on public.datasets for select to authenticated using ((select auth.uid()) is not null);
create policy "authenticated countries" on public.countries for select to authenticated using ((select auth.uid()) is not null);
create policy "authenticated records" on public.energy_records for select to authenticated using ((select auth.uid()) is not null);

create policy "own profile select" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "own profile insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own profile update" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "own views select" on public.saved_views for select to authenticated using ((select auth.uid()) = user_id);
create policy "own views insert" on public.saved_views for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own views update" on public.saved_views for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own views delete" on public.saved_views for delete to authenticated using ((select auth.uid()) = user_id);
