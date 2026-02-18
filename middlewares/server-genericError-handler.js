export const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  console.error(`Error [${statusCode}]:`, message);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.message, stack: err.stack }),
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
};
