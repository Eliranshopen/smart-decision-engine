-- Add short description field for user-facing product explanations
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS description text;
