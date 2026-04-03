-- ============================================================
-- PinPoint — Initial Schema
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension (already enabled by default in Supabase)
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text,
  avatar_url      text,
  total_xp        integer not null default 0,
  current_streak  integer not null default 0,
  longest_streak  integer not null default 0,
  streak_last_date date,
  level           integer not null default 1,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- EVENTS
-- ============================================================
create table if not exists public.events (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  category    text not null,
  description text,
  color       text not null,   -- hex color for UI theming
  icon        text not null,   -- lucide-react icon name
  created_at  timestamptz not null default now()
);

-- ============================================================
-- USER_EVENTS
-- ============================================================
create table if not exists public.user_events (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  event_id    uuid not null references public.events(id) on delete cascade,
  selected_at timestamptz not null default now(),
  unique (user_id, event_id)
);

-- ============================================================
-- CARDS
-- ============================================================
create table if not exists public.cards (
  id          uuid primary key default uuid_generate_v4(),
  event_id    uuid not null references public.events(id) on delete cascade,
  front       text not null,
  back        text not null,
  image_url   text,
  difficulty  text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  created_at  timestamptz not null default now()
);

-- ============================================================
-- USER_CARDS  (SRS state per user per card)
-- ============================================================
create table if not exists public.user_cards (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  card_id         uuid not null references public.cards(id) on delete cascade,
  ease_factor     float not null default 2.5,
  interval_days   integer not null default 0,
  repetitions     integer not null default 0,
  next_review     timestamptz not null default now(),
  last_quality    integer check (last_quality >= 0 and last_quality <= 5),
  last_reviewed   timestamptz,
  times_reviewed  integer not null default 0,
  created_at      timestamptz not null default now(),
  unique (user_id, card_id)
);

-- ============================================================
-- REVIEWS  (immutable history log)
-- ============================================================
create table if not exists public.reviews (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  card_id           uuid not null references public.cards(id) on delete cascade,
  quality           integer not null check (quality >= 0 and quality <= 5),
  response_time_ms  integer,
  reviewed_at       timestamptz not null default now()
);

-- ============================================================
-- PRACTICE_TESTS
-- ============================================================
create table if not exists public.practice_tests (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  event_id             uuid not null references public.events(id) on delete cascade,
  score                integer not null,
  total_questions      integer not null,
  time_taken_seconds   integer,
  completed_at         timestamptz not null default now()
);

-- ============================================================
-- BADGES
-- ============================================================
create table if not exists public.badges (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  description         text,
  icon                text,
  requirement_type    text not null check (requirement_type in ('streak', 'xp', 'mastery', 'tests', 'cards')),
  requirement_value   integer not null,
  created_at          timestamptz not null default now()
);

-- ============================================================
-- USER_BADGES
-- ============================================================
create table if not exists public.user_badges (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  badge_id   uuid not null references public.badges(id) on delete cascade,
  earned_at  timestamptz not null default now(),
  unique (user_id, badge_id)
);

-- ============================================================
-- XP_LOG
-- ============================================================
create table if not exists public.xp_log (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  amount      integer not null,
  source      text not null check (source in ('card_review', 'test_complete', 'streak_bonus', 'badge_earned')),
  details     jsonb,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- INDEXES  (performance)
-- ============================================================
create index if not exists idx_user_cards_user_id        on public.user_cards(user_id);
create index if not exists idx_user_cards_next_review    on public.user_cards(next_review);
create index if not exists idx_reviews_user_id           on public.reviews(user_id);
create index if not exists idx_reviews_card_id           on public.reviews(card_id);
create index if not exists idx_reviews_reviewed_at       on public.reviews(reviewed_at);
create index if not exists idx_practice_tests_user_id    on public.practice_tests(user_id);
create index if not exists idx_xp_log_user_id            on public.xp_log(user_id);
create index if not exists idx_cards_event_id            on public.cards(event_id);
create index if not exists idx_user_events_user_id       on public.user_events(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles       enable row level security;
alter table public.events         enable row level security;
alter table public.user_events    enable row level security;
alter table public.cards          enable row level security;
alter table public.user_cards     enable row level security;
alter table public.reviews        enable row level security;
alter table public.practice_tests enable row level security;
alter table public.badges         enable row level security;
alter table public.user_badges    enable row level security;
alter table public.xp_log         enable row level security;

-- profiles: own row only
create policy "profiles: read own"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id);

-- events: any authenticated user can read
create policy "events: read all"  on public.events for select to authenticated using (true);

-- cards: any authenticated user can read
create policy "cards: read all"   on public.cards for select to authenticated using (true);

-- badges: any authenticated user can read
create policy "badges: read all"  on public.badges for select to authenticated using (true);

-- user_events: own rows only
create policy "user_events: read own"   on public.user_events for select using (auth.uid() = user_id);
create policy "user_events: insert own" on public.user_events for insert with check (auth.uid() = user_id);
create policy "user_events: delete own" on public.user_events for delete using (auth.uid() = user_id);

-- user_cards: own rows only
create policy "user_cards: read own"   on public.user_cards for select using (auth.uid() = user_id);
create policy "user_cards: insert own" on public.user_cards for insert with check (auth.uid() = user_id);
create policy "user_cards: update own" on public.user_cards for update using (auth.uid() = user_id);
create policy "user_cards: delete own" on public.user_cards for delete using (auth.uid() = user_id);

-- reviews: own rows only
create policy "reviews: read own"   on public.reviews for select using (auth.uid() = user_id);
create policy "reviews: insert own" on public.reviews for insert with check (auth.uid() = user_id);

-- practice_tests: own rows only
create policy "practice_tests: read own"   on public.practice_tests for select using (auth.uid() = user_id);
create policy "practice_tests: insert own" on public.practice_tests for insert with check (auth.uid() = user_id);

-- user_badges: own rows only
create policy "user_badges: read own"   on public.user_badges for select using (auth.uid() = user_id);
create policy "user_badges: insert own" on public.user_badges for insert with check (auth.uid() = user_id);

-- xp_log: own rows only
create policy "xp_log: read own"   on public.xp_log for select using (auth.uid() = user_id);
create policy "xp_log: insert own" on public.xp_log for insert with check (auth.uid() = user_id);
