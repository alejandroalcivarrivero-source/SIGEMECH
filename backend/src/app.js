const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
// Importar modelos para asegurar su inicialización y asociaciones
require('./models_index');

// Importar rutas
const authRoutes = require('./modules/auth/auth_routes');
const pacientesRoutes = require('./modules/pacientes/pacientes_routes');
const soporteRoutes = require('./modules/soporte/soporte_routes');
const catalogsRoutes = require('./modules/catalogs/catalogs_routes');
const admissionsRoutes = require('./modules/admissions/admissions_routes');

dotenv.config();
const port = process.env.PORT || 3002;

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Registro de Rutas
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/soporte', soporteRoutes);
app.use('/api/catalogs', catalogsRoutes);
app.use('/api/admissions', admissionsRoutes);

// Health Check (Verificación de DB)
app.get('/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.status(200).json({ status: 'SIGEMECH Online', db: 'Conectada' });
    } catch (error) {
        res.status(503).json({ status: 'SIGEMECH Online', db: 'Desconectada', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`🚀 Servidor SIGEMECH corriendo en http://localhost:${port}`);
});

module.exports = app;
