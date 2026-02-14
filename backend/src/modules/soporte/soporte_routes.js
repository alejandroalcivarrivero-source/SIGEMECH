const express = require('express');
const router = express.Router();
const { getLogsSistema, getDashboardStats } = require('./soporte_controller');
const verificarToken = require('../../middlewares/auth_middleware');

// Middleware específico para verificar rol de Soporte TI (ID 6)
const verificarRolSoporte = (req, res, next) => {
    // Verificamos si existe el usuario en la request (inyectado por verificarToken)
    if (!req.user) {
        return res.status(401).json({ message: 'Usuario no autenticado.' });
    }

    // El rol_id 6 corresponde a Soporte TI según requerimientos
    // Verificamos si el token incluye el rol_id o si está en los roles
    const rolId = req.user.rol_id;
    
    // Si tenemos el ID directamente
    if (rolId === 6) {
        return next();
    }

    // Si tenemos roles como array de nombres o IDs
    const roles = req.user.roles || [];
    // Verificamos si es array o string
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    
    const esSoporte = rolesArray.some(rol =>
        rol === 6 ||
        rol === '6' ||
        (typeof rol === 'string' && rol.toLowerCase().includes('soporte'))
    );

    if (!esSoporte) {
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de Soporte TI.' });
    }
    
    next();
};

router.get('/logs', verificarToken, verificarRolSoporte, getLogsSistema);
router.get('/stats', verificarToken, verificarRolSoporte, getDashboardStats);

module.exports = router;
