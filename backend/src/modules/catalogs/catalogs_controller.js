const { sequelize } = require('../../config/db');

/**
 * Helper para manejo de errores en controladores de catálogos
 * Evita el crash si el modelo no está definido (Fail-Safe)
 */
const safeFindAll = async (model, res, catalogName, options = {}) => {
    if (!model || typeof model.findAll !== 'function') {
        console.error(`[CRITICAL] El modelo para el catálogo '${catalogName}' no está inicializado.`);
        return res.status(503).json({
            message: `Servicio de catálogo '${catalogName}' no disponible`,
            detail: "El modelo no fue cargado correctamente en el servidor."
        });
    }
    try {
        const data = await model.findAll(options);
        return res.json(data);
    } catch (error) {
        console.error(`Error obteniendo ${catalogName}:`, error);
        return res.status(500).json({
            message: `Error interno en el catálogo de ${catalogName}`,
            detail: error.message
        });
    }
};

async function getProvincias(req, res) {
    const { Provincia } = sequelize.models;
    return safeFindAll(Provincia, res, 'provincias', {
        order: [['nombre', 'ASC']]
    });
}

async function getCantones(req, res) {
    const { Canton } = sequelize.models;
    const { provincia_id } = req.params;
    return safeFindAll(Canton, res, 'cantones', {
        where: { provincia_id: provincia_id },
        order: [['nombre', 'ASC']]
    });
}

async function getParroquias(req, res) {
    const { Parroquia } = sequelize.models;
    const { canton_id } = req.params;
    return safeFindAll(Parroquia, res, 'parroquias', {
        where: { canton_id: canton_id },
        order: [['nombre', 'ASC']]
    });
}

async function getNacionalidades(req, res) {
    const { Nacionalidad } = sequelize.models;
    return safeFindAll(Nacionalidad, res, 'nacionalidades', {
        attributes: ['id', ['gentilicio', 'nombre']],
        where: { activo: true },
        order: [['gentilicio', 'ASC']],
        raw: true
    });
}

async function getEtnias(req, res) {
    const { Etnia } = sequelize.models;
    return safeFindAll(Etnia, res, 'etnias', {
        attributes: ['id', 'nombre'],
        order: [['nombre', 'ASC']]
    });
}

async function getNivelesEducacion(req, res) {
    const { Instruccion } = sequelize.models;
    return safeFindAll(Instruccion, res, 'instruccion', {
        order: [['nombre', 'ASC']]
    });
}

async function getOcupaciones(req, res) {
    const { Ocupacion } = sequelize.models;
    return safeFindAll(Ocupacion, res, 'ocupaciones', {
        order: [['nombre', 'ASC']]
    });
}

async function getSexos(req, res) {
    const { Sexo } = sequelize.models;
    return safeFindAll(Sexo, res, 'sexos', {
        order: [['nombre', 'ASC']]
    });
}

async function getEstadosCiviles(req, res) {
    const { EstadoCivil } = sequelize.models;
    return safeFindAll(EstadoCivil, res, 'estados civiles', {
        order: [['nombre', 'ASC']]
    });
}

async function getGeneros(req, res) {
    const { Genero } = sequelize.models;
    return safeFindAll(Genero, res, 'géneros', {
        order: [['nombre', 'ASC']]
    });
}

async function getParentescos(req, res) {
    const { Parentesco } = sequelize.models;
    return safeFindAll(Parentesco, res, 'parentescos', {
        order: [['nombre', 'ASC']]
    });
}

async function getFormasLlegada(req, res) {
    const { FormaLlegada } = sequelize.models;
    return safeFindAll(FormaLlegada, res, 'formas de llegada', {
        order: [['nombre', 'ASC']]
    });
}

async function getFuentesInformacion(req, res) {
    const { FuenteInformacion } = sequelize.models;
    return safeFindAll(FuenteInformacion, res, 'fuentes de información', {
        order: [['nombre', 'ASC']]
    });
}

async function getTiposDocumento(req, res) {
    const { TipoDocumento } = sequelize.models;
    return safeFindAll(TipoDocumento, res, 'tipos de documento', {
        order: [['nombre', 'ASC']]
    });
}

async function getCondicionesLlegada(req, res) {
    const { CondicionLlegada } = sequelize.models;
    return safeFindAll(CondicionLlegada, res, 'condiciones de llegada', {
        order: [['nombre', 'ASC']]
    });
}

async function getTiposIdentificacion(req, res) {
    const { TipoIdentificacion } = sequelize.models;
    return safeFindAll(TipoIdentificacion, res, 'tipos de identificación', {
        order: [['id', 'ASC']]
    });
}

async function getEthnicNationalities(req, res) {
    const { AutoidentificacionEtnica } = sequelize.models;
    // Soporta tanto params (ruta) como query string según requerimiento
    const etnia_id = req.params.etnia_id || req.query.etnia_id;
    
    const options = {
        order: [['nombre', 'ASC']]
    };

    if (etnia_id) {
        options.where = { etnia_id: etnia_id };
    }

    return safeFindAll(AutoidentificacionEtnica, res, 'autoidentificaciones étnicas', options);
}

async function getEthnicGroups(req, res) {
    const { Pueblo } = sequelize.models;
    // Soporta tanto params (ruta) como query string según requerimiento
    const nacionalidad_id = req.params.nacionalidad_id || req.query.nacionalidad_id;
    
    const options = {
        order: [['nombre', 'ASC']]
    };

    if (nacionalidad_id) {
        options.where = { nacionalidad_id: nacionalidad_id };
    }

    return safeFindAll(Pueblo, res, 'pueblos', options);
}

/**
 * Catálogo de Establecimientos de Salud de la tabla cat_establecimientos_salud
 */
async function getEstablecimientosSalud(req, res) {
    const { EstablecimientoSalud } = sequelize.models;
    return safeFindAll(EstablecimientoSalud, res, 'establecimientos de salud', {
        order: [['nombre', 'ASC']]
    });
}

async function getPaises(req, res) {
    const { Pais } = sequelize.models;
    return safeFindAll(Pais, res, 'paises', {
        order: [['nombre', 'ASC']]
    });
}

async function getSegurosSalud(req, res) {
    const { SeguroSalud } = sequelize.models;
    return safeFindAll(SeguroSalud, res, 'seguros de salud', {
        order: [['nombre', 'ASC']]
    });
}

module.exports = {
    getProvincias,
    getCantones,
    getParroquias,
    getNacionalidades,
    getEtnias,
    getNivelesEducacion,
    getOcupaciones,
    getEstadosCiviles,
    getTiposIdentificacion,
    getEthnicNationalities,
    getEthnicGroups,
    getEstablecimientosSalud,
    getPaises,
    getSexos,
    getGeneros,
    getParentescos,
    getFormasLlegada,
    getFuentesInformacion,
    getTiposDocumento,
    getCondicionesLlegada,
    getSegurosSalud
};
