export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Rota não encontrada: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(err, req, res, next) {
  console.error('❌ Erro no Servidor:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Ocorreu um erro interno no servidor.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
