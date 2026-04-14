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
    email = excluded.email,
    updated_at = timezone('utc', now());

  return new;
end;
$$;
