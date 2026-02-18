const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
    class Admision extends Model {}

    Admision.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        paciente_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        registrado_por: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fecha_llegada: {
            type: DataTypes.DATE,
            allowNull: false
        },
        fecha_admision: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        motivo_consulta: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        estado: {
            type: DataTypes.STRING(20),
            defaultValue: 'Admisión'
        },
        enfermedad_actual: {
            type: DataTypes.TEXT
        },
        forma_llegada_id: {
            type: DataTypes.INTEGER
        },
        fuente_informacion_id: {
            type: DataTypes.INTEGER
        },
        condicion_llegada_id: {
            type: DataTypes.INTEGER
        },
        unidad_transporte: {
            type: DataTypes.STRING(100)
        }
    }, {
        sequelize,
        modelName: 'Admision',
        tableName: 'admisiones_emergencia',
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion',
        underscored: true,
        freezeTableName: true
    });

    return Admision;
};
