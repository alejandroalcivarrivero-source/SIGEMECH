const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
    // 1. Tipo de Identificación
    class TipoIdentificacion extends Model {}
    TipoIdentificacion.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false },
        esta_activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { sequelize, modelName: 'TipoIdentificacion', tableName: 'cat_tipos_identificacion', timestamps: false });

    // 2. Nacionalidad
    class Nacionalidad extends Model {}
    Nacionalidad.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        gentilicio: { type: DataTypes.STRING(100), allowNull: false },
        activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { sequelize, modelName: 'Nacionalidad', tableName: 'cat_nacionalidades', timestamps: false });

    // 3. Etnia
    class Etnia extends Model {}
    Etnia.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false }
    }, { sequelize, modelName: 'Etnia', tableName: 'cat_etnias', timestamps: false });

    // 4. Autoidentificación Étnica (Mapeado a cat_etnias_nacionalidades según imagen)
    class AutoidentificacionEtnica extends Model {}
    AutoidentificacionEtnica.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false },
        etniaId: { type: DataTypes.INTEGER, field: 'etnia_id' }
    }, { sequelize, modelName: 'AutoidentificacionEtnica', tableName: 'cat_etnias_nacionalidades', timestamps: false });

    // 5. Estado Civil
    class EstadoCivil extends Model {}
    EstadoCivil.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false },
        activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { sequelize, modelName: 'EstadoCivil', tableName: 'cat_estados_civiles', timestamps: false });

    // 6. Nivel de Instrucción (Mapeado a cat_estado_nivel_instruccion)
    class NivelInstruccion extends Model {}
    NivelInstruccion.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false },
        esta_activo: { type: DataTypes.BOOLEAN, defaultValue: true },
        fecha_creacion: { type: DataTypes.DATE },
        fecha_actualizacion: { type: DataTypes.DATE }
    }, {
        sequelize,
        modelName: 'NivelInstruccion',
        tableName: 'cat_estado_nivel_instruccion',
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion'
    });

    // 7. Ocupación
    class Ocupacion extends Model {}
    Ocupacion.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false },
        activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { sequelize, modelName: 'Ocupacion', tableName: 'cat_ocupaciones', timestamps: false });

    // 8. Sexo (Mapeado a cat_sexos)
    class Sexo extends Model {}
    Sexo.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.STRING(50), allowNull: false }
    }, {
        sequelize,
        modelName: 'Sexo',
        tableName: 'cat_sexos',
        timestamps: false
    });

    // 9. Parentesco
    class Parentesco extends Model {}
    Parentesco.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false },
        activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { sequelize, modelName: 'Parentesco', tableName: 'cat_parentescos', timestamps: false });

    // 10. Formas de Llegada
    class FormaLlegada extends Model {}
    FormaLlegada.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false },
        activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { sequelize, modelName: 'FormaLlegada', tableName: 'cat_formas_llegada', timestamps: false });

    // 11. Fuentes de Información
    class FuenteInformacion extends Model {}
    FuenteInformacion.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false },
        activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { sequelize, modelName: 'FuenteInformacion', tableName: 'cat_fuentes_informacion', timestamps: false });

    // 12. Condiciones de Llegada
    class CondicionLlegada extends Model {}
    CondicionLlegada.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false },
        esta_activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { sequelize, modelName: 'CondicionLlegada', tableName: 'cat_condiciones_llegada', timestamps: false });

    // 13. Establecimientos de Salud
    class EstablecimientoSalud extends Model {}
    EstablecimientoSalud.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.STRING(255), allowNull: false },
        codigo_unico: { type: DataTypes.STRING(20) },
        esta_activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { sequelize, modelName: 'EstablecimientoSalud', tableName: 'cat_establecimientos_salud', timestamps: false });

    // 14. Pueblos
    class Pueblo extends Model {}
    Pueblo.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false },
        nacionalidadId: { type: DataTypes.INTEGER, field: 'nacionalidad_id' }
    }, { sequelize, modelName: 'Pueblo', tableName: 'cat_pueblos', timestamps: false });

    return {
        TipoIdentificacion,
        Nacionalidad,
        Etnia,
        AutoidentificacionEtnica,
        EstadoCivil,
        NivelInstruccion,
        Ocupacion,
        Sexo,
        Parentesco,
        FormaLlegada,
        FuenteInformacion,
        CondicionLlegada,
        EstablecimientoSalud,
        Pueblo
    };
};
