const express = require('express');
const { z } = require('zod');
const { validateBody } = require('../middleware/validate');
const supabase = require('../services/supabase');

const router = express.Router();

const subscriptionSchema = z.object({
  email: z.string().email('Invalid email address'),
  plan: z.enum(['free', 'pro']).optional().default('free'),
});

// POST /api/subscription
router.post('/', validateBody(subscriptionSchema), async (req, res, next) => {
  try {
    const { email, plan } = req.body;

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({ email, plan }, { onConflict: 'email' })
      .select()
      .single();

    if (error) return next(error);

    res.status(201).json({
      data,
      meta: {},
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
