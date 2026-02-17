function inicializarModelos(sequelize) {
    const Usuario = require('./modules/users/user_model')(sequelize);
    const Paciente = require('./modules/pacientes/paciente_model')(sequelize);
    const Parto = require('./modules/admissions/parto_model')(sequelize);
    const Representante = require('./modules/pacientes/representante_model')(sequelize);
    const Admision = require('./modules/admissions/admission_model')(sequelize);
    // Modelos de Localización y Catálogos
    const { Pais, Provincia, Canton, Parroquia } = require('./modules/catalogs/location_models')(sequelize);
    const {
        TipoIdentificacion, Ocupacion, EstadoCivil, Parentesco, FormaLlegada,
        CondicionLlegada, EstablecimientoSalud, Pueblo, NacionalidadEtnica,
        Nacionalidad, Instruccion, Etnia, Sexo, Genero, FuenteInformacion
    } = require('./modules/catalogs/catalog_models')(sequelize);

    // Asociaciones
    
    // Asociaciones de Paciente
    Paciente.belongsTo(TipoIdentificacion, { foreignKey: 'id_tipo_identificacion', as: 'tipo_identificacion' });
    // Estas asociaciones no tienen campos correspondientes en la tabla pacientes.
    // Paciente.belongsTo(Pais, { foreignKey: 'id_pais_nacimiento', as: 'pais_nacimiento' });
    // Paciente.belongsTo(Provincia, { foreignKey: 'id_provincia_nacimiento', as: 'provincia_nacimiento' });
    // Paciente.belongsTo(Canton, { foreignKey: 'id_canton_nacimiento', as: 'canton_nacimiento' });
    Paciente.belongsTo(Parroquia, { foreignKey: 'id_parroquia', as: 'parroquia' });
    // Paciente.belongsTo(Parroquia, { foreignKey: 'id_parroquia_residencia', as: 'parroquia_residencia' });
    Paciente.belongsTo(Sexo, { foreignKey: 'id_sexo', as: 'sexo' });
    // Paciente.belongsTo(Genero, { foreignKey: 'id_genero', as: 'genero' });
    Paciente.belongsTo(Etnia, { foreignKey: 'id_etnia', as: 'etnia' });
    Paciente.belongsTo(Nacionalidad, { foreignKey: 'id_nacionalidad', as: 'nacionalidad' });
    Paciente.belongsTo(Instruccion, { foreignKey: 'id_instruccion', as: 'instruccion' });
    Paciente.belongsTo(Ocupacion, { foreignKey: 'id_ocupacion', as: 'datos_ocupacion' });
    Paciente.belongsTo(EstadoCivil, { foreignKey: 'id_estado_civil', as: 'estadoCivil' });
    
    Paciente.hasOne(Representante, { foreignKey: 'paciente_id', as: 'representante' });
    Representante.belongsTo(Paciente, { foreignKey: 'paciente_id' });
    
    Paciente.hasMany(Admision, { foreignKey: 'paciente_id', as: 'admisiones' });
    Admision.belongsTo(Paciente, { foreignKey: 'paciente_id', as: 'paciente' });

    Admision.hasOne(Parto, { foreignKey: 'id_admision', as: 'parto' });
    Parto.belongsTo(Admision, { foreignKey: 'id_admision' });
    
    const db = {
        parto: Parto,
        representante: Representante,
        usuario: Usuario,
        paciente: Paciente,
        admision: Admision,
        pais: Pais,
        provincia: Provincia,
        canton: Canton,
        parroquia: Parroquia,
        tipo_identificacion: TipoIdentificacion,
        nacionalidad: Nacionalidad,
        etnia: Etnia,
        genero: Genero,
        instruccion: Instruccion,
        ocupacion: Ocupacion,
        fuente_informacion: FuenteInformacion,
        sexo: Sexo,
        estado_civil: EstadoCivil,
        parentesco: Parentesco,
        forma_llegada: FormaLlegada,
        condicion_llegada: CondicionLlegada,
        establecimiento_salud: EstablecimientoSalud,
        pueblo: Pueblo,
        nacionalidad_etnica: NacionalidadEtnica
    };

    // Asociar modelos al objeto db para acceso centralizado futuro si es necesario
    Object.keys(db).forEach(nombreModelo => {
        if (db[nombreModelo].associate) {
            db[nombreModelo].associate(db);
        }
    });

    return db;
}

module.exports = { inicializarModelos };
