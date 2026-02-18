const express = require('express');
const router = express.Router();
const admissionsController = require('./admissions_controller');
const partosController = require('./partos_controlador');
const authMiddleware = require('../../middlewares/auth_middleware');

/**
 * Rutas para el módulo de Admisiones de Emergencia (Formulario 008)
 * Todas las rutas requieren autenticación.
 */

// Crear una nueva admisión
router.post('/', authMiddleware, admissionsController.createAdmission);
router.post('/emergencia', authMiddleware, admissionsController.createAdmission); // Endpoint específico para E2E Final

// Validar paciente materna para sección nacimiento
router.post('/validar-materna', authMiddleware, admissionsController.validarMaterna);

// Rutas para el Libro de Partos (RPIS/MSP)
router.post('/partos', authMiddleware, partosController.guardarParto);
router.get('/partos/:paciente_id', authMiddleware, partosController.obtenerPartoPorPaciente);

// Las siguientes rutas se implementarán conforme sea necesario
// router.get('/', authMiddleware, admissionsController.getAll);
// router.get('/:id', authMiddleware, admissionsController.getById);
// router.patch('/:id', authMiddleware, admissionsController.update);

module.exports = router;
