/**
 * seed.js — populate the database with sample data for local development.
 * Usage: node scripts/seed.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SAMPLE_AFFILIATES = [
  {
    site_name: 'Jasper AI',
    affiliate_link: 'https://www.jasper.ai/?fpr=demo',
    category: 'ai-tools',
    commission_pct: 30,
    ease_of_joining: 9,
    trustworthiness: 9,
    popularity_score: 8.5,
    trend_score: 8.0,
    risk_score: 2.0,
    conversion_score: 7.5,
  },
  {
    site_name: 'Shopify',
    affiliate_link: 'https://shopify.com/affiliates',
    category: 'saas',
    commission_pct: 200,
    ease_of_joining: 8,
    trustworthiness: 10,
    popularity_score: 10,
    trend_score: 8.0,
    risk_score: 1.5,
    conversion_score: 8.5,
  },
  {
    site_name: 'Coursera',
    affiliate_link: 'https://coursera.org/affiliate',
    category: 'courses',
    commission_pct: 45,
    ease_of_joining: 7,
    trustworthiness: 10,
    popularity_score: 9.5,
    trend_score: 7.5,
    risk_score: 1.0,
    conversion_score: 7.5,
  },
];

const SAMPLE_NEWS = [
  {
    headline: 'AI tools are reshaping affiliate marketing in 2025',
    source_url: 'https://example.com/ai-affiliate-2025',
    summary: 'New AI writing and automation tools are helping affiliates earn more with less effort.',
    risk_level: 'low',
    opportunity_level: 9,
    credibility: 8,
    published_at: new Date().toISOString(),
  },
  {
    headline: 'Passive income via SaaS affiliate programs sees record growth',
    source_url: 'https://example.com/saas-affiliate-growth',
    summary: 'SaaS companies are offering higher commissions to attract quality affiliates.',
    risk_level: 'low',
    opportunity_level: 8,
    credibility: 7,
    published_at: new Date().toISOString(),
  },
];

async function seed() {
  console.log('Seeding affiliates...');
  const { error: aErr } = await supabase.from('affiliates').upsert(SAMPLE_AFFILIATES, { onConflict: 'site_name' });
  if (aErr) console.error('Affiliates seed error:', aErr.message);
  else console.log(`✓ ${SAMPLE_AFFILIATES.length} affiliates seeded`);

  console.log('Seeding news_digest...');
  const { error: nErr } = await supabase.from('news_digest').upsert(SAMPLE_NEWS, { onConflict: 'source_url' });
  if (nErr) console.error('News seed error:', nErr.message);
  else console.log(`✓ ${SAMPLE_NEWS.length} news items seeded`);

  console.log('\nDone! Run `npm run dev` in /backend to start the API.');
}

seed().catch(console.error);
