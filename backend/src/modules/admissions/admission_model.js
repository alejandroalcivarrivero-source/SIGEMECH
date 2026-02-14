const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const { normalizeStrings } = require('../../config/model_helper');

/**
 * Modelo para el Formulario 008 (Emergencia) - Admisión y Triaje Inicial
 * Refactorizado a Español Técnico (Normativa MSP)
 */
const EmergencyAdmission = sequelize.define('admisiones_emergencia', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
    },
    pacienteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'paciente_id'
    },
    fechaAdmision: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'fecha_admision'
    },
    motivoConsulta: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'motivo_consulta'
    },
    condicionLlegadaId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'condicion_llegada_id'
    },
    unidadSaludAdscripcion: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'unidad_salud_adscripcion'
    },
    antecedentesPersonales: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'antecedentes_personales'
    },
    antecedentesFamiliares: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'antecedentes_familiares'
    },
    enfermedadActual: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'enfermedad_actual'
    },
    temperatura: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true,
        field: 'temperatura'
    },
    presionArterialSistolica: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'presion_arterial_sistolica'
    },
    presionArterialDiastolica: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'presion_arterial_diastolica'
    },
    frecuenciaCardiaca: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'frecuencia_cardiaca'
    },
    frecuenciaRespiratoria: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'frecuencia_respiratoria'
    },
    saturacionOxigeno: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'saturacion_oxigeno'
    },
    peso: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'peso'
    },
    talla: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: true,
        field: 'talla'
    },
    examenFisico: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'examen_fisico'
    },
    triajeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'triaje_id'
    },
    registradoPor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'registrado_por'
    },
    medicoTratanteId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'medico_tratante_id'
    },
    estadoProcesoId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'estado_proceso_id'
    },
    // Bloque Acompañante
    acompananteNombre: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'acompanante_nombre'
    },
    acompananteParentescoId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'acompanante_parentesco_id'
    },
    acompananteDireccion: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'acompanante_direccion'
    },
    acompananteTelefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'acompanante_telefono'
    },
    // Bloque Logística (MSP 008)
    formaLlegadaId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'forma_llegada_id'
    },
    fuenteInformacionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'fuente_informacion_id'
    }
}, {
    tableName: 'admisiones_emergencia',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    hooks: {
        beforeCreate: (admission) => normalizeStrings(admission),
        beforeUpdate: (admission) => normalizeStrings(admission)
    }
});

module.exports = EmergencyAdmission;
