-- ============================================================
-- PinPoint — Migration 006: Correct Event List
-- Trims to test-only events, adds missing events,
-- and introduces the Recognition category.
-- ============================================================

-- ── Step 1: Remove non-test Health Professions events ────────
-- These events have no written test component per HOSA guidelines.

delete from public.user_cards
  where card_id in (
    select id from public.cards where event_id in (
      'b2000000-0000-0000-0000-000000000003', -- Clinical Specialty
      'b2000000-0000-0000-0000-000000000005', -- Family Medicine Physician
      'b2000000-0000-0000-0000-000000000006', -- Home Health Aide
      'b2000000-0000-0000-0000-000000000009', -- Occupational Therapy
      'b2000000-0000-0000-0000-000000000010', -- Patient Care Technician
      'b2000000-0000-0000-0000-000000000011', -- Personal Care
      'b2000000-0000-0000-0000-000000000015', -- Respiratory Therapy
      'b2000000-0000-0000-0000-000000000017'  -- Surgical Technologist
    )
  );

delete from public.cards where event_id in (
  'b2000000-0000-0000-0000-000000000003',
  'b2000000-0000-0000-0000-000000000005',
  'b2000000-0000-0000-0000-000000000006',
  'b2000000-0000-0000-0000-000000000009',
  'b2000000-0000-0000-0000-000000000010',
  'b2000000-0000-0000-0000-000000000011',
  'b2000000-0000-0000-0000-000000000015',
  'b2000000-0000-0000-0000-000000000017'
);

delete from public.user_events where event_id in (
  'b2000000-0000-0000-0000-000000000003',
  'b2000000-0000-0000-0000-000000000005',
  'b2000000-0000-0000-0000-000000000006',
  'b2000000-0000-0000-0000-000000000009',
  'b2000000-0000-0000-0000-000000000010',
  'b2000000-0000-0000-0000-000000000011',
  'b2000000-0000-0000-0000-000000000015',
  'b2000000-0000-0000-0000-000000000017'
);

delete from public.events where id in (
  'b2000000-0000-0000-0000-000000000003',
  'b2000000-0000-0000-0000-000000000005',
  'b2000000-0000-0000-0000-000000000006',
  'b2000000-0000-0000-0000-000000000009',
  'b2000000-0000-0000-0000-000000000010',
  'b2000000-0000-0000-0000-000000000011',
  'b2000000-0000-0000-0000-000000000015',
  'b2000000-0000-0000-0000-000000000017'
);

-- ── Step 2: Remove non-test Emergency Preparedness events ────
-- Life Support Skills, MRC Partnership, Public Health (EP), Mental Health Promotion
-- have no written test component.

delete from public.user_cards
  where card_id in (
    select id from public.cards where event_id in (
      'b3000000-0000-0000-0000-000000000004',
      'b3000000-0000-0000-0000-000000000005',
      'b3000000-0000-0000-0000-000000000006',
      'b3000000-0000-0000-0000-000000000007'
    )
  );

delete from public.cards where event_id in (
  'b3000000-0000-0000-0000-000000000004',
  'b3000000-0000-0000-0000-000000000005',
  'b3000000-0000-0000-0000-000000000006',
  'b3000000-0000-0000-0000-000000000007'
);

delete from public.user_events where event_id in (
  'b3000000-0000-0000-0000-000000000004',
  'b3000000-0000-0000-0000-000000000005',
  'b3000000-0000-0000-0000-000000000006',
  'b3000000-0000-0000-0000-000000000007'
);

delete from public.events where id in (
  'b3000000-0000-0000-0000-000000000004', -- Life Support Skills
  'b3000000-0000-0000-0000-000000000005', -- MRC Partnership
  'b3000000-0000-0000-0000-000000000006', -- Public Health (EP)
  'b3000000-0000-0000-0000-000000000007'  -- Mental Health Promotion
);

-- ── Step 3: Remove all old Leadership events ──────────────────
-- None of the previous Leadership events have a test component.
-- Organizational Leadership (added below) is the only one that does.

delete from public.user_cards
  where card_id in (
    select id from public.cards where event_id in (
      'b4000000-0000-0000-0000-000000000001',
      'b4000000-0000-0000-0000-000000000002',
      'b4000000-0000-0000-0000-000000000003',
      'b4000000-0000-0000-0000-000000000004',
      'b4000000-0000-0000-0000-000000000005',
      'b4000000-0000-0000-0000-000000000006',
      'b4000000-0000-0000-0000-000000000007',
      'b4000000-0000-0000-0000-000000000008',
      'b4000000-0000-0000-0000-000000000009'
    )
  );

delete from public.cards where event_id in (
  'b4000000-0000-0000-0000-000000000001',
  'b4000000-0000-0000-0000-000000000002',
  'b4000000-0000-0000-0000-000000000003',
  'b4000000-0000-0000-0000-000000000004',
  'b4000000-0000-0000-0000-000000000005',
  'b4000000-0000-0000-0000-000000000006',
  'b4000000-0000-0000-0000-000000000007',
  'b4000000-0000-0000-0000-000000000008',
  'b4000000-0000-0000-0000-000000000009'
);

delete from public.user_events where event_id in (
  'b4000000-0000-0000-0000-000000000001',
  'b4000000-0000-0000-0000-000000000002',
  'b4000000-0000-0000-0000-000000000003',
  'b4000000-0000-0000-0000-000000000004',
  'b4000000-0000-0000-0000-000000000005',
  'b4000000-0000-0000-0000-000000000006',
  'b4000000-0000-0000-0000-000000000007',
  'b4000000-0000-0000-0000-000000000008',
  'b4000000-0000-0000-0000-000000000009'
);

delete from public.events where id in (
  'b4000000-0000-0000-0000-000000000001', -- Extemporaneous Writing
  'b4000000-0000-0000-0000-000000000002', -- Health Career Photography
  'b4000000-0000-0000-0000-000000000003', -- Healthy Living
  'b4000000-0000-0000-0000-000000000004', -- Interviewing Skills
  'b4000000-0000-0000-0000-000000000005', -- Job Seeking Skills
  'b4000000-0000-0000-0000-000000000006', -- Prepared Speaking
  'b4000000-0000-0000-0000-000000000007', -- Research Poster
  'b4000000-0000-0000-0000-000000000008', -- Researched Persuasive Writing
  'b4000000-0000-0000-0000-000000000009'  -- Health Career Preparation
);

-- ── Step 4: Remove non-test Teamwork events ───────────────────
-- Community Awareness, Health Career Display, Health Education,
-- Medical Innovation, PSA, and Public Health (Teamwork) have no test.

delete from public.user_cards
  where card_id in (
    select id from public.cards where event_id in (
      'b5000000-0000-0000-0000-000000000002',
      'b5000000-0000-0000-0000-000000000005',
      'b5000000-0000-0000-0000-000000000006',
      'b5000000-0000-0000-0000-000000000008',
      'b5000000-0000-0000-0000-000000000009',
      'b5000000-0000-0000-0000-000000000010'
    )
  );

delete from public.cards where event_id in (
  'b5000000-0000-0000-0000-000000000002',
  'b5000000-0000-0000-0000-000000000005',
  'b5000000-0000-0000-0000-000000000006',
  'b5000000-0000-0000-0000-000000000008',
  'b5000000-0000-0000-0000-000000000009',
  'b5000000-0000-0000-0000-000000000010'
);

delete from public.user_events where event_id in (
  'b5000000-0000-0000-0000-000000000002',
  'b5000000-0000-0000-0000-000000000005',
  'b5000000-0000-0000-0000-000000000006',
  'b5000000-0000-0000-0000-000000000008',
  'b5000000-0000-0000-0000-000000000009',
  'b5000000-0000-0000-0000-000000000010'
);

delete from public.events where id in (
  'b5000000-0000-0000-0000-000000000002', -- Community Awareness
  'b5000000-0000-0000-0000-000000000005', -- Health Career Display
  'b5000000-0000-0000-0000-000000000006', -- Health Education
  'b5000000-0000-0000-0000-000000000008', -- Medical Innovation
  'b5000000-0000-0000-0000-000000000009', -- Public Service Announcement
  'b5000000-0000-0000-0000-000000000010'  -- Public Health (Teamwork)
);

-- ── Step 5: Rename existing events ────────────────────────────

update public.events set name = 'EMT'
  where id = 'a1000000-0000-0000-0000-000000000006';

update public.events set name = 'Medical Law and Ethics'
  where id = 'b1000000-0000-0000-0000-000000000003';

update public.events set name = 'World Health and Disparities'
  where id = 'b1000000-0000-0000-0000-000000000008';

-- ── Step 6: Add missing Health Science events ─────────────────

insert into public.events (id, name, category, description, color, icon) values
  ('c1000000-0000-0000-0000-000000000001',
   'Behavioral Health',
   'Health Science',
   'Mental health, behavioral disorders, and psychosocial factors affecting patient care and community well-being.',
   '#3B82F6', 'Brain'),

  ('c1000000-0000-0000-0000-000000000002',
   'Biomedical Equipment Technology',
   'Health Science',
   'Operation, maintenance, and troubleshooting of medical devices and equipment used in clinical settings.',
   '#3B82F6', 'Cpu'),

  ('c1000000-0000-0000-0000-000000000003',
   'Healthcare Administration',
   'Health Science',
   'Healthcare management principles, organizational structure, and administrative operations in health systems.',
   '#3B82F6', 'Building2')

on conflict (id) do nothing;

-- ── Step 7: Add Organizational Leadership ─────────────────────

insert into public.events (id, name, category, description, color, icon) values
  ('c4000000-0000-0000-0000-000000000001',
   'Organizational Leadership',
   'Leadership',
   'Leadership principles, organizational behavior, and management strategies in healthcare and HOSA settings.',
   '#10B981', 'Users')

on conflict (id) do nothing;

-- ── Step 8: Add Recognition events (new category) ─────────────

insert into public.events (id, name, category, description, color, icon) values
  ('c6000000-0000-0000-0000-000000000001',
   'Healthcare Issues Exam',
   'Recognition',
   'Current healthcare issues, emerging trends, and policy affecting the health professions and public health.',
   '#6366F1', 'Newspaper'),

  ('c6000000-0000-0000-0000-000000000002',
   'HOSA History Exam',
   'Recognition',
   'History and development of HOSA, its mission, bylaws, structure, and impact on health science education.',
   '#6366F1', 'BookMarked')

on conflict (id) do nothing;
