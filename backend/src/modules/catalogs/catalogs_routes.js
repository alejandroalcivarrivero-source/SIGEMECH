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
router.get('/ocupaciones', catalogsController.getOcupaciones);
router.get('/tipos-discapacidad', catalogsController.getTiposDiscapacidad);

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
router.get('/autoidentificaciones-etnicas', catalogsController.getEthnicNationalities);
router.get('/pueblos', catalogsController.getEthnicGroups);

// Rutas compatibles con el requerimiento específico /api/catalogos/...
// (Express maneja el prefijo en app.js, aquí solo definimos la estructura interna)
router.get('/etnias/:etnia_id/nacionalidades', catalogsController.getEthnicNationalities);
router.get('/nacionalidades/:nacionalidad_id/pueblos', catalogsController.getEthnicGroups);
router.get('/autoidentificaciones-etnicas/:etnia_id', catalogsController.getEthnicNationalities);
router.get('/pueblos/:nacionalidad_id', catalogsController.getEthnicGroups);
router.get('/establecimientos-salud', catalogsController.getEstablecimientosSalud);

// Ruta para obtener países
router.get('/paises', catalogsController.getPaises);
router.get('/seguros-salud', catalogsController.getSegurosSalud);
router.get('/estado-nivel-instruccion', catalogsController.obtenerEstadosInstruccion);
router.get('/tipos-empresa', catalogsController.obtenerTiposEmpresa);
router.get('/bonos', catalogsController.obtenerBonos);
router.get('/motivos-consulta', catalogsController.searchMotivosConsulta);

module.exports = router;
