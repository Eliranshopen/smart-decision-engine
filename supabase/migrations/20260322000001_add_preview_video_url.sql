-- Create vendor_applications if it doesn't exist yet
CREATE TABLE IF NOT EXISTS vendor_applications (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  email             text NOT NULL,
  course_name       text NOT NULL,
  course_url        text NOT NULL,
  preview_video_url text,
  category          text NOT NULL,
  commission_pct    numeric NOT NULL,
  description       text,
  status            text NOT NULL DEFAULT 'pending',
  submitted_at      timestamptz DEFAULT now()
);

ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit application" ON vendor_applications;
CREATE POLICY "Anyone can submit application"
  ON vendor_applications FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Service role reads all" ON vendor_applications;
CREATE POLICY "Service role reads all"
  ON vendor_applications FOR SELECT TO service_role USING (true);

-- Add preview_video_url to affiliates
ALTER TABLE affiliates
  ADD COLUMN IF NOT EXISTS preview_video_url text;
