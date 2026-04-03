-- ============================================================
-- PinPoint — User Preferences Migration
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Add study preferences to profiles ────────────────────
alter table public.profiles
  add column if not exists daily_card_limit      integer not null default 50,
  add column if not exists session_size          integer not null default 20,
  add column if not exists sound_effects_enabled boolean not null default false;

-- ── 2. Storage bucket setup note ─────────────────────────────
-- Create a public bucket named "avatars" in:
--   Supabase Dashboard → Storage → New bucket
--   Name: avatars, Public: YES
--
-- Then add the following storage policies:
--
-- Allow authenticated users to upload their own avatar:
-- CREATE POLICY "Users can upload own avatar"
--   ON storage.objects FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
--
-- Allow authenticated users to update their own avatar:
-- CREATE POLICY "Users can update own avatar"
--   ON storage.objects FOR UPDATE TO authenticated
--   USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
--
-- Allow public read access to avatars:
-- CREATE POLICY "Public can read avatars"
--   ON storage.objects FOR SELECT TO public
--   USING (bucket_id = 'avatars');
