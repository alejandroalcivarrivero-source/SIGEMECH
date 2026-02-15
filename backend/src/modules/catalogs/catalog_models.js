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
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'nombre',
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
    // --- Modelos Auditados y Corregidos ---
    
    // Modelos sin 'activo' y sin timestamps
    const Sexo = defineModel(sequelize, 'Sexo', 'cat_sexos', {}, { timestamps: false });
    const Genero = defineModel(sequelize, 'Genero', 'cat_generos', {}, { timestamps: false });
    const TipoIdentificacion = defineModel(sequelize, 'TipoIdentificacion', 'cat_tipos_identificacion', {}, { timestamps: false });
    const TipoDocumento = defineModel(sequelize, 'TipoDocumento', 'cat_tipos_documento', {}, { timestamps: false });
    const CondicionLlegada = defineModel(sequelize, 'CondicionLlegada', 'cat_condiciones_llegada', {}, { timestamps: false });
    const EstablecimientoSalud = defineModel(sequelize, 'EstablecimientoSalud', 'cat_establecimientos_salud', {}, { timestamps: false });
    const Etnia = defineModel(sequelize, 'Etnia', 'cat_etnias', {}, { timestamps: false });
    const Instruccion = defineModel(sequelize, 'Instruccion', 'cat_instruccion', {}, { timestamps: false });

    // Modelos con timestamps y 'activo'
    const Ocupacion = defineModel(sequelize, 'Ocupacion', 'cat_ocupaciones');
    const EstadoCivil = defineModel(sequelize, 'EstadoCivil', 'cat_estados_civiles');
    const Parentesco = defineModel(sequelize, 'Parentesco', 'cat_parentescos');
    const FormaLlegada = defineModel(sequelize, 'FormaLlegada', 'cat_formas_llegada');
    const FuenteInformacion = defineModel(sequelize, 'FuenteInformacion', 'cat_fuentes_informacion');
    const Pais = defineModel(sequelize, 'Pais', 'cat_paises', { codigo_iso: { type: DataTypes.STRING(3), allowNull: true, field: 'codigo_iso' }});
    const Nacionalidad = defineModel(sequelize, 'Nacionalidad', 'cat_nacionalidades', { gentilicio: { type: DataTypes.STRING(100), field: 'gentilicio' }, pais_id: { type: DataTypes.INTEGER, references: { model: 'Pais', key: 'id' }, field: 'pais_id' }});
    const SeguroSalud = defineModel(sequelize, 'SeguroSalud', 'cat_seguros_salud', {}, { timestamps: false });
    
    return {
        SeguroSalud,
        Sexo,
        Genero,
        TipoIdentificacion,
        TipoDocumento,
        CondicionLlegada,
        EstablecimientoSalud,
        Etnia,
        Instruccion,
        Ocupacion,
        EstadoCivil,
        Parentesco,
        FormaLlegada,
        FuenteInformacion,
        Pais,
        Nacionalidad
    };
};
