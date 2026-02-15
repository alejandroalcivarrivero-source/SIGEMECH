const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
    class Representante extends Model {}

    Representante.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        paciente_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'paciente_id',
            references: {
                model: 'pacientes',
                key: 'id'
            }
        },
        // ... otros campos
    }, {
        sequelize,
        modelName: 'Representante',
        tableName: 'paciente_representantes',
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion',
        underscored: true,
        freezeTableName: true
    });

    return Representante;
};
