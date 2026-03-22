-- ============================================================
-- Smart Decision Engine — Supabase Schema
-- Run via: supabase db push
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── affiliates ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS affiliates (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name        text NOT NULL UNIQUE,
  affiliate_link   text NOT NULL,
  category         text NOT NULL
                     CHECK (category IN ('ai-tools', 'courses', 'saas', 'finance', 'other')),
  commission_pct   numeric(7,2),
  ease_of_joining  integer CHECK (ease_of_joining BETWEEN 1 AND 10),
  trustworthiness  integer CHECK (trustworthiness BETWEEN 1 AND 10),
  popularity_score numeric(5,2),
  trend_score      numeric(5,2),
  risk_score       numeric(5,2),
  conversion_score numeric(5,2),
  -- Composite score: computed at DB level for fast sorting
  -- (commission_pct * 0.30) + (trustworthiness * 2.5) + (popularity_score * 2.0) +
  -- (trend_score * 1.5) + (ease_of_joining * 1.0) / 10  → normalized 0-10
  composite_score  numeric(5,2) GENERATED ALWAYS AS (
    ROUND(
      (
        COALESCE(commission_pct, 0) * 0.30
        + COALESCE(trustworthiness, 5) * 2.5
        + COALESCE(popularity_score, 5) * 2.0
        + COALESCE(trend_score, 5) * 1.5
        + COALESCE(ease_of_joining, 5) * 1.0
      ) / 10.0,
    2)
  ) STORED,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ─── news_digest ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS news_digest (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  headline          text NOT NULL,
  source_url        text UNIQUE,
  summary           text,
  risk_level        text CHECK (risk_level IN ('low', 'medium', 'high')),
  opportunity_level integer CHECK (opportunity_level BETWEEN 1 AND 10),
  credibility       integer CHECK (credibility BETWEEN 1 AND 10),
  published_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ─── subscriptions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text UNIQUE NOT NULL,
  plan       text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_affiliates_category        ON affiliates (category);
CREATE INDEX IF NOT EXISTS idx_affiliates_trend_score     ON affiliates (trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_affiliates_composite_score ON affiliates (composite_score DESC);
CREATE INDEX IF NOT EXISTS idx_affiliates_risk_score      ON affiliates (risk_score);
CREATE INDEX IF NOT EXISTS idx_news_published_at          ON news_digest (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_risk_level            ON news_digest (risk_level);
CREATE INDEX IF NOT EXISTS idx_news_opportunity           ON news_digest (opportunity_level DESC);

-- ─── updated_at trigger ─────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS affiliates_updated_at ON affiliates;
CREATE TRIGGER affiliates_updated_at
  BEFORE UPDATE ON affiliates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Recommendations materialized view ──────────────────────
DROP MATERIALIZED VIEW IF EXISTS recommendations;
CREATE MATERIALIZED VIEW recommendations AS
SELECT
  *,
  CASE
    WHEN trend_score    > 7 AND COALESCE(risk_score, 0) < 4 THEN 'trending'
    WHEN ease_of_joining > 7 AND commission_pct > 20        THEN 'beginner'
    WHEN COALESCE(risk_score, 0) > 6                        THEN 'risky'
    WHEN composite_score > 7 AND COALESCE(popularity_score, 10) < 4 THEN 'gem'
    ELSE 'top'
  END AS section
FROM affiliates;

CREATE UNIQUE INDEX IF NOT EXISTS idx_recommendations_id ON recommendations (id);

-- ─── RPC to refresh the view (called by DecisionEngineAgent) ─
CREATE OR REPLACE FUNCTION refresh_recommendations_view()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY recommendations;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Row Level Security ─────────────────────────────────────

-- affiliates: public read, service-role write
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read affiliates" ON affiliates;
CREATE POLICY "Public read affiliates"
  ON affiliates FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role write affiliates" ON affiliates;
CREATE POLICY "Service role write affiliates"
  ON affiliates FOR ALL
  USING (auth.role() = 'service_role');

-- news_digest: public read, service-role write
ALTER TABLE news_digest ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read news" ON news_digest;
CREATE POLICY "Public read news"
  ON news_digest FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role write news" ON news_digest;
CREATE POLICY "Service role write news"
  ON news_digest FOR ALL
  USING (auth.role() = 'service_role');

-- subscriptions: authenticated users can read their own; service-role full access
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Own subscription read" ON subscriptions;
CREATE POLICY "Own subscription read"
  ON subscriptions FOR SELECT
  USING (auth.role() = 'service_role' OR email = auth.email());

DROP POLICY IF EXISTS "Service role write subscriptions" ON subscriptions;
CREATE POLICY "Service role write subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (true);  -- allow anonymous signups

-- Vendor applications table (course owners who want to list their courses)
CREATE TABLE IF NOT EXISTS vendor_applications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  email           text NOT NULL,
  course_name     text NOT NULL,
  course_url      text NOT NULL,
  category        text NOT NULL,
  commission_pct  numeric NOT NULL,
  description     text,
  status          text NOT NULL DEFAULT 'pending',
  submitted_at    timestamptz DEFAULT now()
);

-- Allow anyone to submit (insert only), no read without auth
ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit application"
  ON vendor_applications FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Service role reads all"
  ON vendor_applications FOR SELECT TO service_role USING (true);
