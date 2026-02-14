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
                model: 'pac_pacientes',
                key: 'id'
            }
        },
        // ... otros campos
    }, {
        sequelize,
        modelName: 'Representante',
        tableName: 'pac_representantes',
        timestamps: true,
        underscored: true,
        freezeTableName: true
    });

    return Representante;
};
