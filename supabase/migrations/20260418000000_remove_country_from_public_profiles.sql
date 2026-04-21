create or replace view public.public_profiles as
select
  id,
  nickname,
  avatar_path
from public.profiles;

grant select on public.public_profiles to anon, authenticated;
