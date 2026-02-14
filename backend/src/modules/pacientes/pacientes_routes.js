const express = require('express');
const router = express.Router();
const pacientesController = require('./pacientes_controller');
const verificarToken = require('../../middlewares/auth_middleware');

// Ruta: GET /api/pacientes/buscar/:cedula
router.get('/buscar/:cedula', verificarToken, pacientesController.buscarPacientePorCedula);

// Ruta: POST /api/pacientes/admision (Paso 1)
router.post('/admision', verificarToken, pacientesController.registrarAdmision);

// Ruta: POST /api/pacientes
router.post('/', verificarToken, pacientesController.registrarPaciente);

// Ruta: POST /api/pacientes/triage (Paso 2)
router.post('/triage', verificarToken, pacientesController.registrarTriage);

module.exports = router;
