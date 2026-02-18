const { DataTypes, Model } = require('sequelize');
const { normalizeStrings } = require('../../config/model_helper');

module.exports = (sequelize) => {
    class Paciente extends Model {}

    Paciente.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_tipo_identificacion: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        numero_identificacion: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            field: 'numero_documento' // Sincronización con MariaDB real
        },
        primer_nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        segundo_nombre: {
            type: DataTypes.STRING(100)
        },
        primer_apellido: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        segundo_apellido: {
            type: DataTypes.STRING(100)
        },
        fecha_nacimiento: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        id_sexo: {
            type: DataTypes.INTEGER
        },
        id_estado_civil: {
            type: DataTypes.INTEGER
        },
        id_nacionalidad: {
            type: DataTypes.INTEGER
        },
        id_parroquia: {
            type: DataTypes.INTEGER
        },
        telefono: {
            type: DataTypes.STRING(20)
        },
        email: {
            type: DataTypes.STRING(150)
        },
        id_etnia: {
            type: DataTypes.INTEGER
        },
        id_instruccion: {
            type: DataTypes.INTEGER
        },
        id_seguro_salud: {
            type: DataTypes.INTEGER
        },
        esta_activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Paciente',
        tableName: 'pacientes',
        timestamps: true,
        createdAt: 'fecha_creacion', // Sincronización con MariaDB
        updatedAt: 'fecha_actualizacion',
        underscored: true,
        freezeTableName: true,
        hooks: {
            beforeValidate: (paciente) => {
                normalizeStrings(paciente, ['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido']);
            }
        }
    });

    return Paciente;
};
