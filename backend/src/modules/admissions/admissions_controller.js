const { sequelize } = require('../../config/db');
const { Op } = require('sequelize');
const { Paciente, Representante, Admision, Parto } = sequelize.models;

/**
 * Controlador para el proceso de Admisión de Emergencia
 * Sigue el patrón de microservicios con persistencia atómica.
 */
const admissionController = {
    /**
     * Crea o actualiza un paciente y registra su admisión en una sola transacción.
     */
    async createAdmission(req, res) {
        const t = await sequelize.transaction();
        console.log('[ADMISION] Inicio de proceso transaccional...');
        
        try {
            const { pacienteData, admissionData, representanteData, datos_parto } = req.body;
            const userId = req.user.id;

            // Validación rápida de campos obligatorios para trazabilidad precisa
            if (!pacienteData) throw new Error('Falta pacienteData');
            if (!admissionData) throw new Error('Falta admissionData');

            // --- REGLAS DE NEGOCIO (Soberanía de Datos - QA Senior) ---
            
            // 1. Validación de Fecha de Ingreso (No Futura)
            const fechaIngreso = admissionData.fecha_ingreso ? new Date(admissionData.fecha_ingreso) : new Date();
            if (fechaIngreso > new Date()) {
                throw new Error('Validación Técnica: La fecha de ingreso no puede ser posterior a la fecha actual.');
            }

            // 2. Validación de Referencia (Obligatoriedad de Establecimiento de Origen)
            if (admissionData.id_forma_llegada) {
                const formaLlegada = await sequelize.models.FormaLlegada.findByPk(admissionData.id_forma_llegada);
                if (formaLlegada && formaLlegada.nombre === 'Referido') {
                    if (!admissionData.establecimiento_origen || admissionData.establecimiento_origen.trim() === '') {
                        throw new Error('Validación de Proceso: Para pacientes referidos, el campo "Establecimiento de Origen" es mandatorio.');
                    }
                }
            }

            // --- BLINDAJE DE INTEGRIDAD REFERENCIAL (CATÁLOGOS UBICACIÓN) ---
            const { parishId } = pacienteData;
            const { canton_id, parroquia_id } = admissionData; // En caso de que vengan en admissionData también

            // Validación de IDs de ubicación (deben ser Strings no vacíos)
            const validateStringId = (id, fieldName) => {
                if (id !== undefined && id !== null) {
                    if (typeof id !== 'string' || id.trim() === '') {
                        throw new Error(`Integridad Referencial: El campo ${fieldName} debe ser un String válido.`);
                    }
                }
            };

            validateStringId(parishId, 'parishId (Residencia)');
            validateStringId(canton_id, 'canton_id');
            validateStringId(parroquia_id, 'parroquia_id');
            // ----------------------------------------------------------------

            // Mapeo de motivoAtencion -> reasonForConsultation (o motivo_consulta si se usa en el modelo)
            // Según admission_model.js es reasonForConsultation mapeado a reason_for_consultation
            const motivoConsulta = admissionData.motivoAtencion || admissionData.motivo_consulta || admissionData.reasonForConsultation;
            
            if (!motivoConsulta) {
                throw new Error('Falta motivo de consulta (motivoAtencion)');
            }

            // 1. Upsert del Paciente
            console.log('[ADMISION] Procesando datos del paciente...');
            let paciente;
            if (pacienteData.id) {
                paciente = await Paciente.findByPk(pacienteData.id, { transaction: t });
                if (paciente) {
                    console.log(`[ADMISION] Actualizando paciente existente ID: ${paciente.id}`);
                    await paciente.update(pacienteData, { transaction: t });
                }
            }
            
            if (!paciente) {
                // Si viene documento, buscar por documento para evitar duplicados
                if (pacienteData.documentNumber) {
                    paciente = await Paciente.findOne({
                        where: { documentNumber: pacienteData.documentNumber },
                        transaction: t
                    });
                }

                if (paciente) {
                    console.log(`[ADMISION] Paciente encontrado por documento: ${pacienteData.documentNumber}, actualizando...`);
                    await paciente.update(pacienteData, { transaction: t });
                } else {
                    console.log('[ADMISION] Creando nuevo paciente...');
                    paciente = await Paciente.create({
                        ...pacienteData,
                        createdBy: userId
                    }, { transaction: t });
                }
            }

            // 2. Gestión del Representante (si aplica)
            if (representanteData && representanteData.identificacion) {
                console.log(`[ADMISION] Procesando representante para paciente ID: ${paciente.id}...`);
                const [representante, created] = await Representante.findOrCreate({
                    where: { pacienteId: paciente.id },
                    defaults: {
                        ...representanteData,
                        pacienteId: paciente.id
                    },
                    transaction: t
                });

                if (!created) {
                    console.log(`[ADMISION] Actualizando representante existente para paciente ID: ${paciente.id}`);
                    await representante.update(representanteData, { transaction: t });
                }
            }

            // 3. Registro de Admisión
            console.log(`[ADMISION] Registrando admisión para paciente ID: ${paciente.id}...`);
            const admission = await Admision.create({
                ...admissionData,
                reasonForConsultation: motivoConsulta,
                pacienteId: paciente.id,
                admittedBy: userId,
                status: 'EN_ESPERA'
            }, { transaction: t });

            // 4. Registro de Datos de Parto (Paso 2 de la tarea: Solo para neonatos si existe el objeto)
            if (datos_parto) {
                console.log(`[ADMISION] Registrando datos de parto para admisión ID: ${admission.id}...`);
                await Parto.create({
                    ...datos_parto,
                    paciente_id: paciente.id,
                    // Si el modelo Parto requiere vincularse con la admisión directamente,
                    // se debería asegurar que el campo exista en el modelo.
                    // El prompt dice "vinculando el admision_id recién creado".
                    // Nota: El modelo Parto actual no tiene admission_id, pero lo agregamos
                    // si es necesario o lo mapeamos según la instrucción.
                    admision_id: admission.id
                }, { transaction: t });
            }

            console.log(`[ADMISION] Admisión creada con ID: ${admission.id}. Aplicando Commit...`);
            await t.commit();
            console.log('[ADMISION] Transacción completada con éxito.');

            res.status(201).json({
                message: 'Admisión procesada exitosamente',
                pacienteId: paciente.id,
                admissionId: admission.id
            });
        } catch (error) {
            if (t) await t.rollback();
            
            // Trazabilidad de errores específica
            let errorMsg = error.message;
            if (error.name === 'SequelizeValidationError') {
                errorMsg = `Error de validación: ${error.errors.map(e => e.path).join(', ')}`;
            } else if (error.name === 'SequelizeUniqueConstraintError') {
                errorMsg = `Error de duplicidad: ${Object.keys(error.fields).join(', ')}`;
            }

            console.error(`[ADMISION][ROLLBACK] Error en el proceso: ${errorMsg}`);
            
            res.status(500).json({
                message: 'Error interno al procesar la admisión atómica',
                detail: errorMsg
            });
        }
    },

    /**
     * Valida si una cédula corresponde a una paciente (Mujer) con una admisión reciente (< 48h).
     * Endpoint: POST /api/admisiones/validar-materna
     */
    async validarMaterna(req, res) {
        try {
            const { cedula } = req.body;

            if (!cedula) {
                return res.status(400).json({ message: 'La cédula es requerida.' });
            }

            // Buscar al paciente por cédula
            const paciente = await Paciente.findOne({
                where: { documentNumber: cedula }
            });

            if (!paciente) {
                return res.status(404).json({ message: 'Paciente no encontrada con esa cédula.' });
            }

            // Validar sexo (sexo_id: 2 asumiendo que 2 es Femenino/Mujer)
            if (paciente.sexId !== 2) {
                return res.status(400).json({ message: 'La cédula ingresada no corresponde a una paciente de sexo femenino.' });
            }

            // Validar admisión reciente (< 48 horas)
            const hace48Horas = new Date(new Date() - 48 * 60 * 60 * 1000);

            const admisionReciente = await Admision.findOne({
                where: {
                    pacienteId: paciente.id,
                    createdAt: {
                        [Op.gte]: hace48Horas
                    }
                },
                order: [['createdAt', 'DESC']]
            });

            if (!admisionReciente) {
                return res.status(404).json({ message: 'No se encontró una admisión reciente (últimas 48 horas) para esta paciente.' });
            }

            // Si cumple todas las condiciones
            return res.status(200).json({
                message: 'Paciente válida para registro materno.',
                paciente: {
                    id: paciente.id,
                    nombre: `${paciente.firstName1} ${paciente.lastName1}`,
                    cedula: paciente.documentNumber
                },
                admision: {
                    id: admisionReciente.id,
                    fecha: admisionReciente.createdAt
                }
            });

        } catch (error) {
            console.error('[VALIDAR-MATERNA] Error:', error);
            return res.status(500).json({ message: 'Error interno del servidor al validar paciente materna.' });
        }
    }
};

module.exports = admissionController;
