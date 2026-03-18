const { z } = require('zod');

/**
 * Returns an Express middleware that validates req.body against a Zod schema.
 * On failure returns 400 with validation details.
 */
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        data: null,
        meta: {},
        error: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
      });
    }
    req.body = result.data;
    next();
  };
}

/**
 * Returns an Express middleware that validates req.query against a Zod schema.
 * On failure returns 400 with validation details.
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        data: null,
        meta: {},
        error: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
      });
    }
    req.query = result.data;
    next();
  };
}

module.exports = { validateBody, validateQuery };
