const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
    class Pais extends Model {}
    Pais.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false }
    }, { sequelize, modelName: 'Pais', tableName: 'cat_paises', timestamps: false });
    
    class Provincia extends Model {}
    Provincia.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false },
        codigo_inec: { type: DataTypes.STRING(10), field: 'codigo_inec' } // Según imagen
    }, { sequelize, modelName: 'Provincia', tableName: 'cat_provincias', timestamps: false });

    class Canton extends Model {}
    Canton.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        provinciaId: { type: DataTypes.INTEGER, field: 'provincia_id' },
        nombre: { type: DataTypes.STRING(100), allowNull: false }
    }, { sequelize, modelName: 'Canton', tableName: 'cat_cantones', timestamps: false });

    class Parroquia extends Model {}
    Parroquia.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        cantonId: { type: DataTypes.INTEGER, field: 'canton_id' },
        nombre: { type: DataTypes.STRING(100), allowNull: false }
    }, { sequelize, modelName: 'Parroquia', tableName: 'cat_parroquias', timestamps: false });

    return { Pais, Provincia, Canton, Parroquia };
};
