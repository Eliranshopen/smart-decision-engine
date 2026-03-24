/**
 * add_ai_tools.js — adds AI tools for missing subcategories:
 * images, coding, automation (+ more writing tools)
 *
 * Run from project root: node scripts/add_ai_tools.js
 */
require('../backend/node_modules/dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('../backend/node_modules/@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const AI_TOOLS = [
  // ── IMAGES ──────────────────────────────────────────────────────────────────
  {
    site_name: 'Canva',
    affiliate_link: 'https://www.canva.com/join/affiliate',
    category: 'ai-tools',
    subcategory: 'images',
    pricing_model: 'freemium',
    commission_pct: 36,
    popularity_score: 9.5,
    trend_score: 9.0,
    trustworthiness: 10,
    risk_score: 1.0,
    ease_of_joining: 9,
    conversion_score: 9.0,
    description: 'Design anything — social posts, presentations, logos — with AI-powered tools and millions of templates.',
    is_active: true,
    language: 'en',
  },
  {
    site_name: 'Adobe Firefly',
    affiliate_link: 'https://www.adobe.com/creativecloud.html',
    category: 'ai-tools',
    subcategory: 'images',
    pricing_model: 'freemium',
    commission_pct: 85,
    popularity_score: 8.5,
    trend_score: 8.5,
    trustworthiness: 10,
    risk_score: 1.0,
    ease_of_joining: 7,
    conversion_score: 8.0,
    description: 'Adobe\'s generative AI for images and text effects — commercially safe, trained on licensed content.',
    is_active: true,
    language: 'en',
  },
  {
    site_name: 'Leonardo AI',
    affiliate_link: 'https://leonardo.ai/?via=affiliate',
    category: 'ai-tools',
    subcategory: 'images',
    pricing_model: 'freemium',
    commission_pct: 20,
    popularity_score: 8.0,
    trend_score: 8.5,
    trustworthiness: 8,
    risk_score: 2.0,
    ease_of_joining: 8,
    conversion_score: 7.5,
    description: 'Generate stunning AI art, product images, and game assets with fine-tuned custom models.',
    is_active: true,
    language: 'en',
  },
  {
    site_name: 'Midjourney',
    affiliate_link: 'https://www.midjourney.com',
    category: 'ai-tools',
    subcategory: 'images',
    pricing_model: 'paid',
    commission_pct: 0,
    popularity_score: 9.0,
    trend_score: 8.5,
    trustworthiness: 9,
    risk_score: 1.5,
    ease_of_joining: 9,
    conversion_score: 8.5,
    description: 'The gold standard in AI image generation — breathtaking artistic quality used by designers worldwide.',
    is_active: true,
    language: 'en',
  },

  // ── CODING ──────────────────────────────────────────────────────────────────
  {
    site_name: 'Cursor AI',
    affiliate_link: 'https://www.cursor.com/referral',
    category: 'ai-tools',
    subcategory: 'coding',
    pricing_model: 'freemium',
    commission_pct: 20,
    popularity_score: 9.0,
    trend_score: 9.5,
    trustworthiness: 9,
    risk_score: 1.5,
    ease_of_joining: 9,
    conversion_score: 8.5,
    description: 'The AI-first code editor — write, edit, and debug entire codebases with natural language instructions.',
    is_active: true,
    language: 'en',
  },
  {
    site_name: 'Tabnine',
    affiliate_link: 'https://www.tabnine.com/affiliates',
    category: 'ai-tools',
    subcategory: 'coding',
    pricing_model: 'freemium',
    commission_pct: 30,
    popularity_score: 7.5,
    trend_score: 7.0,
    trustworthiness: 9,
    risk_score: 1.5,
    ease_of_joining: 8,
    conversion_score: 7.0,
    description: 'AI code completion that runs locally — privacy-first autocomplete for 30+ programming languages.',
    is_active: true,
    language: 'en',
  },
  {
    site_name: 'Replit',
    affiliate_link: 'https://replit.com/site/refer',
    category: 'ai-tools',
    subcategory: 'coding',
    pricing_model: 'freemium',
    commission_pct: 10,
    popularity_score: 8.0,
    trend_score: 8.5,
    trustworthiness: 9,
    risk_score: 1.5,
    ease_of_joining: 9,
    conversion_score: 8.0,
    description: 'Code, build, and deploy apps in your browser — with an AI agent that writes and fixes code for you.',
    is_active: true,
    language: 'en',
  },
  {
    site_name: 'GitHub Copilot',
    affiliate_link: 'https://github.com/features/copilot',
    category: 'ai-tools',
    subcategory: 'coding',
    pricing_model: 'freemium',
    commission_pct: 0,
    popularity_score: 9.5,
    trend_score: 9.0,
    trustworthiness: 10,
    risk_score: 1.0,
    ease_of_joining: 10,
    conversion_score: 9.0,
    description: 'Microsoft\'s AI pair programmer — suggests entire functions, explains code, and catches bugs in real time.',
    is_active: true,
    language: 'en',
  },

  // ── AUTOMATION ──────────────────────────────────────────────────────────────
  {
    site_name: 'Make.com',
    affiliate_link: 'https://www.make.com/en/partners/affiliates',
    category: 'ai-tools',
    subcategory: 'automation',
    pricing_model: 'freemium',
    commission_pct: 20,
    popularity_score: 8.5,
    trend_score: 9.0,
    trustworthiness: 9,
    risk_score: 1.5,
    ease_of_joining: 8,
    conversion_score: 8.0,
    description: 'Visual drag-and-drop automation platform — connect 1,000+ apps and automate complex workflows without code.',
    is_active: true,
    language: 'en',
  },
  {
    site_name: 'n8n',
    affiliate_link: 'https://n8n.io/affiliate',
    category: 'ai-tools',
    subcategory: 'automation',
    pricing_model: 'freemium',
    commission_pct: 20,
    popularity_score: 8.0,
    trend_score: 9.0,
    trustworthiness: 8,
    risk_score: 2.0,
    ease_of_joining: 7,
    conversion_score: 7.5,
    description: 'Open-source workflow automation with AI agents — self-host or cloud, 400+ integrations, unlimited automations.',
    is_active: true,
    language: 'en',
  },
  {
    site_name: 'Zapier',
    affiliate_link: 'https://zapier.com/affiliate',
    category: 'ai-tools',
    subcategory: 'automation',
    pricing_model: 'freemium',
    commission_pct: 25,
    popularity_score: 9.0,
    trend_score: 8.5,
    trustworthiness: 10,
    risk_score: 1.0,
    ease_of_joining: 9,
    conversion_score: 8.5,
    description: 'The most popular automation tool — connect your apps and automate workflows in minutes, no coding needed.',
    is_active: true,
    language: 'en',
  },
  {
    site_name: 'Bardeen',
    affiliate_link: 'https://www.bardeen.ai/?ref=affiliate',
    category: 'ai-tools',
    subcategory: 'automation',
    pricing_model: 'freemium',
    commission_pct: 15,
    popularity_score: 7.5,
    trend_score: 8.5,
    trustworthiness: 8,
    risk_score: 2.0,
    ease_of_joining: 9,
    conversion_score: 7.0,
    description: 'AI browser automation — scrape data, automate repetitive tasks, and build no-code workflows from any website.',
    is_active: true,
    language: 'en',
  },

  // ── WRITING (additional) ────────────────────────────────────────────────────
  {
    site_name: 'Grammarly',
    affiliate_link: 'https://www.grammarly.com/affiliates',
    category: 'ai-tools',
    subcategory: 'writing',
    pricing_model: 'freemium',
    commission_pct: 20,
    popularity_score: 9.5,
    trend_score: 8.5,
    trustworthiness: 10,
    risk_score: 1.0,
    ease_of_joining: 9,
    conversion_score: 9.0,
    description: 'AI writing assistant that catches grammar, style, and tone issues — works everywhere you write online.',
    is_active: true,
    language: 'en',
  },
  {
    site_name: 'Surfer SEO',
    affiliate_link: 'https://surferseo.com/affiliate/',
    category: 'ai-tools',
    subcategory: 'writing',
    pricing_model: 'paid',
    commission_pct: 25,
    popularity_score: 8.0,
    trend_score: 8.0,
    trustworthiness: 9,
    risk_score: 1.5,
    ease_of_joining: 8,
    conversion_score: 7.5,
    description: 'Write and optimize SEO content that ranks — AI-driven keyword research, outlines, and content scoring.',
    is_active: true,
    language: 'en',
  },
];

async function run() {
  console.log(`Adding ${AI_TOOLS.length} AI tools...\n`);

  const { data, error } = await supabase
    .from('affiliates')
    .upsert(AI_TOOLS, { onConflict: 'site_name' })
    .select('site_name');

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log('Done! Tools added/updated:');
  data.forEach(t => console.log(`  ✓ ${t.site_name}`));
  console.log(`\nTotal: ${data.length}`);
}

run().catch(console.error);
