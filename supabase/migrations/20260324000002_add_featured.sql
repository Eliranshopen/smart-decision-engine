-- Mark tools as featured (shown in Top Picks section)
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- Slug for clean URLs (/tool/cursor-ai)
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS slug text;

-- Generate slugs for existing rows (include id suffix to guarantee uniqueness)
UPDATE affiliates
SET slug = lower(regexp_replace(site_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(id::text, 1, 4)
WHERE slug IS NULL;
