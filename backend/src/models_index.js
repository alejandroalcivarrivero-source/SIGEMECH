function inicializarModelos(sequelize) {
    const Usuario = require('./modules/users/user_model')(sequelize);
    const Paciente = require('./modules/pacientes/paciente_model')(sequelize);
    const Parto = require('./modules/admissions/parto_model')(sequelize);
    const Representante = require('./modules/pacientes/representante_model')(sequelize);
    const Admision = require('./modules/admissions/admission_model')(sequelize);
    
    // Modelos de localización
    const { Pais, Provincia, Canton, Parroquia } = require('./modules/catalogs/location_models')(sequelize);
    
    // Todos los modelos de catálogo
    const catalogModels = require('./modules/catalogs/catalog_models')(sequelize);
    const {
        TipoIdentificacion, Nacionalidad, Etnia, AutoidentificacionEtnica,
        EstadoCivil, NivelInstruccion, Ocupacion, Sexo, Genero,
        Parentesco, FormaLlegada, FuenteInformacion, TipoDocumento,
        CondicionLlegada, EstablecimientoSalud, Pueblo
    } = catalogModels;

    // Asociaciones
    Paciente.hasOne(Representante, { foreignKey: 'paciente_id', as: 'representante' });
    Representante.belongsTo(Paciente, { foreignKey: 'paciente_id' });
    
    Paciente.hasMany(Admision, { foreignKey: 'paciente_id', as: 'admisiones' });
    Admision.belongsTo(Paciente, { foreignKey: 'paciente_id' });

    Admision.hasOne(Parto, { foreignKey: 'admision_id', as: 'parto' });
    Parto.belongsTo(Admision, { foreignKey: 'admision_id' });
    
    return {
        Usuario,
        Paciente,
        Parto,
        Representante,
        Admision,
        Pais,
        Provincia,
        Canton,
        Parroquia,
        TipoIdentificacion,
        Nacionalidad,
        Etnia,
        AutoidentificacionEtnica,
        EstadoCivil,
        NivelInstruccion,
        Ocupacion,
        Sexo,
        Genero,
        Parentesco,
        FormaLlegada,
        FuenteInformacion,
        TipoDocumento,
        CondicionLlegada,
        EstablecimientoSalud,
        Pueblo
    };
}

module.exports = { inicializarModelos };
