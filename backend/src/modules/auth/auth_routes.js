const express = require('express');
const router = express.Router();
const authController = require('./auth_controller');

// Ruta: POST /api/auth/login
router.post('/login', authController.login);

// Bajo Soberanía Lingüística: Verificación de identidad/sesión activa
const authMiddleware = require('../../middlewares/auth_middleware');
router.get('/verificar-identidad', authMiddleware, (req, res) => {
    res.status(200).json({
        mensaje: 'Identidad confirmada',
        user: req.user // El middleware ya decodificó el token y lo puso en req.user
    });
});

module.exports = router;
