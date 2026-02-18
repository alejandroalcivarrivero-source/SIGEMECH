const { Usuario, Paciente, Admision } = require('../../models_index');
const { Op } = require('sequelize');

/**
 * Buscar paciente por identificación (Soberanía Técnica)
 */
const buscarPacientePorCedula = async (req, res) => {
    try {
        const { cedula } = req.params;
        
        // Guard Clause: Evitar consultas para códigos de pacientes "No Identificados" (usualmente 17 caracteres)
        if (cedula && cedula.length > 10) {
            return res.status(200).json(null);
        }

        console.log('Buscando Identificación:', cedula);
        
        // Uso directo de numero_identificacion (Única Fuente de Verdad)
        const paciente = await Paciente.findOne({
            where: { numero_identificacion: cedula },
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
        const admisionAbierta = await Admision.findOne({
            where: {
                paciente_id: paciente.id,
                // Aquí podrías filtrar por un estado específico si existe en el catálogo de estados
            },
            include: [{ association: 'triaje' }, { association: 'estadoProceso' }],
            order: [['fecha_creacion', 'DESC']]
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

        // 1. Upsert del Paciente - Sincronizado con Soberanía Técnica
        let [paciente, created] = await Paciente.findOrCreate({
            where: { numero_identificacion: datosPaciente.numero_identificacion || datosPaciente.cedula },
            defaults: {
                primer_nombre: datosPaciente.primer_nombre,
                primer_apellido: datosPaciente.primer_apellido,
                fecha_nacimiento: datosPaciente.fecha_nacimiento,
                telefono: datosPaciente.telefono,
                correo: datosPaciente.correo,
                id_tipo_identificacion: datosPaciente.id_tipo_identificacion,
                id_estado_civil: datosPaciente.id_estado_civil,
                id_sexo: datosPaciente.id_sexo,
                usuario_id: usuario_id
            }
        });

        if (!created) {
            await paciente.update({
                primer_nombre: datosPaciente.primer_nombre,
                primer_apellido: datosPaciente.primer_apellido,
                fecha_nacimiento: datosPaciente.fecha_nacimiento,
                telefono: datosPaciente.telefono,
                correo: datosPaciente.correo,
                id_tipo_identificacion: datosPaciente.id_tipo_identificacion,
                id_estado_civil: datosPaciente.id_estado_civil,
                id_sexo: datosPaciente.id_sexo
            });
        }

        // 2. Crear Admisión - Payload Sincronizado
        const nuevaAdmision = await Admision.create({
            paciente_id: paciente.id,
            fecha_llegada: new Date(),
            usuario_id: usuario_id,
            motivo_consulta: 'PENDIENTE DE TRIAJE',
            estado: 'PENDIENTE'
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
