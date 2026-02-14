const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

/**
 * Función para generar modelos de catálogo simples
 */
const createCatalogModel = (tableName, modelName, hasActive = true) => {
    const attributes = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'nombre'
        }
    };

    if (hasActive) {
        attributes.activo = {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'activo'
        };
    }

    return sequelize.define(modelName, attributes, {
        tableName: tableName,
        underscored: true,
        timestamps: false
    });
};

// --- JERARQUÍA ÉTNICA ---

// Modelo Etnia (cat_etnias)
const Etnia = sequelize.define('Etnia', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'nombre'
    }
}, {
    tableName: 'cat_etnias',
    underscored: true,
    timestamps: false
});

// Modelo NacionalidadEtnica (cat_etnias_nacionalidades)
const NacionalidadEtnica = sequelize.define('NacionalidadEtnica', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'nombre'
    },
    etniaId: {
        type: DataTypes.INTEGER,
        field: 'etnia_id',
        allowNull: true
    }
}, {
    tableName: 'cat_etnias_nacionalidades',
    underscored: true,
    timestamps: false
});

// Modelo Pueblo (cat_pueblos)
const Pueblo = sequelize.define('Pueblo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'nombre'
    },
    nacionalidadId: {
        type: DataTypes.INTEGER,
        field: 'nacionalidad_id'
    }
}, {
    tableName: 'cat_pueblos',
    underscored: true,
    timestamps: false
});

// --- OTROS CATÁLOGOS ---

const Instruccion = createCatalogModel('cat_instruccion', 'Instruccion');
const SeguroSalud = createCatalogModel('cat_seguros_salud', 'SeguroSalud');

// Nacionalidad (País/Origen) - Tabla independiente de la jerarquía étnica
const Nacionalidad = sequelize.define('Nacionalidad', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'nombre'
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'activo'
    }
}, {
    tableName: 'cat_nacionalidades',
    underscored: true,
    timestamps: false
});

// Catálogos para Admisiones
const Triaje = createCatalogModel('cat_triaje', 'Triaje');
const EstadoProceso = createCatalogModel('cat_estados_proceso', 'EstadoProceso');
const FormularioLlegada = createCatalogModel('cat_formas_llegada', 'FormularioLlegada');

// Nuevos catálogos normalizados
const Sexo = createCatalogModel('cat_sexos', 'Sexo', false);
const EstadoCivil = createCatalogModel('cat_estados_civiles', 'EstadoCivil', false);
const Genero = createCatalogModel('cat_generos', 'Genero', false);
const Parentesco = createCatalogModel('cat_parentescos', 'Parentesco', false);
const FuenteInformacion = createCatalogModel('cat_fuentes_informacion', 'FuenteInformacion', false);
const TipoDocumento = createCatalogModel('cat_tipos_documento', 'TipoDocumento', false);
const CondicionLlegada = createCatalogModel('cat_condiciones_llegada', 'CondicionLlegada', false);
const NivelEducacion = createCatalogModel('cat_niveles_educacion', 'NivelEducacion', false);
const TipoIdentificacion = createCatalogModel('cat_tipos_identificacion', 'TipoIdentificacion', false);

module.exports = {
    Etnia,
    NacionalidadEtnica,
    Pueblo,
    Instruccion,
    SeguroSalud,
    Nacionalidad,
    Triaje,
    EstadoProceso,
    FormularioLlegada,
    Sexo,
    EstadoCivil,
    Genero,
    Parentesco,
    FuenteInformacion,
    TipoDocumento,
    CondicionLlegada,
    NivelEducacion,
    TipoIdentificacion
};
