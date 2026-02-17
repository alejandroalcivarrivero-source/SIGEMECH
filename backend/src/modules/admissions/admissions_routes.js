const express = require('express');
const router = express.Router();
const admissionsController = require('./admissions_controller');
const partosController = require('./partos_controlador');
const authMiddleware = require('../../middlewares/auth_middleware');
const uppercaseMiddleware = require('../../middlewares/uppercase_middleware');

/**
 * Rutas para el módulo de Admisiones de Emergencia (Formulario 008)
 * Todas las rutas requieren autenticación.
 */

// Crear una nueva admisión
router.post('/', authMiddleware, admissionsController.crearAdmision);

// Ruta para buscar paciente por número de documento (para vínculo materno)
router.get('/buscar-paciente/:numero_documento', authMiddleware, admissionsController.buscarPacientePorDocumento);

// Verificar admisión reciente
router.get('/verificar-reciente/:pacienteId', authMiddleware, admissionsController.verificarAdmisionReciente);

// Rutas para el Libro de Partos (RPIS/MSP)
router.post('/partos', authMiddleware, partosController.guardarParto);
router.get('/partos/:paciente_id', authMiddleware, partosController.obtenerPartoPorPaciente);

// Las siguientes rutas se implementarán conforme sea necesario
// router.get('/', authMiddleware, admissionsController.getAll);
// router.get('/:id', authMiddleware, admissionsController.getById);
// router.patch('/:id', authMiddleware, admissionsController.update);

// Super-Controller para guardar toda la admisión
router.post('/completa', [authMiddleware, uppercaseMiddleware], admissionsController.crear_admision_completa);

module.exports = router;
