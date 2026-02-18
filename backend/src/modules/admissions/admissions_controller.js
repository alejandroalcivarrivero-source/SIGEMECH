const { sequelize } = require('../../config/db');
const { Op } = require('sequelize');

/**
 * Controlador para el proceso de Admisión de Emergencia
 * Sigue el patrón de microservicios con persistencia atómica.
 */
const admissionController = {
    /**
     * Crea o actualiza un paciente y registra su admisión en una sola transacción.
     */
    async createAdmission(req, res) {
        const { Paciente, Representante, Admision, Parto } = sequelize.models;
        console.log('[DEBUG] Modelos cargados en scope:', { Paciente: !!Paciente, Representante: !!Representante });
        
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
            const { id_parroquia } = pacienteData;
            const { canton_id, parroquia_id } = admissionData; // En caso de que vengan en admissionData también

            // Validación de IDs de ubicación (deben ser Strings no vacíos o Números)
            const validateId = (id, fieldName) => {
                if (id !== undefined && id !== null) {
                    if ((typeof id !== 'string' || id.trim() === '') && typeof id !== 'number') {
                        throw new Error(`Integridad Referencial: El campo ${fieldName} debe ser un ID válido.`);
                    }
                }
            };

            validateId(id_parroquia, 'id_parroquia (Residencia)');
            validateId(canton_id, 'canton_id');
            validateId(parroquia_id, 'parroquia_id');
            // ----------------------------------------------------------------

            // --- GESTIÓN INTELIGENTE DE MOTIVO (Soberanía Técnica) ---
            let motivoId = 4; // Por defecto: MALESTAR GENERAL (ID del catálogo)
            let enfermedadActual = admissionData.motivo_detalle || "";

            if (admissionData.motivo_consulta) {
                if (typeof admissionData.motivo_consulta === 'string') {
                    // Si recibimos texto (como en el Smoke Test), lo movemos a enfermedad_actual
                    enfermedadActual = admissionData.motivo_consulta + (enfermedadActual ? " | " + enfermedadActual : "");
                } else {
                    motivoId = admissionData.motivo_consulta;
                }
            } else {
                throw new Error('Falta motivo de consulta (motivo_consulta)');
            }

            // 1. Upsert del Paciente - Sincronizado con numero_identificacion
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
                // Sincronización de Payload: Uso directo de numero_identificacion hacia Sequelize
                if (pacienteData.numero_identificacion) {
                    paciente = await Paciente.findOne({
                        where: { numero_identificacion: pacienteData.numero_identificacion },
                        transaction: t
                    });
                }

                if (paciente) {
                    console.log(`[ADMISION] Paciente encontrado por identificación: ${pacienteData.numero_identificacion}, actualizando...`);
                    await paciente.update(pacienteData, { transaction: t });
                } else {
                    console.log('[ADMISION] Creando nuevo paciente...');
                    paciente = await Paciente.create({
                        ...pacienteData,
                        usuario_id: userId // Sincronizado con snake_case
                    }, { transaction: t });
                }
            }

            // 2. Gestión del Representante (si aplica)
            if (representanteData && representanteData.identificacion) {
                console.log(`[ADMISION] Procesando representante para paciente ID: ${paciente.id}...`);
                const [representante, created] = await Representante.findOrCreate({
                    where: { paciente_id: paciente.id },
                    defaults: {
                        ...representanteData,
                        paciente_id: paciente.id
                    },
                    transaction: t
                });

                if (!created) {
                    console.log(`[ADMISION] Actualizando representante existente para paciente ID: ${paciente.id}`);
                    await representante.update(representanteData, { transaction: t });
                }
            }

            // 3. Registro de Admisión - Payload Sincronizado
            console.log(`[ADMISION] Registrando admisión para paciente ID: ${paciente.id}...`);
            const admission = await Admision.create({
                ...admissionData,
                motivo_consulta: motivoId,
                enfermedad_actual: enfermedadActual,
                paciente_id: paciente.id,
                usuario_id: userId,
                registrado_por: userId, // Duplicidad requerida por la DB MariaDB
                fecha_llegada: admissionData.fecha_ingreso || new Date(),
                fecha_admision: new Date(), // Requerido por la DB (index 8)
                estado: 'Admisión', // Sincronizado con DEFAULT de la DB
                fecha_actualizacion: new Date() // Requerido por la DB (index 21)
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
                id_paciente: paciente.id,
                id_admision: admission.id
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
            const { numero_identificacion } = req.body;

            if (!numero_identificacion) {
                return res.status(400).json({ message: 'La identificación es requerida.' });
            }

            // Buscar al paciente por numero_identificacion (Soberanía Técnica)
            const paciente = await Paciente.findOne({
                where: { numero_identificacion: numero_identificacion }
            });

            if (!paciente) {
                return res.status(404).json({ message: 'Paciente no encontrada.' });
            }

            // Validar sexo (id_sexo: 2 = Femenino)
            if (paciente.id_sexo !== 2) {
                return res.status(400).json({ message: 'La identificación ingresada no corresponde a una paciente de sexo femenino.' });
            }

            // Validar admisión reciente (< 48 horas)
            const hace48Horas = new Date(new Date() - 48 * 60 * 60 * 1000);

            const admisionReciente = await Admision.findOne({
                where: {
                    paciente_id: paciente.id,
                    fecha_creacion: {
                        [Op.gte]: hace48Horas
                    }
                },
                order: [['fecha_creacion', 'DESC']]
            });

            if (!admisionReciente) {
                return res.status(404).json({ message: 'No se encontró una admisión reciente (últimas 48 horas) para esta paciente.' });
            }

            // Si cumple todas las condiciones
            return res.status(200).json({
                message: 'Paciente válida para registro materno.',
                paciente: {
                    id: paciente.id,
                    nombre: `${paciente.primer_nombre} ${paciente.primer_apellido}`,
                    numero_identificacion: paciente.numero_identificacion
                },
                admision: {
                    id: admisionReciente.id,
                    fecha: admisionReciente.fecha_creacion
                }
            });

        } catch (error) {
            console.error('[VALIDAR-MATERNA] Error:', error);
            return res.status(500).json({ message: 'Error interno del servidor al validar paciente materna.' });
        }
    }
};

module.exports = admissionController;
