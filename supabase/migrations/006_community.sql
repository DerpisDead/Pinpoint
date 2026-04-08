-- ============================================================
-- PinPoint — Migration 006: Community Study Guide Sharing
-- ============================================================

-- ── 1. Extend xp_log source constraint ───────────────────────
DO $$
DECLARE conname text;
BEGIN
  SELECT c.conname INTO conname
  FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  JOIN pg_namespace n ON t.relnamespace = n.oid
  WHERE n.nspname = 'public' AND t.relname = 'xp_log' AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) LIKE '%source%';
  IF conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.xp_log DROP CONSTRAINT %I', conname);
  END IF;
END $$;

ALTER TABLE public.xp_log
  ADD CONSTRAINT xp_log_source_check
  CHECK (source IN ('card_review','test_complete','streak_bonus','badge_earned','guide_upload'));

-- ── 2. Extend badges requirement_type constraint ──────────────
DO $$
DECLARE conname text;
BEGIN
  SELECT c.conname INTO conname
  FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  JOIN pg_namespace n ON t.relnamespace = n.oid
  WHERE n.nspname = 'public' AND t.relname = 'badges' AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) LIKE '%requirement_type%';
  IF conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.badges DROP CONSTRAINT %I', conname);
  END IF;
END $$;

ALTER TABLE public.badges
  ADD CONSTRAINT badges_requirement_type_check
  CHECK (requirement_type IN ('streak','xp','mastery','tests','cards','guides'));

-- ── 3. study_guides ───────────────────────────────────────────
create table if not exists public.study_guides (
  id                uuid        primary key default uuid_generate_v4(),
  user_id           uuid        not null references public.profiles(id) on delete cascade,
  event_id          uuid        not null references public.events(id)   on delete cascade,
  title             text        not null check (char_length(title) <= 100),
  description       text        check (char_length(description) <= 500),
  file_url          text        not null,
  file_path         text        not null,
  file_name         text        not null,
  file_size_bytes   integer     not null,
  file_type         text        not null check (file_type in ('pdf','docx','pptx','xlsx','png','jpg','txt','md')),
  download_count    integer     not null default 0,
  upvote_count      integer     not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_study_guides_user_id    on public.study_guides(user_id);
create index if not exists idx_study_guides_event_id   on public.study_guides(event_id);
create index if not exists idx_study_guides_created_at on public.study_guides(created_at desc);

drop trigger if exists study_guides_updated_at on public.study_guides;
create trigger study_guides_updated_at
  before update on public.study_guides
  for each row execute procedure public.set_updated_at();

-- ── 4. study_guide_upvotes ────────────────────────────────────
create table if not exists public.study_guide_upvotes (
  id         uuid        primary key default uuid_generate_v4(),
  user_id    uuid        not null references public.profiles(id)      on delete cascade,
  guide_id   uuid        not null references public.study_guides(id)  on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, guide_id)
);

create index if not exists idx_guide_upvotes_guide_id on public.study_guide_upvotes(guide_id);

-- ── 5. study_guide_comments ───────────────────────────────────
create table if not exists public.study_guide_comments (
  id         uuid        primary key default uuid_generate_v4(),
  user_id    uuid        not null references public.profiles(id)     on delete cascade,
  guide_id   uuid        not null references public.study_guides(id) on delete cascade,
  content    text        not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists idx_guide_comments_guide_id on public.study_guide_comments(guide_id);

-- ── 6. RLS ────────────────────────────────────────────────────
alter table public.study_guides        enable row level security;
alter table public.study_guide_upvotes enable row level security;
alter table public.study_guide_comments enable row level security;

-- study_guides
create policy "study_guides: read all"
  on public.study_guides for select to authenticated using (true);
create policy "study_guides: insert own"
  on public.study_guides for insert with check (auth.uid() = user_id);
create policy "study_guides: update own"
  on public.study_guides for update using (auth.uid() = user_id);
create policy "study_guides: delete own"
  on public.study_guides for delete using (auth.uid() = user_id);

-- study_guide_upvotes
create policy "guide_upvotes: read all"
  on public.study_guide_upvotes for select to authenticated using (true);
create policy "guide_upvotes: insert own"
  on public.study_guide_upvotes for insert with check (auth.uid() = user_id);
create policy "guide_upvotes: delete own"
  on public.study_guide_upvotes for delete using (auth.uid() = user_id);

-- study_guide_comments
create policy "guide_comments: read all"
  on public.study_guide_comments for select to authenticated using (true);
create policy "guide_comments: insert own"
  on public.study_guide_comments for insert with check (auth.uid() = user_id);
create policy "guide_comments: delete own"
  on public.study_guide_comments for delete using (auth.uid() = user_id);

-- ── 7. Storage bucket ─────────────────────────────────────────
-- Creates the study-guides bucket (idempotent)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'study-guides',
  'study-guides',
  true,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'text/plain',
    'text/markdown'
  ]
) on conflict (id) do nothing;

-- Storage RLS: authenticated users upload to their own folder
create policy "study-guides upload own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'study-guides'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

create policy "study-guides read all authenticated"
  on storage.objects for select to authenticated
  using (bucket_id = 'study-guides');

create policy "study-guides delete own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'study-guides'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

-- ── 8. Contributor badge ──────────────────────────────────────
insert into public.badges (name, description, icon, requirement_type, requirement_value)
values (
  'Contributor',
  'Share 3 study guides with the HOSA community.',
  'Upload',
  'guides',
  3
) on conflict do nothing;
