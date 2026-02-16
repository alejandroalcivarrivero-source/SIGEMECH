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
    // Se elimina cat_tipos_documento y se usa el alias para compatibilidad si es necesario,
    // pero el controlador se encargará de redirigir a TipoIdentificacion.
    const CondicionLlegada = defineModel(sequelize, 'CondicionLlegada', 'cat_condiciones_llegada', {}, { timestamps: false });
    const EstablecimientoSalud = defineModel(sequelize, 'EstablecimientoSalud', 'cat_establecimientos_salud', {
        codigo_unico: { type: DataTypes.STRING(20), field: 'codigo_unico' },
        tiene_quirofano: { type: DataTypes.INTEGER, field: 'tiene_quirofano' },
        tiene_sala_parto: { type: DataTypes.INTEGER, field: 'tiene_sala_parto' },
        tiene_ambulancia: { type: DataTypes.INTEGER, field: 'tiene_ambulancia' },
        tipo_gestion: { type: DataTypes.STRING(100), field: 'tipo_gestion' },
        id_canton: { type: DataTypes.INTEGER, field: 'id_canton' },
        id_nivel: { type: DataTypes.INTEGER, field: 'id_nivel' }
    }, { timestamps: false });
    const Etnia = defineModel(sequelize, 'Etnia', 'cat_etnias', {}, { timestamps: false });
    const Instruccion = defineModel(sequelize, 'Instruccion', 'cat_instruccion', {}, { timestamps: false });

    // Modelos con timestamps y 'activo'
    const Ocupacion = defineModel(sequelize, 'Ocupacion', 'cat_ocupaciones');
    const EstadoCivil = defineModel(sequelize, 'EstadoCivil', 'cat_estados_civiles');
    const Parentesco = defineModel(sequelize, 'Parentesco', 'cat_parentescos');
    const FormaLlegada = defineModel(sequelize, 'FormaLlegada', 'cat_formas_llegada');
    const FuenteInformacion = defineModel(sequelize, 'FuenteInformacion', 'cat_fuentes_informacion');
    const Pais = defineModel(sequelize, 'Pais', 'cat_paises', { codigo_iso: { type: DataTypes.STRING(3), allowNull: true, field: 'codigo_iso' }});
    
    // Nacionalidad para Identificación (Gentilicios de países)
    const Nacionalidad = defineModel(sequelize, 'Nacionalidad', 'cat_nacionalidades', {
        gentilicio: { type: DataTypes.STRING(100), field: 'gentilicio' },
        pais_id: { type: DataTypes.INTEGER, references: { model: 'Pais', key: 'id' }, field: 'pais_id' }
    });

    // Nueva tabla para Nacionalidades Étnicas (Kichwa, Shuar, etc.)
    const NacionalidadEtnica = defineModel(sequelize, 'NacionalidadEtnica', 'cat_etnias_nacionalidades', {
        etnia_id: { type: DataTypes.INTEGER, references: { model: 'Etnia', key: 'id' }, field: 'etnia_id' }
    });

    const Pueblo = defineModel(sequelize, 'Pueblo', 'cat_pueblos', {
        nacionalidad_id: { type: DataTypes.INTEGER, references: { model: 'NacionalidadEtnica', key: 'id' }, field: 'nacionalidad_id' }
    }, { timestamps: false });

    const SeguroSalud = defineModel(sequelize, 'SeguroSalud', 'cat_seguros_salud', {}, { timestamps: false });

    // Estado del Nivel de Instrucción (Terminado, En curso, etc.)
    const EstadoNivelInstruccion = defineModel(sequelize, 'EstadoNivelInstruccion', 'cat_estado_nivel_instruccion', {
        esta_activo: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'esta_activo' }
    }, { timestamps: false });
    
    const TipoEmpresa = defineModel(sequelize, 'TipoEmpresa', 'cat_tipos_empresa', {
        esta_activo: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'esta_activo' }
    }, { timestamps: false });

    const TipoDiscapacidad = defineModel(sequelize, 'TipoDiscapacidad', 'cat_tipos_discapacidad', {}, { timestamps: false });

    return {
        TipoEmpresa,
        SeguroSalud,
        Pueblo,
        Sexo,
        Genero,
        TipoIdentificacion,
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
        Nacionalidad,
        NacionalidadEtnica,
        EstadoNivelInstruccion,
        TipoDiscapacidad
    };
};
