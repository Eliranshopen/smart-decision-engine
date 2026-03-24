-- Active flag: only show items with affiliate program configured
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT false;

-- Subcategory for AI tools (writing, images, video, voice, coding, automation)
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS subcategory text;

-- Skill level for courses
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS skill_level text
  CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'all'));

-- Pricing model for AI tools
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS pricing_model text
  CHECK (pricing_model IN ('free', 'freemium', 'paid'));
