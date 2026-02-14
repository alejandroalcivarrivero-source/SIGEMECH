const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
    class Pais extends Model {}
    Pais.init({ /*...*/ }, { sequelize, modelName: 'Pais', tableName: 'cat_paises' });
    
    class Provincia extends Model {}
    Provincia.init({ /*...*/ }, { sequelize, modelName: 'Provincia', tableName: 'cat_provincias' });

    class Canton extends Model {}
    Canton.init({ /*...*/ }, { sequelize, modelName: 'Canton', tableName: 'cat_cantones' });

    class Parroquia extends Model {}
    Parroquia.init({ /*...*/ }, { sequelize, modelName: 'Parroquia', tableName: 'cat_parroquias' });

    return { Pais, Provincia, Canton, Parroquia };
};
