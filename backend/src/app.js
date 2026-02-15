const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const logger = require('./config/logger');
const { inicializar } = require('./config/db.js');

// Importar rutas
const authRoutes = require('./modules/auth/auth_routes');
const pacientesRoutes = require('./modules/pacientes/pacientes_routes');
const soporteRoutes = require('./modules/soporte/soporte_routes');
const catalogsRoutes = require('./modules/catalogs/catalogs_routes');
const admissionsRoutes = require('./modules/admissions/admissions_routes');
const errorHandler = require('./middlewares/error_handler');

dotenv.config();
const port = process.env.PORT || 3002;

const app = express();

// Middlewares de Seguridad y Utilidades
app.use(helmet());
app.use(cors());
app.use(express.json());

// Middleware de Logs de Acceso Profesional
app.use((req, res, next) => {
    logger.info(`Acceso: ${req.method} ${req.url} - IP: ${req.ip}`);
    next();
});

// Registro de Rutas
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/soporte', soporteRoutes);
app.use('/api/catalogs', catalogsRoutes);
app.use('/api/admissions', admissionsRoutes);

// Health Check ahora usa la instancia de sequelize del módulo db
const { sequelize } = require('./config/db'); 
app.get('/api/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.status(200).json({
            status: 'SIGEMECH Online',
            mensaje: 'El sistema está operando correctamente',
            db: 'Conectada'
        });
    } catch (error) {
        res.status(503).json({
            status: 'SIGEMECH Fuera de Línea',
            mensaje: 'Error de conexión con la base de datos',
            db: 'Desconectada',
            error: error.message
        });
    }
});

// Middleware de manejo de errores (debe ser el último middleware)
app.use(errorHandler);

const iniciarServidor = async () => {
    try {
        await inicializar(); // Inicializa la DB y los modelos
        app.listen(port, () => {
            logger.info(`🚀 Servidor SIGEMECH iniciado en el puerto ${port}`);
            console.log(`🚀 Servidor SIGEMECH corriendo en http://localhost:${port}`);
        });
    } catch (error) {
        logger.error('Error fatal al iniciar el servidor:', error);
        process.exit(1);
    }
};

iniciarServidor();

module.exports = app;
