const winston = require('winston');
const path = require('path');

// Configuración de niveles y colores para Soberanía Lingüística
const niveles = {
  error: 0,
  critico: 1,
  advertencia: 2,
  info: 3,
  acceso: 4,
  depuracion: 5
};

const colores = {
  error: 'red',
  critico: 'magenta',
  advertencia: 'yellow',
  info: 'green',
  acceso: 'blue',
  depuracion: 'gray'
};

winston.addColors(colores);

const formatoLog = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
  )
);

const formatoConsola = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(
    (info) => `${info.level}: ${info.message}`
  )
);

const logger = winston.createLogger({
  levels: niveles,
  format: formatoLog,
  transports: [
    // Logs de errores críticos y generales
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/error.log'), 
      level: 'critico' 
    }),
    // Historial completo de auditoría (Acceso y Errores)
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/auditoria.log') 
    }),
  ],
});

// En desarrollo, mostrar también por consola con colores
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: formatoConsola,
    level: 'depuracion'
  }));
}

module.exports = logger;
