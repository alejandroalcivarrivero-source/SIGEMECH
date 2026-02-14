const User = require('./modules/users/user_model');
const Paciente = require('./modules/pacientes/paciente_model');
const { Province, Canton, Parish } = require('./modules/catalogs/location_models');
const Representante = require('./modules/pacientes/representante_model');
const { Parto } = require('./modules/admissions/parto_model');
// Forzar la carga de catalog_models para asegurar que todos los modelos se registren en sequelize
require('./modules/catalogs/catalog_models');
const CatalogModels = require('./modules/catalogs/catalog_models');
const EmergencyAdmission = require('./modules/admissions/admission_model');

// Desestructuración segura con valores por defecto para evitar ReferenceError
const {
    Etnia = null,
    NacionalidadEtnica = null,
    Pueblo = null,
    Instruccion = null,
    SeguroSalud = null,
    Nacionalidad = null,
    Triaje = null,
    EstadoProceso = null,
    FormularioLlegada = null,
    Sexo = null,
    EstadoCivil = null,
    Genero = null,
    Parentesco = null,
    FuenteInformacion = null,
    TipoDocumento = null,
    CondicionLlegada = null,
    NivelEducacion = null,
    TipoIdentificacion = null
} = CatalogModels;

/**
 * REFACTORIZACIÓN INTEGRAL DE ASOCIACIONES
 * Se utilizan alias únicos y descriptivos.
 * Se vinculan las claves foráneas explícitas definidas en los modelos.
 */

// --- GEOGRAFÍA ---
Province.hasMany(Canton, { foreignKey: 'provinceId', as: 'cantones' });
Canton.belongsTo(Province, { foreignKey: 'provinceId', as: 'provincia' });

Canton.hasMany(Parish, { foreignKey: 'cantonId', as: 'parroquias' });
Parish.belongsTo(Canton, { foreignKey: 'cantonId', as: 'canton' });

// --- PACIENTE ---
// Ubicación
Parish.hasMany(Paciente, { foreignKey: 'parishId', as: 'pacientesEnParroquia' });
Paciente.belongsTo(Parish, { foreignKey: 'parishId', as: 'parroquia' });

// --- JERARQUÍA ÉTNICA (NORMALIZADA) ---
if (Etnia) {
    Etnia.hasMany(Paciente, { foreignKey: 'ethnicityId', as: 'pacientesPorEtnia' });
    Paciente.belongsTo(Etnia, { foreignKey: 'ethnicityId', as: 'etnia' });

    if (NacionalidadEtnica) {
        Etnia.hasMany(NacionalidadEtnica, {
            foreignKey: 'etnia_id',
            as: 'nacionalidadesEtnicas'
        });
        NacionalidadEtnica.belongsTo(Etnia, {
            foreignKey: 'etnia_id',
            as: 'etnia'
        });
    }
}

if (NacionalidadEtnica && Pueblo) {
    NacionalidadEtnica.hasMany(Pueblo, {
        foreignKey: 'nacionalidad_id',
        as: 'pueblosEtnicos'
    });
    Pueblo.belongsTo(NacionalidadEtnica, {
        foreignKey: 'nacionalidad_id',
        as: 'nacionalidadEtnica'
    });
}

if (Instruccion) {
    Instruccion.hasMany(Paciente, { foreignKey: 'instruccionId', as: 'pacientesPorInstruccion' });
    Paciente.belongsTo(Instruccion, { foreignKey: 'instruccionId', as: 'instruccion' });
}

if (SeguroSalud) {
    SeguroSalud.hasMany(Paciente, { foreignKey: 'healthInsuranceId', as: 'pacientesPorSeguro' });
    Paciente.belongsTo(SeguroSalud, { foreignKey: 'healthInsuranceId', as: 'seguroSalud' });
}

if (Nacionalidad) {
    Nacionalidad.hasMany(Paciente, { foreignKey: 'nacionalidadId', as: 'pacientesPorNacionalidad' });
    Paciente.belongsTo(Nacionalidad, { foreignKey: 'nacionalidadId', as: 'nacionalidad' });
}

if (Sexo) {
    Sexo.hasMany(Paciente, { foreignKey: 'genderId', as: 'pacientesPorSexo' });
    Paciente.belongsTo(Sexo, { foreignKey: 'genderId', as: 'sexo' });
}

if (EstadoCivil) {
    EstadoCivil.hasMany(Paciente, { foreignKey: 'estadoCivilId', as: 'pacientesPorEstadoCivil' });
    Paciente.belongsTo(EstadoCivil, { foreignKey: 'estadoCivilId', as: 'estadoCivil' });
}

if (TipoIdentificacion) {
    TipoIdentificacion.hasMany(Paciente, { foreignKey: 'tipoIdentificacionId', as: 'pacientesPorTipoIdentificacion' });
    Paciente.belongsTo(TipoIdentificacion, { foreignKey: 'tipoIdentificacionId', as: 'tipoIdentificacion' });
}

// Auditoría Paciente
User.hasMany(Paciente, { foreignKey: 'createdBy', as: 'pacientesCreados' });
Paciente.belongsTo(User, { foreignKey: 'createdBy', as: 'creador' });

// --- REPRESENTANTE LEGAL ---
Paciente.hasOne(Representante, { foreignKey: 'pacienteId', as: 'representante' });
Representante.belongsTo(Paciente, { foreignKey: 'pacienteId', as: 'paciente' });

if (TipoIdentificacion) {
    TipoIdentificacion.hasMany(Representante, { foreignKey: 'tipoIdentificacionId', as: 'representantesPorTipo' });
    Representante.belongsTo(TipoIdentificacion, { foreignKey: 'tipoIdentificacionId', as: 'tipoIdentificacion' });
}

if (Parentesco) {
    Parentesco.hasMany(Representante, { foreignKey: 'parentescoId', as: 'representantesPorParentesco' });
    Representante.belongsTo(Parentesco, { foreignKey: 'parentescoId', as: 'parentesco' });
}

// --- ADMISIONES DE EMERGENCIA (FORMULARIO 008) ---
Paciente.hasMany(EmergencyAdmission, { foreignKey: 'pacienteId', as: 'admisiones' });
EmergencyAdmission.belongsTo(Paciente, { foreignKey: 'pacienteId', as: 'paciente' });

// Catálogos de Admisión
if (Triaje) {
    Triaje.hasMany(EmergencyAdmission, { foreignKey: 'triageId', as: 'admisionesPorTriaje' });
    EmergencyAdmission.belongsTo(Triaje, { foreignKey: 'triageId', as: 'triaje' });
}

if (EstadoProceso) {
    EstadoProceso.hasMany(EmergencyAdmission, { foreignKey: 'statusId', as: 'admisionesPorEstado' });
    EmergencyAdmission.belongsTo(EstadoProceso, { foreignKey: 'statusId', as: 'estadoProceso' });
}

if (FormularioLlegada) {
    FormularioLlegada.hasMany(EmergencyAdmission, { foreignKey: 'arrivalFormId', as: 'admisionesPorFormaLlegada' });
    EmergencyAdmission.belongsTo(FormularioLlegada, { foreignKey: 'arrivalFormId', as: 'formaLlegada' });
}

if (Parentesco) {
    Parentesco.hasMany(EmergencyAdmission, { foreignKey: 'companionRelationshipId', as: 'admisionesPorParentesco' });
    EmergencyAdmission.belongsTo(Parentesco, { foreignKey: 'companionRelationshipId', as: 'parentescoAcompanante' });
}

if (FuenteInformacion) {
    FuenteInformacion.hasMany(EmergencyAdmission, { foreignKey: 'informationSourceId', as: 'admisionesPorFuente' });
    EmergencyAdmission.belongsTo(FuenteInformacion, { foreignKey: 'informationSourceId', as: 'fuenteInformacion' });
}

// Auditoría Admisión
User.hasMany(EmergencyAdmission, { foreignKey: 'admittedBy', as: 'admisionesRegistradas' });
EmergencyAdmission.belongsTo(User, { foreignKey: 'admittedBy', as: 'admisionista' });

User.hasMany(EmergencyAdmission, { foreignKey: 'attendingPhysicianId', as: 'pacientesAsignados' });
EmergencyAdmission.belongsTo(User, { foreignKey: 'attendingPhysicianId', as: 'medicoTratante' });

module.exports = {
    User,
    Paciente,
    Representante,
    Province,
    Canton,
    Parish,
    Etnia,
    NacionalidadEtnica,
    Pueblo,
    Instruccion,
    SeguroSalud,
    Nacionalidad,
    Triaje,
    EstadoProceso,
    FormularioLlegada,
    Sexo,
    EstadoCivil,
    Genero,
    Parentesco,
    FuenteInformacion,
    TipoDocumento,
    CondicionLlegada,
    NivelEducacion,
    TipoIdentificacion,
    EmergencyAdmission,
    Parto
};
