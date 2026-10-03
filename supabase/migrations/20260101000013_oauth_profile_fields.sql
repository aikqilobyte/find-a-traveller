-- ============================================================
-- Make new-profile creation work for social sign-in
-- ============================================================
-- handle_new_user() was written for email signup, where the app controls
-- what goes into raw_user_meta_data and always sends full_name. OAuth
-- providers send their own shape: Google and Facebook both use `name`,
-- and Google sends the photo as `picture` while Supabase normalises some
-- providers to `avatar_url`.
--
-- Without this, a Google signup produced a profile named after the email
-- prefix — "khanasifulislam" instead of the person's actual name — and
-- threw away a perfectly good profile photo.
-- ============================================================

create or replace function handle_new_user() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, email, phone, avatar_url)
  values (
    new.id,
    -- Email signup sends full_name; Google and Facebook send name. The
    -- email prefix stays as the last resort so a profile always has
    -- something to show.
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'name'), ''),
      split_part(new.email, '@', 1)
    ),
    new.email,
    new.raw_user_meta_data->>'phone',
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'avatar_url'), ''),
      nullif(trim(new.raw_user_meta_data->>'picture'), '')
    )
  );
  return new;
end;
$$;
