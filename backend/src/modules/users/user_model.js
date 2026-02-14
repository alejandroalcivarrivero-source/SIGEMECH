const { DataTypes, Model } = require('sequelize');
const { normalizeStrings } = require('../../config/model_helper');

module.exports = (sequelize) => {
    class Usuario extends Model {}

    Usuario.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        cedula: {
                    type: DataTypes.STRING(20),
                    allowNull: false,
                    unique: true,
                    field: 'cedula'
                },
        nombres: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'nombres'
        },
        apellidos: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'apellidos'
        },
        correo: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: true,
            validate: {
                isEmail: true
            },
            field: 'correo'
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'password_hash'
        },
        estado: {
            type: DataTypes.ENUM('activo', 'inactivo', 'pendiente'),
            defaultValue: 'pendiente',
            field: 'estado'
        },
        mfa_secret: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'mfa_secret'
        }
    }, {
        sequelize,
        modelName: 'Usuario',
        tableName: 'usuarios',
        timestamps: true,
        underscored: true,
        freezeTableName: true,
        hooks: {
            beforeValidate: (usuario) => {
                normalizeStrings(usuario, ['nombres', 'apellidos']);
            }
        }
    });

    return Usuario;
};
