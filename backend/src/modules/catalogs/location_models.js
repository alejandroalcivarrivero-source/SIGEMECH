const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const { normalizeStrings } = require('../../config/model_helper');

/**
 * Modelo para Provincias de Ecuador
 */
const Province = sequelize.define('cat_provincias', {
    id: {
        type: DataTypes.STRING(2), // ISO code o código INEC
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: 'nombre'
    }
}, {
    tableName: 'cat_provincias',
    underscored: true,
    timestamps: false,
    hooks: {
        beforeCreate: (m) => normalizeStrings(m),
        beforeUpdate: (m) => normalizeStrings(m)
    }
});

/**
 * Modelo para Cantones (Municipios)
 */
const Canton = sequelize.define('cat_cantones', {
    id: {
        type: DataTypes.STRING(4), // Código INEC
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'nombre'
    },
    provinceId: {
        type: DataTypes.STRING(2),
        allowNull: false,
        field: 'provincia_id'
    }
}, {
    tableName: 'cat_cantones',
    underscored: true,
    timestamps: false,
    hooks: {
        beforeCreate: (m) => normalizeStrings(m),
        beforeUpdate: (m) => normalizeStrings(m)
    }
});

/**
 * Modelo para Parroquias
 */
const Parish = sequelize.define('cat_parroquias', {
    id: {
        type: DataTypes.STRING(6), // Código INEC
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'nombre'
    },
    cantonId: {
        type: DataTypes.STRING(4),
        allowNull: false,
        field: 'canton_id'
    }
}, {
    tableName: 'cat_parroquias',
    underscored: true,
    timestamps: false,
    hooks: {
        beforeCreate: (m) => normalizeStrings(m),
        beforeUpdate: (m) => normalizeStrings(m)
    }
});

module.exports = { Province, Canton, Parish };
