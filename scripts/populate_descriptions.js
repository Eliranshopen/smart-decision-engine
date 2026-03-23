/**
 * Populates description field for all existing affiliates.
 * Run from backend/ directory: node ../scripts/populate_descriptions.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Hand-written descriptions for AI tools and top courses
const DESCRIPTIONS = {
  // AI Tools
  'Jasper AI':      'AI writing assistant for marketing teams — generates blogs, ads, emails, and social content in seconds.',
  'Copy.ai':        'Create high-converting marketing copy, product descriptions, and email campaigns with AI.',
  'Writesonic':     'AI platform for SEO articles, landing pages, and ads — from first draft to publish-ready in minutes.',
  'Synthesia':      'Turn text scripts into professional AI videos with realistic avatars — no camera or studio needed.',
  'Pictory AI':     'Transform long-form content into short, shareable videos automatically using AI.',
  'Murf AI':        'Studio-quality AI voiceovers in 120+ voices and 20 languages — for videos, podcasts, and presentations.',
  'Descript':       'Edit video and audio like a document — cut, clip, and overdub by editing the transcript.',
  'Notion AI':      'AI writing and summarization built into your workspace — drafts, edits, and organizes your notes.',
  'Runway ML':      'Professional AI video generation and editing tools used by leading filmmakers and creators.',
  'ElevenLabs':     'Ultra-realistic AI voice cloning and text-to-speech in any language — the most lifelike voices available.',

  // Coursera courses (short descriptions based on course name patterns)
};

// Generic description generator for Coursera courses
function generateCourseDescription(name) {
  const n = name.toLowerCase();
  if (n.includes('chatgpt') || n.includes('gpt'))
    return 'Learn to use ChatGPT and GPT models effectively for real-world tasks, automation, and productivity.';
  if (n.includes('prompt'))
    return 'Master prompt engineering techniques to get better results from AI models like GPT-4 and Claude.';
  if (n.includes('machine learning'))
    return 'Build and deploy machine learning models with hands-on projects and industry-standard tools.';
  if (n.includes('deep learning'))
    return 'Understand neural networks and deep learning — from fundamentals to state-of-the-art architectures.';
  if (n.includes('neural'))
    return 'Dive into neural network design, training, and optimization for real AI applications.';
  if (n.includes('tensorflow') || n.includes('pytorch'))
    return 'Hands-on training with leading ML frameworks to build and deploy production AI models.';
  if (n.includes('nlp') || n.includes('natural language'))
    return 'Learn NLP techniques to process text, build chatbots, and analyze language with AI.';
  if (n.includes('computer vision') || n.includes('image'))
    return 'Apply AI to analyze images and video — from object detection to generative visual models.';
  if (n.includes('data science'))
    return 'Learn data analysis, visualization, and predictive modeling skills used by data scientists worldwide.';
  if (n.includes('generative') || n.includes('llm'))
    return 'Explore generative AI and large language models — from how they work to building real applications.';
  if (n.includes('automation') || n.includes('automat'))
    return 'Automate repetitive tasks and workflows using AI tools — save hours every week.';
  if (n.includes('ai for') || n.includes('artificial intelligence'))
    return 'A comprehensive introduction to artificial intelligence concepts, tools, and practical applications.';
  return 'Structured AI course from a leading platform — build practical skills at your own pace.';
}

async function run() {
  const { data: items, error } = await supabase
    .from('affiliates')
    .select('id, site_name, category')
    .order('created_at');

  if (error) { console.error(error); process.exit(1); }

  console.log(`Found ${items.length} affiliates. Updating descriptions...\n`);

  let updated = 0;
  for (const item of items) {
    const desc = DESCRIPTIONS[item.site_name] ||
      (item.category === 'courses' ? generateCourseDescription(item.site_name) : null);

    if (!desc) {
      console.log(`  SKIP  ${item.site_name} (no description)`);
      continue;
    }

    const { error: upErr } = await supabase
      .from('affiliates')
      .update({ description: desc })
      .eq('id', item.id);

    if (upErr) {
      console.log(`  FAIL  ${item.site_name}: ${upErr.message}`);
    } else {
      console.log(`  OK    ${item.site_name}`);
      updated++;
    }
  }

  console.log(`\nDone. ${updated}/${items.length} updated.`);
}

run();
