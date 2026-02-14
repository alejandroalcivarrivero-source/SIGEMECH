const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
    class Admision extends Model {}

    Admision.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        // ... otros campos
    }, {
        sequelize,
        modelName: 'Admision',
        tableName: 'adm_admisiones',
        timestamps: true,
        underscored: true,
        freezeTableName: true
    });

    return Admision;
};
