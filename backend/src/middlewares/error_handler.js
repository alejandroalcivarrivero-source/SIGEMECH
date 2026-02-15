const logger = require("../config/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(err.message);

  if (err.statusCode === 401) {
    return res.status(401).json({
      mensaje: "Acceso no autorizado - Credenciales incorrectas",
      codigo: "ERROR_AUTENTICACION",
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Error interno del servidor";

  res.status(statusCode).json({
    mensaje: message,
    pila: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;
