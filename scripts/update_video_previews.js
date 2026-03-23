/**
 * Searches YouTube for a demo/trailer video for each affiliate and updates
 * the preview_video_url column in Supabase.
 *
 * Run: node scripts/update_video_previews.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/** Fetch a URL and return the raw HTML body */
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchHtml(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

/** Search YouTube and return the first video URL found */
async function searchYouTube(query) {
  const encoded = encodeURIComponent(`${query} demo official`);
  const url = `https://www.youtube.com/results?search_query=${encoded}`;
  try {
    const html = await fetchHtml(url);
    // YouTube embeds video IDs in JSON inside the page
    const match = html.match(/"videoId":"([A-Za-z0-9_-]{11})"/);
    if (match) {
      return `https://www.youtube.com/watch?v=${match[1]}`;
    }
  } catch (e) {
    // silently skip
  }
  return null;
}

async function main() {
  const { data: affiliates, error } = await supabase
    .from('affiliates')
    .select('id, site_name, preview_video_url');

  if (error) { console.error('Supabase error:', error.message); process.exit(1); }

  console.log(`Found ${affiliates.length} affiliates. Searching YouTube previews...\n`);

  for (const aff of affiliates) {
    if (aff.preview_video_url) {
      console.log(`[skip] ${aff.site_name} — already has preview`);
      continue;
    }

    const ytUrl = await searchYouTube(aff.site_name);
    if (ytUrl) {
      const { error: updErr } = await supabase
        .from('affiliates')
        .update({ preview_video_url: ytUrl })
        .eq('id', aff.id);

      if (updErr) {
        console.log(`[error] ${aff.site_name}: ${updErr.message}`);
      } else {
        console.log(`[ok] ${aff.site_name} -> ${ytUrl}`);
      }
    } else {
      console.log(`[miss] ${aff.site_name} — no YouTube video found`);
    }

    // Small delay to avoid rate-limiting
    await new Promise(r => setTimeout(r, 600));
  }

  console.log('\nDone.');
}

main();
