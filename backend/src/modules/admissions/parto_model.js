const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
    class Parto extends Model {}

    Parto.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        admision_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'admision_id',
            references: {
                model: 'admisiones_emergencia',
                key: 'id'
            }
        },
        id_admision_neonato: {
            type: DataTypes.INTEGER,
            allowNull: true, // Puede ser nulo si no hay neonato o se registra después
            field: 'id_admision_neonato',
            references: {
                model: 'admisiones_emergencia',
                key: 'id'
            }
        },
        fecha_hora_parto: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'fecha_hora_parto'
        },
        // ... (resto de los campos del modelo sin cambios)
        responsable_parto_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'responsable_parto_id'
        },
    }, {
        sequelize,
        modelName: 'Parto',
        tableName: 'adm_partos',
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion',
        underscored: true,
        freezeTableName: true
    });

    return Parto;
};
