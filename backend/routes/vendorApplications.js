const express = require('express');
const { z } = require('zod');
const { validateBody } = require('../middleware/validate');
const supabase = require('../services/supabase');

const router = express.Router();

const ApplicationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  course_name: z.string().min(2),
  course_url: z.string().url(),
  category: z.string().min(2),
  commission_pct: z.coerce.number().min(1).max(90),
  description: z.string().min(10),
});

// POST /api/vendor-applications
router.post('/', validateBody(ApplicationSchema), async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('vendor_applications')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ data, meta: {}, error: null });
  } catch (err) {
    next(err);
  }
});

// GET /api/vendor-applications (admin only — add auth later)
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('vendor_applications')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    res.json({ data, meta: { count: data.length }, error: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
