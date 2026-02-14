const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const { normalizeStrings } = require('../../config/model_helper');
const bcrypt = require('bcryptjs');

/**
 * Modelo de Usuario sincronizado con la estructura real de la tabla 'usuarios'
 * Basado en auditoría de base de datos física:
 * Columnas: id, cedula, nombres, apellidos, correo, password_hash, mfa_secret, estado
 */
const User = sequelize.define('usuarios', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
    },
    username: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
        field: 'cedula'
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash'
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'correo',
        validate: {
            isEmail: true
        }
    },
    firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'nombres'
    },
    lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'apellidos'
    },
    status: {
        type: DataTypes.ENUM('activo', 'inactivo', 'suspendido'),
        defaultValue: 'activo',
        field: 'estado'
    },
    isActive: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.status === 'activo';
        }
    }
}, {
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    hooks: {
        beforeCreate: (user) => {
            normalizeStrings(user);
            if (user.password && !user.password.startsWith('$2a$')) {
                user.password = bcrypt.hashSync(user.password, 10);
            }
        },
        beforeUpdate: (user) => {
            normalizeStrings(user);
            if (user.changed('password') && !user.password.startsWith('$2a$')) {
                user.password = bcrypt.hashSync(user.password, 10);
            }
        }
    }
});

module.exports = User;
