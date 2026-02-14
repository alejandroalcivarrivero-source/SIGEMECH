const express = require('express');
const router = express.Router();
const catalogsController = require('./catalogs_controller');
const verificarToken = require('../../middlewares/auth_middleware');

// Rutas de catálogos (Públicas para agilizar la carga en formularios de admisión)
router.get('/provincias', catalogsController.getProvincias);
router.get('/cantones/:provincia_id', catalogsController.getCantones);
router.get('/parroquias/:canton_id', catalogsController.getParroquias);
router.get('/nacionalidades', catalogsController.getNacionalidades);
router.get('/etnias', catalogsController.getEtnias);
router.get('/niveles-educacion', catalogsController.getNivelesEducacion);
router.get('/seguros-salud', catalogsController.getSegurosSalud);

// Nuevos catálogos normalizados
router.get('/sexos', catalogsController.getSexos);
router.get('/estados-civiles', catalogsController.getEstadosCiviles);
router.get('/generos', catalogsController.getGeneros);

// Catálogos adicionales para admisiones (kebab-case)
router.get('/parentescos', catalogsController.getParentescos);
router.get('/formas-llegada', catalogsController.getFormasLlegada);
router.get('/fuentes-informacion', catalogsController.getFuentesInformacion);
router.get('/tipos-documento', catalogsController.getTiposDocumento);
router.get('/condiciones-llegada', catalogsController.getCondicionesLlegada);
router.get('/tipos-identificacion', catalogsController.getTiposIdentificacion);

// Cascada de Autoidentificación Étnica (Soporta query params y URL params)
router.get('/etnias', catalogsController.getEtnias);
router.get('/nacionalidades-etnicas', catalogsController.getEthnicNationalities);
router.get('/pueblos-etnicos', catalogsController.getEthnicGroups);

// Rutas compatibles con el requerimiento específico /api/catalogos/...
// (Express maneja el prefijo en app.js, aquí solo definimos la estructura interna)
router.get('/nacionalidades-etnicas/:etnia_id', catalogsController.getEthnicNationalities);
router.get('/pueblos-etnicos/:nacionalidad_id', catalogsController.getEthnicGroups);
router.get('/establecimientos-salud', catalogsController.getEstablecimientosSalud);

module.exports = router;
