const { DataTypes, Model } = require('sequelize');

const defineModel = (sequelize, modelName, tableName, columns, options = {}) => {
    class GenericModel extends Model { }
    
    const baseColumns = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id',
        },
        ...columns
    };

    const hasTimestamps = options.timestamps !== false;

    if (hasTimestamps) {
        baseColumns.activo = {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'activo'
        };
    }

    const modelOptions = {
        sequelize,
        modelName,
        tableName,
        timestamps: hasTimestamps,
        ...(hasTimestamps && { 
            createdAt: 'fecha_creacion',
            updatedAt: 'fecha_actualizacion' 
        }),
        freezeTableName: true,
        ...options
    };

    GenericModel.init(baseColumns, modelOptions);
    return GenericModel;
};


module.exports = (sequelize) => {
    const Pais = defineModel(sequelize, 'Pais', 'cat_paises', {
        nombre: { type: DataTypes.STRING(100), allowNull: false, field: 'nombre' },
        codigo_iso: { type: DataTypes.STRING(2), allowNull: true, field: 'codigo_iso' },
    }, { timestamps: false });

    const Provincia = defineModel(sequelize, 'Provincia', 'cat_provincias', {
        nombre: { type: DataTypes.STRING(100), allowNull: false, field: 'nombre' },
        codigo_inec: { type: DataTypes.STRING(2), allowNull: false, field: 'codigo_inec' }
    }, { timestamps: true });

    const Canton = defineModel(sequelize, 'Canton', 'cat_cantones', {
        nombre: { type: DataTypes.STRING(100), allowNull: false, field: 'nombre' },
        provincia_id: { type: DataTypes.INTEGER, references: { model: 'Provincia', key: 'id' }, field: 'provincia_id' }
    }, { timestamps: true });

    const Parroquia = defineModel(sequelize, 'Parroquia', 'cat_parroquias', {
        nombre: { type: DataTypes.STRING(100), allowNull: false, field: 'nombre' },
        canton_id: { type: DataTypes.INTEGER, references: { model: 'Canton', key: 'id' }, field: 'canton_id' },
        tipo: { type: DataTypes.STRING(50), allowNull: true, field: 'tipo' }
    }, { timestamps: true });

    return { Pais, Provincia, Canton, Parroquia };
};
