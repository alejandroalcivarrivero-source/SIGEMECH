function inicializarModelos(sequelize) {
    const Usuario = require('./modules/users/user_model')(sequelize);
    const Paciente = require('./modules/pacientes/paciente_model')(sequelize);
    const Parto = require('./modules/admissions/parto_model')(sequelize);
    const Representante = require('./modules/pacientes/representante_model')(sequelize);
    const Admision = require('./modules/admissions/admission_model')(sequelize);
    // Asumo que los modelos de catalogo y localizacion ahora se exportan como funciones que reciben sequelize
    const { Pais, Provincia, Canton, Parroquia } = require('./modules/catalogs/location_models')(sequelize);
    const { TipoIdentificacion, Ocupacion, EstadoCivil, Parentesco, FormaLlegada, CondicionLlegada, EstablecimientoSalud } = require('./modules/catalogs/catalog_models')(sequelize);
    const { Nacionalidad, Instruccion, Etnia, Sexo, Genero, FuenteInformacion } = require('./modules/catalogs/catalog_models')(sequelize);

    // Asociaciones
        
        // Asociaciones de Paciente
        Paciente.belongsTo(TipoIdentificacion, { foreignKey: 'id_tipo_identificacion' });
        Paciente.belongsTo(Pais, { foreignKey: 'id_pais_nacimiento' });
        Paciente.belongsTo(Provincia, { foreignKey: 'id_provincia_nacimiento' });
        Paciente.belongsTo(Canton, { foreignKey: 'id_canton_nacimiento' });
        Paciente.belongsTo(Parroquia, { foreignKey: 'id_parroquia_nacimiento' });
        Paciente.belongsTo(Sexo, { foreignKey: 'id_sexo' });
        Paciente.belongsTo(Genero, { foreignKey: 'id_genero' });
            Paciente.belongsTo(Etnia, { foreignKey: 'id_etnia' });
        Paciente.belongsTo(Nacionalidad, { foreignKey: 'id_nacionalidad' });
        Paciente.belongsTo(Instruccion, { foreignKey: 'id_instruccion' });
        Paciente.belongsTo(Ocupacion, { foreignKey: 'id_ocupacion' });
    
    
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
                Genero,
        Instruccion,
        Ocupacion,
        FuenteInformacion,
        Sexo,
        EstadoCivil,
        Parentesco,
        FormaLlegada,
        CondicionLlegada,
        EstablecimientoSalud
    };
}

module.exports = { inicializarModelos };
