const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const { normalizeStrings } = require('../../config/model_helper');

/**
 * Modelo para el Formulario 008 (Emergencia) - Admisión y Triaje Inicial
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
    admissionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'admission_date'
    },
    reasonForConsultation: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'reason_for_consultation'
    },
    condicionLlegadaId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'arrival_condition_id'
    },
    assignedHealthUnit: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'unidad_salud_adscripcion'
    },
    personalHistory: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'personal_history'
    },
    familyHistory: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'family_history'
    },
    currentIllness: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'current_illness'
    },
    temperature: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true,
        field: 'temperature'
    },
    bloodPressureSystolic: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'blood_pressure_systolic'
    },
    bloodPressureDiastolic: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'blood_pressure_diastolic'
    },
    heartRate: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'heart_rate'
    },
    respiratoryRate: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'respiratory_rate'
    },
    oxygenSaturation: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'oxygen_saturation'
    },
    weight: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'weight'
    },
    height: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: true,
        field: 'height'
    },
    physicalExam: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'physical_exam'
    },
    triageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'triage_id'
    },
    admittedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'admitted_by'
    },
    attendingPhysicianId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'attending_physician_id'
    },
    statusId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'status_id'
    },
    // Bloque Acompañante
    companionName: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'companion_name'
    },
    companionRelationshipId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'companion_relationship_id'
    },
    companionAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'companion_address'
    },
    companionPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'companion_phone'
    },
    // Bloque Logística (MSP 008)
    arrivalModeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'arrival_mode_id'
    },
    informationSourceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'information_source_id'
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
