create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  created_at timestamptz not null default now()
);

create table if not exists public.cultural_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  description text not null check (char_length(description) between 1 and 5000),
  category text not null check (category in ('song', 'attire', 'dance', 'place')),
  province text not null,
  community text not null,
  language text not null default '',
  media_path text,
  media_type text check (media_type in ('audio', 'image', 'video', 'link')),
  lyrics text,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'published'))
);

alter table public.cultural_entries
  add column if not exists media_path text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'cultural_entries'
      and column_name = 'media_url'
  ) then
    execute $migration$
      update public.cultural_entries
      set media_path = regexp_replace(
        split_part(media_url, '?', 1),
        '^.*/storage/v1/object/(public|sign)/cultural-media/',
        ''
      )
      where media_path is null
        and media_url ~ '/storage/v1/object/(public|sign)/cultural-media/'
    $migration$;
  end if;
end;
$$;

create index if not exists cultural_entries_published_category_created
  on public.cultural_entries (category, created_at desc)
  where status = 'published';

create index if not exists cultural_entries_owner_created
  on public.cultural_entries (created_by, created_at desc);

alter table public.profiles enable row level security;
alter table public.cultural_entries enable row level security;

drop policy if exists "Authenticated members can read profiles" on public.profiles;
create policy "Authenticated members can read profiles"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Members can update their profile" on public.profiles;
create policy "Members can update their profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Members can read published entries and their own" on public.cultural_entries;
create policy "Members can read published entries and their own"
  on public.cultural_entries for select to authenticated
  using (status = 'published' or (select auth.uid()) = created_by);

drop policy if exists "Members can submit their own entries for review" on public.cultural_entries;
create policy "Members can submit their own entries for review"
  on public.cultural_entries for insert to authenticated
  with check (
    (select auth.uid()) = created_by
    and status = 'pending'
    and (media_path is null or media_path like ((select auth.uid())::text || '/%'))
  );

drop policy if exists "Members can update their own pending entries" on public.cultural_entries;
drop policy if exists "Members can update their own entries" on public.cultural_entries;
create policy "Members can update their own entries"
  on public.cultural_entries for update to authenticated
  using ((select auth.uid()) = created_by)
  with check (
    (select auth.uid()) = created_by
    and status = 'pending'
    and (media_path is null or media_path like ((select auth.uid())::text || '/%'))
  );

drop policy if exists "Members can delete their own pending entries" on public.cultural_entries;
drop policy if exists "Members can delete their own entries" on public.cultural_entries;
create policy "Members can delete their own entries"
  on public.cultural_entries for delete to authenticated
  using ((select auth.uid()) = created_by);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Community member'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

insert into storage.buckets (id, name, public, file_size_limit)
values ('cultural-media', 'cultural-media', false, 104857600)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit;

drop policy if exists "Members can view published or their own archive media" on storage.objects;
drop policy if exists "Anyone can view published archive media" on storage.objects;
create policy "Members can view published or their own archive media"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'cultural-media'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or exists (
        select 1
        from public.cultural_entries as entry
        where entry.media_path = storage.objects.name
          and entry.status = 'published'
      )
    )
  );

drop policy if exists "Members can upload their own archive media" on storage.objects;
create policy "Members can upload their own archive media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'cultural-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Members can delete their own archive media" on storage.objects;
create policy "Members can delete their own archive media"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'cultural-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
