const { db } = require('../../config/db');
const { Op } = require('sequelize');

/**
 * Buscar paciente por cédula (utilizando Sequelize y nuevos mapeos)
 */
const buscarPacientePorCedula = async (req, res) => {
    const { paciente: Paciente, admision: Admision } = db;
    try {
        const { cedula } = req.params;
        
        // Guard Clause: Evitar consultas para códigos de pacientes "No Identificados" (usualmente 17 caracteres)
        if (cedula && cedula.length > 10) {
            return res.status(200).json({ found: false });
        }

        console.log('Buscando ID:', cedula);
        
        if (!Paciente) {
             console.error('Modelo Paciente no disponible en el objeto db');
             return res.status(500).json({ message: 'Error interno del servidor' });
        }

        const pacienteEncontrado = await Paciente.findOne({
            where: { numero_documento: cedula },
            include: [
                { association: 'parroquia', required: false },
                { association: 'etnia', required: false },
                { association: 'estadoCivil', required: false }
            ]
        });
        
        if (!pacienteEncontrado) {
            return res.status(200).json({ found: false });
        }

        // Buscar última admisión abierta usando Sequelize
        let admisionAbierta = null;
        if (Admision) {
             admisionAbierta = await Admision.findOne({
                where: {
                    paciente_id: pacienteEncontrado.id,
                    estado: { [Op.ne]: 'DE ALTA' } // O el estado que signifique "cerrada"
                },
                order: [['fecha_admision', 'DESC']],
                limit: 1
            });
        }

        res.json({
            found: true,
            paciente: pacienteEncontrado,
            admisionAbierta
        });

    } catch (error) {
        console.error('Error al buscar paciente:', error);
        // Aseguramos que el frontend reciba found: false para permitir registro manual
        res.status(200).json({ found: false });
    }
};

/**
 * Registro de Admisión simplificado usando Sequelize
 */
const registrarAdmision = async (req, res) => {
    const { paciente: Paciente, admision: Admision } = db;
    try {
        const { datosPaciente } = req.body;
        const usuario_id = req.user ? req.user.id : null;

        if (!usuario_id) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // 1. Upsert del Paciente
        // Normalización de campos del frontend a backend
        const datosNormalizados = {
            numero_documento: datosPaciente.numero_documento || datosPaciente.cedula,
            primer_nombre: datosPaciente.primer_nombre || datosPaciente.firstName1,
            segundo_nombre: datosPaciente.segundo_nombre || datosPaciente.firstName2 || null,
            primer_apellido: datosPaciente.primer_apellido || datosPaciente.lastName1,
            segundo_apellido: datosPaciente.segundo_apellido || datosPaciente.lastName2 || null,
            fecha_nacimiento: datosPaciente.fecha_nacimiento || datosPaciente.birthDate,
            direccion: datosPaciente.direccion || datosPaciente.address,
            telefono: datosPaciente.telefono || datosPaciente.phone,
            email: datosPaciente.email,
            id_etnia: datosPaciente.id_etnia || datosPaciente.autoidentificacionEtnica || datosPaciente.ethnicityId,
            id_nacionalidad_etnica: datosPaciente.id_nacionalidad_etnica || datosPaciente.nacionalidadEtnica || datosPaciente.ethnicNationalityId,
            id_pueblo: datosPaciente.id_pueblo || datosPaciente.puebloEtnico || datosPaciente.ethnicGroupId,
            id_tipo_identificacion: datosPaciente.id_tipo_identificacion || datosPaciente.tipoIdentificacionId || datosPaciente.documentTypeId,
            id_estado_civil: datosPaciente.id_estado_civil || datosPaciente.estadoCivilId || datosPaciente.civilStatusId,
            id_nacionalidad: datosPaciente.id_nacionalidad || datosPaciente.nacionalidadId || datosPaciente.nationalityId,
            id_instruccion: datosPaciente.id_instruccion || datosPaciente.instruccionId || datosPaciente.instructionId,
            id_estado_instruccion: datosPaciente.id_estado_instruccion || datosPaciente.estadoInstruccionId,
            id_ocupacion: datosPaciente.id_ocupacion || datosPaciente.ocupacionId,
            id_tipo_empresa: datosPaciente.id_tipo_empresa || datosPaciente.tipoEmpresaId,
            id_bono: datosPaciente.id_bono || datosPaciente.bonoId,
            creado_por: usuario_id
        };

        let [paciente, created] = await Paciente.findOrCreate({
            where: { numero_documento: datosNormalizados.numero_documento },
            defaults: datosNormalizados
        });

        if (!created) {
            await paciente.update(datosNormalizados);
        }

        // 2. Crear Admisión
        const nuevaAdmision = await Admision.create({
            paciente_id: paciente.id,
            fecha_admision: new Date(),
            registrado_por: usuario_id,
            motivo_consulta: 'PENDIENTE DE TRIAJE'
        });

        res.status(201).json({
            message: 'ADMISION REGISTRADA EXITOSAMENTE',
            id_paciente: paciente.id,
            id_admision: nuevaAdmision.id
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
