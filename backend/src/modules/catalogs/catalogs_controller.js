const { sequelize } = require('../../config/db');
const { QueryTypes } = require('sequelize');

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
        attributes: ['id', 'nombre', 'codigo_inec'],
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
    const { search } = req.query;
    
    const options = {
        order: [['nombre', 'ASC']],
        limit: 20
    };

    if (search) {
        const { Op } = require('sequelize');
        options.where = {
            nombre: { [Op.like]: `%${search}%` }
        };
    }

    return safeFindAll(Ocupacion, res, 'ocupaciones', options);
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
    // Redireccionamos a TipoIdentificacion para mantener compatibilidad con el frontend
    const { TipoIdentificacion } = sequelize.models;
    return safeFindAll(TipoIdentificacion, res, 'tipos de identificación (alias documentos)', {
        attributes: ['id', 'nombre'],
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
        attributes: ['id', 'nombre'],
        order: [['nombre', 'ASC']]
    });
}

async function getEthnicNationalities(req, res) {
    const { NacionalidadEtnica } = sequelize.models;
    // Soporta etnia_id en params o query string para cumplir con el requerimiento
    const etnia_id = req.params.etnia_id || req.query.etnia_id;

    // Si no hay etnia_id, devolvemos lista vacía para mantener la cascada estricta
    if (!etnia_id || etnia_id === 'undefined' || etnia_id === 'null') {
        return res.json([]);
    }
    
    const options = {
        attributes: ['id', 'nombre'],
        where: {
            etnia_id: etnia_id
        },
        order: [['nombre', 'ASC']],
        raw: true
    };

    return safeFindAll(NacionalidadEtnica, res, 'autoidentificaciones étnicas (nacionalidades)', options);
}

async function getEthnicGroups(req, res) {
    const { Pueblo } = sequelize.models;
    const nacionalidad_id = req.params.nacionalidad_id || req.query.nacionalidad_id;

    // Si no hay nacionalidad_id, devolvemos lista vacía para mantener la cascada estricta
    if (!nacionalidad_id || nacionalidad_id === 'undefined' || nacionalidad_id === 'null') {
        return res.json([]);
    }
    
    const options = {
        attributes: ['id', 'nombre'],
        where: { nacionalidad_id: nacionalidad_id },
        order: [['nombre', 'ASC']]
    };

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

async function obtenerEstadosInstruccion(req, res) {
    const { EstadoNivelInstruccion } = sequelize.models;
    return safeFindAll(EstadoNivelInstruccion, res, 'estados de nivel de instrucción', {
        attributes: ['id', 'nombre'],
        where: { esta_activo: 1 },
        order: [['nombre', 'ASC']]
    });
}

async function obtenerTiposEmpresa(req, res) {
    const { TipoEmpresa } = sequelize.models;
    return safeFindAll(TipoEmpresa, res, 'tipos de empresa', {
        attributes: ['id', 'nombre'],
        where: { esta_activo: 1 },
        order: [['nombre', 'ASC']]
    });
}

async function getTiposDiscapacidad(req, res) {
    const { TipoDiscapacidad } = sequelize.models;
    return safeFindAll(TipoDiscapacidad, res, 'tipos de discapacidad', {
        order: [['nombre', 'ASC']]
    });
}

async function obtenerBonos(req, res) {
    try {
        // Verificamos si la tabla existe antes de consultar
        const [tableExists] = await sequelize.query("SHOW TABLES LIKE 'cat_bonos'", { type: QueryTypes.SELECT });
        
        if (tableExists.length === 0) {
            console.warn("[WARNING] La tabla 'cat_bonos' no existe en la base de datos.");
            return res.json([]);
        }

        const bonos = await sequelize.query(
            "SELECT id, nombre FROM cat_bonos WHERE esta_activo = 1 ORDER BY nombre ASC",
            { type: QueryTypes.SELECT }
        );
        return res.json(bonos);
    } catch (error) {
        console.error("Error obteniendo bonos:", error);
        return res.status(500).json({
            message: "Error interno en el catálogo de bonos",
            detail: error.message
        });
    }
}

async function searchMotivosConsulta(req, res) {
    const { search } = req.query;

    if (!search) {
        return res.json([]);
    }

    try {
        const results = await sequelize.query(
                `SELECT
                    id_sintoma AS id,
                    motivo_consulta_sintoma AS nombre,
                    categoria AS categoria,
                    codigo_triaje AS prioridad
                FROM cat_motivo_consulta_sintomas
                WHERE motivo_consulta_sintoma LIKE :search
                AND esta_activo = 1
                LIMIT 50`,
                {
                    replacements: { search: `%${search}%` },
                    type: QueryTypes.SELECT
                }
            );
        res.json(results);
    } catch (error) {
        console.error("Error en searchMotivosConsulta:", error);
        res.status(500).json({
            message: "Error al buscar síntomas/motivos de consulta",
            detail: error.message
        });
    }
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
    getSegurosSalud,
    obtenerEstadosInstruccion,
    obtenerTiposEmpresa,
    getTiposDiscapacidad,
    obtenerBonos,
    searchMotivosConsulta
};
