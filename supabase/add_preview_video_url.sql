-- Migration: add preview_video_url to affiliates and vendor_applications
-- Run this once against your Supabase project via the SQL Editor

ALTER TABLE affiliates
  ADD COLUMN IF NOT EXISTS preview_video_url text;

ALTER TABLE vendor_applications
  ADD COLUMN IF NOT EXISTS preview_video_url text;
