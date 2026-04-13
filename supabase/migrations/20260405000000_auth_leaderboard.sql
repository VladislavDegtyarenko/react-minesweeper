create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null unique,
  first_name text,
  last_name text,
  email text,
  country text,
  avatar_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.best_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  level_id text not null check (level_id in ('easy', 'medium', 'expert')),
  best_time_ms integer not null check (best_time_ms >= 0),
  achieved_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, level_id)
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

drop trigger if exists best_scores_set_updated_at on public.best_scores;
create trigger best_scores_set_updated_at
before update on public.best_scores
for each row
execute function public.handle_updated_at();

create or replace function public.sync_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    nickname,
    first_name,
    last_name,
    email,
    country
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nickname', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.email,
    new.raw_user_meta_data ->> 'country'
  )
  on conflict (id) do update
  set
    nickname = excluded.nickname,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    email = excluded.email,
    country = excluded.country,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update on auth.users
for each row
execute function public.sync_profile_from_auth_user();

create or replace view public.leaderboard_entries as
select
  best_scores.user_id,
  profiles.nickname,
  profiles.avatar_path,
  best_scores.level_id,
  best_scores.best_time_ms,
  best_scores.achieved_at
from public.best_scores
join public.profiles on profiles.id = best_scores.user_id;

create or replace view public.public_profiles as
select
  id,
  nickname,
  avatar_path,
  country
from public.profiles;

alter table public.profiles enable row level security;
alter table public.best_scores enable row level security;

drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Best scores are readable by owner" on public.best_scores;
create policy "Best scores are readable by owner"
on public.best_scores
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Best scores are insertable by owner" on public.best_scores;
create policy "Best scores are insertable by owner"
on public.best_scores
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Best scores are updatable by owner" on public.best_scores;
create policy "Best scores are updatable by owner"
on public.best_scores
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select on public.leaderboard_entries to anon, authenticated;
grant select on public.public_profiles to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly readable" on storage.objects;
create policy "Avatar images are publicly readable"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatar images" on storage.objects;
create policy "Users can upload own avatar images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can update own avatar images" on storage.objects;
create policy "Users can update own avatar images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can delete own avatar images" on storage.objects;
create policy "Users can delete own avatar images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);
