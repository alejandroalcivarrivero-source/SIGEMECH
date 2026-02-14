const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
    class TipoIdentificacion extends Model {}
    TipoIdentificacion.init({/*...*/}, { sequelize, modelName: 'TipoIdentificacion', tableName: 'cat_tipos_identificacion' });

    // ... y así para los demás modelos de catálogo ...

    class Ocupacion extends Model {}
    Ocupacion.init({/*...*/}, { sequelize, modelName: 'Ocupacion', tableName: 'cat_ocupaciones' });


    return {
        TipoIdentificacion,
        // ...
        Ocupacion
    };
};
