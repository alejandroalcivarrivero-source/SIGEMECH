const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const { normalizeStrings } = require('../../config/model_helper');

const Paciente = sequelize.define('pacientes', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
    },
    tipoIdentificacionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'id_tipo_identificacion'
    },
    documentNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        field: 'cedula'
    },
    firstName1: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'primer_nombre'
    },
    firstName2: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'segundo_nombre'
    },
    lastName1: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'primer_apellido'
    },
    lastName2: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'segundo_apellido'
    },
    birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'fecha_nacimiento' // Sincronizado con MariaDB 'pacientes.fecha_nacimiento'
    },
    sexId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'id_sexo'
    },
    genderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'id_genero'
    },
    estadoCivilId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'estado_civil' // Sincronizado con MariaDB 'pacientes.estado_civil'
    },
    nacionalidadId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'nacionalidad' // Sincronizado con MariaDB 'pacientes.nacionalidad'
    },
    parishId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'id_parroquia'
    },
    birthPlace: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'lugar_nacimiento'
    },
    ethnicityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'autoidentificacion_etnica'
    },
    ethnicNationalityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'nacionalidad_etnica_id'
    },
    ethnicGroupId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'pueblo_id'
    },
    instruccionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'nivel_instruccion' // Sincronizado con MariaDB 'pacientes.nivel_instruccion'
    },
    healthInsuranceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'tipo_seguro' // Sincronizado con MariaDB 'pacientes.tipo_seguro'
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'direccion'
    },
    addressReference: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'referencia_domicilio'
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'telefono'
    },
    landline: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'telefono_fijo'
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'email',
        validate: {
            isEmail: true
        }
    },
    occupation: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'ocupacion'
    },
    companyType: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'tipo_empresa'
    },
    isDisabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'tiene_discapacidad'
    },
    disabilityType: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'tipo_discapacidad'
    },
    disabilityPercentage: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'porcentaje_discapacidad'
    },
    disabilityCard: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'carnet_discapacidad'
    },
    representativeName: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'nombre_representante'
    },
    representativeDocumentType: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'tipo_doc_representante'
    },
    representativeDocumentNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'cedula_representante'
    },
    representativeKinshipId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'parentesco_representante'
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'creado_por'
    }
}, {
    tableName: 'pacientes',
    timestamps: true,
    underscored: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    hooks: {
        beforeCreate: (patient) => normalizeStrings(patient),
        beforeUpdate: (patient) => normalizeStrings(patient)
    }
});

module.exports = Paciente;
