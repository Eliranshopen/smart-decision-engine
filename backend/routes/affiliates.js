const express = require('express');
const { z } = require('zod');
const { validateQuery } = require('../middleware/validate');
const supabase = require('../services/supabase');

const router = express.Router();

const listQuerySchema = z.object({
  category: z.string().optional(),
  sort: z.enum(['composite_score', 'commission_pct', 'trend_score', 'created_at']).optional().default('composite_score'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  page: z.coerce.number().int().min(1).optional().default(1),
});

// GET /api/affiliates
router.get('/', validateQuery(listQuerySchema), async (req, res, next) => {
  try {
    const { category, sort, order, limit, page } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('affiliates')
      .select('*', { count: 'exact' })
      .order(sort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

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

// GET /api/affiliates/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ data: null, meta: {}, error: 'Affiliate not found' });
      }
      return next(error);
    }

    res.json({ data, meta: {}, error: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
