const express = require('express');
const supabase = require('../services/supabase');

const router = express.Router();

const SECTIONS = [
  {
    key: 'trending',
    label: '🔥 What People Are Buying This Week',
    description: 'High trend score, low risk',
    filter: (q) => q.gt('trend_score', 7).lt('risk_score', 4).order('trend_score', { ascending: false }),
  },
  {
    key: 'beginner',
    label: '💰 Most Profitable for Beginners',
    description: 'Easy to join, high commission',
    filter: (q) => q.gt('ease_of_joining', 7).gt('commission_pct', 20).order('commission_pct', { ascending: false }),
  },
  {
    key: 'risky',
    label: '⚠️ Hot but Risky Trends',
    description: 'High potential, high risk',
    filter: (q) => q.gt('risk_score', 6).order('trend_score', { ascending: false }),
  },
  {
    key: 'top',
    label: '🧠 Best Opportunity Right Now',
    description: 'Highest composite score overall',
    filter: (q) => q.order('composite_score', { ascending: false }),
  },
  {
    key: 'gems',
    label: '🎯 Hidden Gems',
    description: 'High score, low popularity — undiscovered',
    filter: (q) => q.gt('composite_score', 7).lt('popularity_score', 4).order('composite_score', { ascending: false }),
  },
];

// GET /api/recommendations
router.get('/', async (req, res, next) => {
  try {
    const limit = 6;
    const results = await Promise.all(
      SECTIONS.map(async (section) => {
        const baseQuery = supabase.from('affiliates').select('*').limit(limit);
        const { data, error } = await section.filter(baseQuery);
        return {
          key: section.key,
          label: section.label,
          description: section.description,
          items: error ? [] : data,
        };
      })
    );

    res.json({
      data: results,
      meta: { sections: SECTIONS.length },
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
