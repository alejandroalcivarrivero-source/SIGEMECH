const { User, Paciente, EmergencyAdmission } = require('../../models_index');
const { Op } = require('sequelize');

/**
 * Buscar paciente por cédula (utilizando Sequelize y nuevos mapeos)
 */
const buscarPacientePorCedula = async (req, res) => {
    try {
        const { cedula } = req.params;
        
        // Guard Clause: Evitar consultas para códigos de pacientes "No Identificados" (usualmente 17 caracteres)
        if (cedula && cedula.length > 10) {
            return res.status(200).json(null);
        }

        console.log('Buscando ID:', cedula);
        
        // Uso del alias 'username' mapeado a 'cedula'
        const paciente = await Paciente.findOne({
            where: { documentNumber: cedula },
            include: [
                { association: 'parroquia' },
                { association: 'etnia' },
                {
                    association: 'etnia',
                    include: [
                        {
                            association: 'nacionalidadesEtnicas',
                            include: [{ association: 'pueblosEtnicos' }]
                        }
                    ]
                },
                { association: 'sexo' },
                { association: 'estadoCivil' }
            ]
        });
        
        if (!paciente) {
            return res.status(200).json({ found: false, message: 'Paciente no encontrado' });
        }

        // Buscar última admisión abierta usando Sequelize
        const admisionAbierta = await EmergencyAdmission.findOne({
            where: { 
                pacienteId: paciente.id,
                // Aquí podrías filtrar por un estado específico si existe en el catálogo de estados
            },
            include: [{ association: 'triaje' }, { association: 'estadoProceso' }],
            order: [['admissionDate', 'DESC']]
        });

        res.json({
            found: true,
            paciente,
            admisionAbierta
        });

    } catch (error) {
        console.error('Error al buscar paciente:', error);
        res.status(200).json({ found: false, message: 'Error al procesar la búsqueda' });
    }
};

/**
 * Registro de Admisión simplificado usando Sequelize
 */
const registrarAdmision = async (req, res) => {
    try {
        const { datosPaciente } = req.body;
        const usuario_id = req.user ? req.user.id : null;

        if (!usuario_id) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // 1. Upsert del Paciente
        let [paciente, created] = await Paciente.findOrCreate({
            where: { documentNumber: datosPaciente.documentNumber || datosPaciente.cedula },
            defaults: {
                firstName1: datosPaciente.firstName1,
                lastName1: datosPaciente.lastName1,
                birthDate: datosPaciente.birthDate || datosPaciente.fecha_nacimiento,
                address: datosPaciente.address || datosPaciente.direccion,
                phone: datosPaciente.phone || datosPaciente.telefono,
                email: datosPaciente.email,
                ethnicityId: datosPaciente.autoidentificacionEtnica || datosPaciente.ethnicityId,
                ethnicNationalityId: datosPaciente.nacionalidadEtnica || datosPaciente.ethnicNationalityId,
                ethnicGroupId: datosPaciente.puebloEtnico || datosPaciente.ethnicGroupId,
                tipoIdentificacionId: datosPaciente.tipoIdentificacionId || datosPaciente.documentTypeId,
                estadoCivilId: datosPaciente.estadoCivilId || datosPaciente.civilStatusId,
                nacionalidadId: datosPaciente.nacionalidadId || datosPaciente.nationalityId,
                instruccionId: datosPaciente.instruccionId || datosPaciente.instructionId,
                createdBy: usuario_id
            }
        });

        if (!created) {
            await paciente.update({
                firstName1: datosPaciente.firstName1,
                lastName1: datosPaciente.lastName1,
                address: datosPaciente.address,
                phone: datosPaciente.phone,
                email: datosPaciente.email,
                ethnicityId: datosPaciente.autoidentificacionEtnica || datosPaciente.ethnicityId,
                ethnicNationalityId: datosPaciente.nacionalidadEtnica || datosPaciente.ethnicNationalityId,
                ethnicGroupId: datosPaciente.puebloEtnico || datosPaciente.ethnicGroupId,
                tipoIdentificacionId: datosPaciente.tipoIdentificacionId || datosPaciente.documentTypeId,
                estadoCivilId: datosPaciente.estadoCivilId || datosPaciente.civilStatusId,
                nacionalidadId: datosPaciente.nacionalidadId || datosPaciente.nationalityId,
                instruccionId: datosPaciente.instruccionId || datosPaciente.instructionId
            });
        }

        // 2. Crear Admisión
        const nuevaAdmision = await EmergencyAdmission.create({
            pacienteId: paciente.id,
            admissionDate: new Date(),
            admittedBy: usuario_id,
            reasonForConsultation: 'Pendiente de triaje'
        });

        res.status(201).json({
            message: 'Admisión registrada exitosamente',
            id_paciente: paciente.id,
            id_emergencia: nuevaAdmision.id
        });

    } catch (error) {
        console.error('Error registrando admisión:', error);
        res.status(500).json({ message: 'Error al registrar admisión con Sequelize' });
    }
};

/**
 * Placeholder para registrarPaciente
 */
const registrarPaciente = async (req, res) => {
    res.status(501).json({ message: 'Función registrarPaciente no implementada aún' });
};

/**
 * Placeholder para registrarTriage
 */
const registrarTriage = async (req, res) => {
    res.status(501).json({ message: 'Función registrarTriage no implementada aún' });
};

module.exports = {
    buscarPacientePorCedula,
    registrarAdmision,
    registrarPaciente,
    registrarTriage
};
