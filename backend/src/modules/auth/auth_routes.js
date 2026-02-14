const express = require('express');
const router = express.Router();
const authController = require('./auth_controller');

// Ruta: POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;
