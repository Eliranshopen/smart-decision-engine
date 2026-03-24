/**
 * Uses OpenAI to find top ClickBank AI courses, verifies their hoplinks,
 * and upserts them into Supabase.
 *
 * Run: node scripts/scrape_clickbank_courses.js
 */
const path = require('path');
const https = require('https');
const envPath = path.resolve(__dirname, '../.env');
require(path.resolve(__dirname, '../backend/node_modules/dotenv')).config({ path: envPath });
const { createClient } = require(path.resolve(__dirname, '../backend/node_modules/@supabase/supabase-js'));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const AFFILIATE_ID = process.env.AFFILIATE_ID_CLICKBANK || 'eliran2026';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function buildHopLink(vendorId) {
  return `https://${AFFILIATE_ID}.${vendorId}.hop.clickbank.net`;
}

function calcScores(gravity, commission) {
  const g = Math.min(gravity, 200);
  const popularity_score = parseFloat(Math.min(10, g / 15).toFixed(2));
  const trend_score = parseFloat(Math.min(10, g / 12).toFixed(2));
  const trustworthiness = parseFloat(Math.min(10, 5 + g / 60).toFixed(2));
  const risk_score = parseFloat(Math.max(1, 4 - g / 50).toFixed(2));
  const ease_of_joining = 10;
  const conversion_score = parseFloat(Math.min(9, g / 18).toFixed(2));
  const composite_score = parseFloat((
    Math.min(commission, 75) * 0.30 +
    trustworthiness * 2.5 +
    popularity_score * 2.0 +
    trend_score * 1.5 +
    ease_of_joining * 1.0
  ).toFixed(2));

  return { popularity_score, trend_score, trustworthiness, risk_score, ease_of_joining, conversion_score, composite_score };
}

function openAIRequest(messages, model = 'gpt-4o-mini') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model,
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.message?.content;
          resolve(JSON.parse(content));
        } catch (e) {
          reject(new Error('OpenAI parse error: ' + data.slice(0, 200)));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function verifyHopLink(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 8000 }, (res) => {
      // ClickBank redirects valid hoplinks (301/302), invalid ones return 404/500
      resolve(res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

// Search Google for real ClickBank vendor IDs
function fetchGoogleResults(query) {
  return new Promise((resolve) => {
    const encoded = encodeURIComponent(query);
    const url = `https://www.google.com/search?q=${encoded}&num=20`;
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        // Extract vendor IDs from hop.clickbank.net links in Google results
        const matches = [...body.matchAll(/([a-z0-9]{3,20})\.hop\.clickbank\.net/gi)];
        const vendors = [...new Set(matches.map(m => m[1].toLowerCase()).filter(v => v !== AFFILIATE_ID && v.length >= 3))];
        resolve(vendors);
      });
    });
    req.on('error', () => resolve([]));
    req.on('timeout', () => { req.destroy(); resolve([]); });
  });
}

async function main() {
  if (!OPENAI_API_KEY) {
    console.error('[error] OPENAI_API_KEY not set in .env');
    process.exit(1);
  }

  // Step 1: Search Google for real ClickBank AI vendor IDs
  console.log('[agent] Searching Google for real ClickBank AI course vendor IDs...');
  const googleVendors = new Set();
  const searches = [
    'artificial intelligence course "hop.clickbank.net" site:clickbank.net OR site:cbengine.com',
    'ChatGPT course "hop.clickbank.net"',
    'AI tools course clickbank affiliate 2024 2025',
  ];
  for (const q of searches) {
    const vendors = await fetchGoogleResults(q);
    vendors.forEach(v => googleVendors.add(v));
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log(`[agent] Found ${googleVendors.size} potential vendor IDs from Google: ${[...googleVendors].join(', ')}\n`);

  // Step 2: Ask OpenAI with context from Google + its own knowledge
  console.log('[agent] Asking OpenAI to identify and enrich top AI courses...\n');
  const googleContext = googleVendors.size > 0
    ? `Google search found these potential ClickBank vendor IDs: ${[...googleVendors].join(', ')}. Use these as reference.`
    : '';

  const result = await openAIRequest([
    {
      role: 'system',
      content: `You are an expert in ClickBank affiliate marketing. Return a JSON object with a "courses" array.
Each item must have: title (string), vendor_id (the exact ClickBank vendor/site ID, lowercase letters and numbers only), gravity (number 1-300), commission_pct (number), description (1 sentence about the course).
Only include products you are HIGHLY CONFIDENT exist on ClickBank right now.
${googleContext}`,
    },
    {
      role: 'user',
      content: 'List the top 20 best-selling AI, ChatGPT, and automation courses on ClickBank with the real vendor IDs. Prioritize vendor IDs from the Google context if provided.',
    },
  ]);

  const courses = result.courses || [];
  console.log(`[agent] OpenAI returned ${courses.length} courses. Verifying hoplinks...\n`);

  const verified = [];
  for (const course of courses) {
    if (!course.vendor_id) continue;
    const hopLink = buildHopLink(course.vendor_id);
    const works = await verifyHopLink(hopLink);
    const status = works ? '✓' : '✗';
    console.log(`  ${status} ${course.title} (${course.vendor_id}) gravity=${course.gravity}`);
    if (works) {
      verified.push({ ...course, hopLink });
    }
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n[agent] ${verified.length}/${courses.length} hoplinks verified.`);

  if (verified.length === 0) {
    console.log('[agent] No valid hoplinks found. Saving all courses anyway (unverified).');
    courses.forEach(c => verified.push({ ...c, hopLink: buildHopLink(c.vendor_id) }));
  }

  const records = verified.map(c => {
    const scores = calcScores(c.gravity || 30, c.commission_pct || 50);
    const { composite_score, ...scoreFields } = scores; // composite_score is auto-generated by DB
    return {
      site_name: c.title,
      affiliate_link: c.hopLink,
      category: 'ai-tools',
      commission_pct: c.commission_pct || 50,
      updated_at: new Date().toISOString(),
      ...scoreFields,
    };
  });

  const { error } = await supabase
    .from('affiliates')
    .upsert(records, { onConflict: 'site_name' });

  if (error) {
    console.error('[supabase] Error:', error.message);
    process.exit(1);
  }

  console.log(`\n[supabase] ✓ Upserted ${records.length} AI courses into the database.`);
  records.forEach(r => console.log(`  - ${r.site_name} | commission: ${r.commission_pct}% | score: ${r.composite_score}`));
}

main().catch(err => {
  console.error('[error]', err.message);
  process.exit(1);
});
