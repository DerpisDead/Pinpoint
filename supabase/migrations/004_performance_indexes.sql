-- Performance indexes for critical query paths
-- Run in Supabase Dashboard → SQL Editor

-- user_cards: most queries filter by user_id + card_id, order by next_review
create index if not exists idx_user_cards_user_id       on public.user_cards (user_id);
create index if not exists idx_user_cards_card_id       on public.user_cards (card_id);
create index if not exists idx_user_cards_next_review   on public.user_cards (next_review asc);
create index if not exists idx_user_cards_user_review   on public.user_cards (user_id, next_review asc);

-- cards: filter by event_id
create index if not exists idx_cards_event_id           on public.cards (event_id);

-- user_events: filter by user_id and event_id
create index if not exists idx_user_events_user_id      on public.user_events (user_id);
create index if not exists idx_user_events_event_id     on public.user_events (event_id);

-- reviews: filter by user_id, order by reviewed_at
create index if not exists idx_reviews_user_id          on public.reviews (user_id);
create index if not exists idx_reviews_reviewed_at      on public.reviews (reviewed_at desc);
create index if not exists idx_reviews_card_id          on public.reviews (card_id);

-- practice_tests: filter by user_id, event_id
create index if not exists idx_practice_tests_user_id   on public.practice_tests (user_id);
create index if not exists idx_practice_tests_event_id  on public.practice_tests (event_id);

-- xp_log: filter by user_id, order by created_at
create index if not exists idx_xp_log_user_id           on public.xp_log (user_id);

-- user_badges: filter by user_id
create index if not exists idx_user_badges_user_id      on public.user_badges (user_id);
