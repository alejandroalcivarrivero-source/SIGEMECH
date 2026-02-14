const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const { normalizeStrings } = require('../../config/model_helper');

const Representante = sequelize.define('paciente_representantes', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
    },
    pacienteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'paciente_id'
    },
    tipoIdentificacionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'tipo_identificacion_id'
    },
    identificacion: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'identificacion'
    },
    primerApellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'primer_apellido',
        validate: {
            notEmpty: true
        }
    },
    segundoApellido: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'segundo_apellido'
    },
    primerNombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'primer_nombre',
        validate: {
            notEmpty: true
        }
    },
    segundoNombre: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'segundo_nombre'
    },
    parentescoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'parentesco_id'
    }
}, {
    tableName: 'paciente_representantes',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    hooks: {
        beforeCreate: (rep) => normalizeStrings(rep),
        beforeUpdate: (rep) => normalizeStrings(rep)
    }
});

module.exports = Representante;
