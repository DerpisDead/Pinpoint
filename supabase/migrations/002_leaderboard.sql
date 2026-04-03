-- ============================================================
-- PinPoint — Leaderboard & League Migration
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Add league column to profiles ────────────────────────
alter table public.profiles
  add column if not exists league text not null default 'Bronze';

-- ── 2. Fix xp_log source constraint (add session_complete) ──
alter table public.xp_log
  drop constraint if exists xp_log_source_check;

alter table public.xp_log
  add constraint xp_log_source_check
  check (source in ('card_review', 'test_complete', 'streak_bonus', 'badge_earned', 'session_complete'));

-- ── 3. Allow authenticated users to read all profiles ───────
--    Needed for leaderboard — profiles contains no sensitive PII
drop policy if exists "profiles: read all authenticated" on public.profiles;
create policy "profiles: read all authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- ── 4. Performance indexes ───────────────────────────────────
create index if not exists idx_profiles_total_xp
  on public.profiles (total_xp desc);

create index if not exists idx_xp_log_created_at
  on public.xp_log (created_at desc);

-- ── 5. All-time leaderboard RPC ──────────────────────────────
create or replace function public.get_alltime_leaderboard()
returns table (
  user_id     uuid,
  display_name text,
  level       integer,
  avatar_url  text,
  league      text,
  total_xp    integer
)
language sql stable security definer set search_path = public as $$
  select id, display_name, level, avatar_url, league, total_xp
  from profiles
  order by total_xp desc
  limit 50;
$$;

-- ── 6. Weekly leaderboard RPC ────────────────────────────────
create or replace function public.get_weekly_leaderboard(week_start timestamptz)
returns table (
  user_id      uuid,
  display_name text,
  level        integer,
  avatar_url   text,
  league       text,
  weekly_xp    bigint
)
language sql stable security definer set search_path = public as $$
  select
    l.user_id,
    p.display_name,
    p.level,
    p.avatar_url,
    p.league,
    sum(l.amount)::bigint as weekly_xp
  from xp_log l
  join profiles p on p.id = l.user_id
  where l.created_at >= week_start
  group by l.user_id, p.display_name, p.level, p.avatar_url, p.league
  order by weekly_xp desc
  limit 50;
$$;

-- ── 7. Event mastery leaderboard RPC ─────────────────────────
create or replace function public.get_event_mastery_leaderboard(p_event_id uuid)
returns table (
  user_id       uuid,
  display_name  text,
  level         integer,
  avatar_url    text,
  league        text,
  mastery_pct   numeric,
  mastered_cards bigint,
  total_cards   bigint
)
language sql stable security definer set search_path = public as $$
  select
    uc.user_id,
    p.display_name,
    p.level,
    p.avatar_url,
    p.league,
    round(
      sum(case when uc.ease_factor >= 3.0 then 1 else 0 end)::numeric
        / nullif(count(*), 0) * 100,
      1
    ) as mastery_pct,
    sum(case when uc.ease_factor >= 3.0 then 1 else 0 end)::bigint as mastered_cards,
    count(*)::bigint as total_cards
  from user_cards uc
  join cards c on c.id = uc.card_id
  join profiles p on p.id = uc.user_id
  where c.event_id = p_event_id
  group by uc.user_id, p.display_name, p.level, p.avatar_url, p.league
  having count(*) > 0
  order by mastery_pct desc
  limit 50;
$$;

-- ── 8. Backfill league for existing profiles ─────────────────
update public.profiles set league =
  case
    when total_xp >= 50000 then 'Diamond'
    when total_xp >= 15000 then 'Platinum'
    when total_xp >= 5000  then 'Gold'
    when total_xp >= 1000  then 'Silver'
    else 'Bronze'
  end;
