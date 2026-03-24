const express = require('express');
const { z } = require('zod');
const { validateQuery } = require('../middleware/validate');
const supabase = require('../services/supabase');

const router = express.Router();

/**
 * Appends affiliate tracking params to a link based on the domain.
 * When env vars are not set, returns the link unchanged.
 */
function withAffiliateTracking(link) {
  if (!link) return link;
  try {
    const url = new URL(link);
    const host = url.hostname;

    if (host.includes('udemy.com')) {
      const id = process.env.UDEMY_AFFILIATE_ID;
      if (id) {
        url.searchParams.set('ranMID', '39197');
        url.searchParams.set('ranEAID', id);
        url.searchParams.set('ranSiteID', 'affiliate');
      }
    } else if (host.includes('coursera.org')) {
      const id = process.env.COURSERA_AFFILIATE_ID;
      if (id) {
        url.searchParams.set('siteID', id);
        url.searchParams.set('utm_content', 'affiliate');
        url.searchParams.set('utm_medium', 'affiliate');
        url.searchParams.set('utm_source', 'aff');
      }
    }

    return url.toString();
  } catch {
    return link;
  }
}

const listQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['composite_score', 'commission_pct', 'trend_score', 'created_at']).optional().default('composite_score'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  page: z.coerce.number().int().min(1).optional().default(1),
  all: z.string().optional(),
  featured: z.string().optional(),
  pricing_model: z.string().optional(),
});

// GET /api/affiliates
router.get('/', validateQuery(listQuerySchema), async (req, res, next) => {
  try {
    const { category, search, sort, order, limit, page, featured, pricing_model } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('affiliates')
      .select('*', { count: 'exact' })
      .order(sort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`site_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (pricing_model) {
      query = query.eq('pricing_model', pricing_model);
    }

    // Only show active affiliates by default (can be overridden with ?all=true for admin)
    if (req.query.all !== 'true') {
      query = query.eq('is_active', true);
    }

    const { data, error, count } = await query;

    if (error) return next(error);

    const enriched = (data || []).map(item => ({
      ...item,
      affiliate_link: withAffiliateTracking(item.affiliate_link),
    }));

    res.json({
      data: enriched,
      meta: { count, page, limit, totalPages: Math.ceil(count / limit) },
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/affiliates/:id  (also accepts slug)
router.get('/:id', async (req, res, next) => {
  try {
    const param = req.params.id;
    const isUUID = /^[0-9a-f-]{36}$/.test(param);
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq(isUUID ? 'id' : 'slug', param)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ data: null, meta: {}, error: 'Affiliate not found' });
      }
      return next(error);
    }

    res.json({ data: { ...data, affiliate_link: withAffiliateTracking(data.affiliate_link) }, meta: {}, error: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
