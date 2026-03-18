/**
 * Global Express error handler.
 * Always returns a consistent { data, meta, error } envelope — never crashes.
 */
function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  console.error(`[error] ${req.method} ${req.path} →`, err.message);

  res.status(status).json({
    data: null,
    meta: {},
    error: message,
  });
}

module.exports = { errorHandler };
