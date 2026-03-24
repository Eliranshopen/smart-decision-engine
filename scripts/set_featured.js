/**
 * set_featured.js — marks top tools as featured (Top Picks section)
 * and sets clean slugs. Run: node scripts/set_featured.js
 */
require('../backend/node_modules/dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('../backend/node_modules/@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Featured tools: highest commission + most useful per category
const FEATURED = [
  'Cursor AI',       // coding — hot + 20% commission
  'ElevenLabs',      // voice — 22% commission
  'Make.com',        // automation — 20% commission
  'Jasper AI',       // writing — 30% commission
  'Canva',           // images — $36/subscriber
  'Writesonic',      // writing — high commission
];

// Clean slugs (override auto-generated ones)
const SLUGS = {
  'Jasper AI':       'jasper-ai',
  'Copy.ai':         'copy-ai',
  'Writesonic':      'writesonic',
  'Synthesia':       'synthesia',
  'Pictory AI':      'pictory-ai',
  'Murf AI':         'murf-ai',
  'Descript':        'descript',
  'Notion AI':       'notion-ai',
  'Runway ML':       'runway-ml',
  'ElevenLabs':      'elevenlabs',
  'Canva':           'canva',
  'Adobe Firefly':   'adobe-firefly',
  'Leonardo AI':     'leonardo-ai',
  'Midjourney':      'midjourney',
  'Cursor AI':       'cursor-ai',
  'Tabnine':         'tabnine',
  'Replit':          'replit',
  'GitHub Copilot':  'github-copilot',
  'Make.com':        'make-com',
  'n8n':             'n8n',
  'Zapier':          'zapier',
  'Bardeen':         'bardeen',
  'Grammarly':       'grammarly',
  'Surfer SEO':      'surfer-seo',
};

async function run() {
  // 1. Update slugs
  console.log('Setting slugs...');
  for (const [name, slug] of Object.entries(SLUGS)) {
    const { error } = await supabase
      .from('affiliates')
      .update({ slug })
      .eq('site_name', name);
    if (error) console.log(`  FAIL slug ${name}: ${error.message}`);
    else console.log(`  ✓ ${name} → /${slug}`);
  }

  // 2. Reset all featured flags
  await supabase.from('affiliates').update({ is_featured: false }).neq('id', '00000000-0000-0000-0000-000000000000');

  // 3. Set featured=true for top picks
  console.log('\nSetting featured tools...');
  for (const name of FEATURED) {
    const { error } = await supabase
      .from('affiliates')
      .update({ is_featured: true })
      .eq('site_name', name);
    if (error) console.log(`  FAIL featured ${name}: ${error.message}`);
    else console.log(`  ★ ${name}`);
  }

  console.log('\nDone!');
}

run().catch(console.error);
