const express = require('express');
const { z } = require('zod');
const { validateQuery } = require('../middleware/validate');
const supabase = require('../services/supabase');

const router = express.Router();

const newsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  risk_level: z.enum(['low', 'medium', 'high']).optional(),
  min_opportunity: z.coerce.number().int().min(1).max(10).optional(),
});

// GET /api/news
router.get('/', validateQuery(newsQuerySchema), async (req, res, next) => {
  try {
    const { page, limit, risk_level, min_opportunity } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('news_digest')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (risk_level) query = query.eq('risk_level', risk_level);
    if (min_opportunity) query = query.gte('opportunity_level', min_opportunity);

    const { data, error, count } = await query;

    if (error) return next(error);

    res.json({
      data,
      meta: { count, page, limit, totalPages: Math.ceil(count / limit) },
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
