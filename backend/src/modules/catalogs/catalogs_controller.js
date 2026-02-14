const sequelize = require('../../config/db');
const { EstablecimientoSalud } = require('../admissions/parto_model');
const {
    Province,
    Canton,
    Parish,
    Etnia,
    NacionalidadEtnica,
    Pueblo,
    Instruccion,
    SeguroSalud,
    Nacionalidad,
    Sexo,
    EstadoCivil,
    Genero,
    Parentesco,
    FormularioLlegada,
    FuenteInformacion,
    TipoDocumento,
    CondicionLlegada,
    NivelEducacion,
    TipoIdentificacion
} = require('../../models_index');

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
    return safeFindAll(Province, res, 'provincias', {
        order: [['nombre', 'ASC']]
    });
}

async function getCantones(req, res) {
    const { provincia_id } = req.params;
    return safeFindAll(Canton, res, 'cantones', {
        where: { provinceId: provincia_id },
        order: [['nombre', 'ASC']]
    });
}

async function getParroquias(req, res) {
    const { canton_id } = req.params;
    return safeFindAll(Parish, res, 'parroquias', {
        where: { cantonId: canton_id },
        order: [['nombre', 'ASC']]
    });
}

async function getNacionalidades(req, res) {
    return safeFindAll(Nacionalidad, res, 'nacionalidades', {
        attributes: ['id', ['gentilicio', 'nombre']],
        where: { activo: true },
        order: [['gentilicio', 'ASC']],
        raw: true
    });
}

async function getEtnias(req, res) {
    return safeFindAll(Etnia, res, 'etnias', {
        attributes: ['id', 'nombre'],
        order: [['nombre', 'ASC']]
    });
}

async function getNivelesEducacion(req, res) {
    return safeFindAll(Instruccion, res, 'instrucción', {
        order: [['nombre', 'ASC']]
    });
}

async function getSegurosSalud(req, res) {
    return safeFindAll(SeguroSalud, res, 'seguros de salud', {
        order: [['nombre', 'ASC']]
    });
}

async function getSexos(req, res) {
    return safeFindAll(Sexo, res, 'sexos', {
        order: [['nombre', 'ASC']]
    });
}

async function getEstadosCiviles(req, res) {
    return safeFindAll(EstadoCivil, res, 'estados civiles', {
        order: [['nombre', 'ASC']]
    });
}

async function getGeneros(req, res) {
    return safeFindAll(Genero, res, 'géneros', {
        order: [['nombre', 'ASC']]
    });
}

async function getParentescos(req, res) {
    return safeFindAll(Parentesco, res, 'parentescos', {
        order: [['nombre', 'ASC']]
    });
}

async function getFormasLlegada(req, res) {
    return safeFindAll(FormularioLlegada, res, 'formas de llegada', {
        order: [['nombre', 'ASC']]
    });
}

async function getFuentesInformacion(req, res) {
    return safeFindAll(FuenteInformacion, res, 'fuentes de información', {
        order: [['nombre', 'ASC']]
    });
}

async function getTiposDocumento(req, res) {
    return safeFindAll(TipoDocumento, res, 'tipos de documento', {
        order: [['nombre', 'ASC']]
    });
}

async function getCondicionesLlegada(req, res) {
    return safeFindAll(CondicionLlegada, res, 'condiciones de llegada', {
        order: [['nombre', 'ASC']]
    });
}

async function getTiposIdentificacion(req, res) {
    return safeFindAll(TipoIdentificacion, res, 'tipos de identificación', {
        order: [['id', 'ASC']]
    });
}

async function getEthnicNationalities(req, res) {
    // Soporta tanto params (ruta) como query string según requerimiento
    const etnia_id = req.params.etnia_id || req.query.etnia_id;
    
    const options = {
        order: [['nombre', 'ASC']]
    };

    if (etnia_id) {
        options.where = { etniaId: etnia_id };
    }

    return safeFindAll(NacionalidadEtnica, res, 'nacionalidades étnicas', options);
}

async function getEthnicGroups(req, res) {
    // Soporta tanto params (ruta) como query string según requerimiento
    const nacionalidad_id = req.params.nacionalidad_id || req.query.nacionalidad_id;
    
    const options = {
        order: [['nombre', 'ASC']]
    };

    if (nacionalidad_id) {
        options.where = { nacionalidadId: nacionalidad_id };
    }

    return safeFindAll(Pueblo, res, 'pueblos étnicos', options);
}

/**
 * Catálogo de Establecimientos de Salud de la tabla cat_establecimientos_salud
 */
async function getEstablecimientosSalud(req, res) {
    return safeFindAll(EstablecimientoSalud, res, 'establecimientos de salud', {
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
    getSegurosSalud,
    getSexos,
    getEstadosCiviles,
    getGeneros,
    getParentescos,
    getFormasLlegada,
    getFuentesInformacion,
    getTiposDocumento,
    getCondicionesLlegada,
    getTiposIdentificacion,
    getEthnicNationalities,
    getEthnicGroups,
    getEstablecimientosSalud
};
