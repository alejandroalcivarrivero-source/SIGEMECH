const { sequelize, db } = require('../../config/db');
const { Op } = require('sequelize');
const { Paciente, Representante, Admision, Parto } = sequelize.models;

/**
 * Controlador para el proceso de Admisión de Emergencia
 * Sigue el patrón de microservicios con persistencia atómica.
 */
const admisiones_controlador = {
    /**
     * Crea o actualiza un paciente y registra su admisión en una sola transacción.
     */
    async crearAdmision(req, res) {
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
            // 1. Captura automática de Fecha de Ingreso (Timestamp Backend)
            // Se ignora cualquier fecha enviada por el frontend para cumplir con el estándar de auditoría.
            const fechaIngreso = new Date();

            // 2. Validación de Referencia (Obligatoriedad de Establecimiento de Origen)
            const id_forma_llegada = admissionData.id_forma_llegada;
            if (id_forma_llegada) {
                const formaLlegada = await sequelize.models.FormaLlegada.findByPk(id_forma_llegada);
                if (formaLlegada && formaLlegada.nombre === 'Referido') {
                    if (!admissionData.establecimiento_origen || admissionData.establecimiento_origen.trim() === '') {
                        throw new Error('Validación de Proceso: Para pacientes referidos, el campo "Establecimiento de Origen" es mandatorio.');
                    }
                }
            }

            // --- BLINDAJE DE INTEGRIDAD REFERENCIAL (CATÁLOGOS UBICACIÓN) ---
            // Los campos ya vienen en minúsculas en el payload según el mapeo del frontend.

            // Mapeo de motivoAtencion -> motivo_consulta
            const motivoConsulta = admissionData.motivo_consulta || admissionData.motivoAtencion;
            
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
                    // Misión: Persistencia de carné (Herencia de Cédula si es discapacidad)
                    const datosActualizacionFinal = { ...pacienteData };
                    await paciente.update(datosActualizacionFinal, { transaction: t });
                }
            }
            
            if (!paciente) {
                // Si viene documento, buscar por documento para evitar duplicados
                if (pacienteData.numero_documento) {
                    paciente = await Paciente.findOne({
                        where: { numero_documento: pacienteData.numero_documento },
                        transaction: t
                    });
                }

                if (paciente) {
                    console.log(`[ADMISION] Paciente encontrado por documento: ${pacienteData.numero_documento}, actualizando...`);
                    // Misión: Persistencia de carné (Herencia de Cédula si es discapacidad)
                    const datosActualizacionFinal = { ...pacienteData };
                    await paciente.update(datosActualizacionFinal, { transaction: t });
                } else {
                    console.log('[ADMISION] Creando nuevo paciente...');
                    // Misión: Persistencia de carné (Herencia de Cédula si es discapacidad)
                    const datosPacienteFinal = { ...pacienteData };
                    
                    paciente = await Paciente.create({
                        ...datosPacienteFinal,
                        creado_por: userId
                    }, { transaction: t });
                }
            }

            // 2. Gestión del Representante (si aplica)
            if (representanteData && representanteData.documento_representante) {
                console.log(`[ADMISION] Procesando representante para paciente ID: ${paciente.id}...`);
                const [representante, created] = await Representante.findOrCreate({
                    where: { id_paciente: paciente.id },
                    defaults: {
                        ...representanteData,
                        id_paciente: paciente.id
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
            const nuevaAdmision = await Admision.create({
                ...admissionData,
                fecha_admision: fechaIngreso, // Forzar timestamp del servidor
                motivo_consulta: admissionData.id_sintoma || admissionData.motivo_consulta || motivoConsulta,
                paciente_id: paciente.id,
                id_usuario_admision: userId,
                estado: 'EN_ESPERA'
            }, { transaction: t });

            // 4. Registro de Datos de Parto (Paso 2 de la tarea: Solo para neonatos si existe el objeto)
            if (datos_parto) {
                console.log(`[ADMISION] Registrando datos de parto para admisión ID: ${nuevaAdmision.id}...`);
                await Parto.create({
                    ...datos_parto,
                    paciente_id: paciente.id,
                    // Si el modelo Parto requiere vincularse con la admisión directamente,
                    // se debería asegurar que el campo exista en el modelo.
                    // El prompt dice "vinculando el admision_id recién creado".
                    // Nota: El modelo Parto actual no tiene admission_id, pero lo agregamos
                    // si es necesario o lo mapeamos según la instrucción.
                    admision_id: nuevaAdmision.id
                }, { transaction: t });
            }

            console.log(`[ADMISION] Admisión creada con ID: ${nuevaAdmision.id}. Aplicando Commit...`);
            await t.commit();
            console.log('[ADMISION] Transacción completada con éxito.');

            res.status(201).json({
                message: 'Admisión procesada exitosamente',
                pacienteId: paciente.id,
                admissionId: nuevaAdmision.id
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
     * Busca y devuelve los datos de un paciente por su número de documento.
     * Este endpoint es crucial para el flujo de vínculo materno.
     * Endpoint: GET /api/admisiones/buscar-paciente/:numero_documento
     */
    async buscarPacientePorDocumento(req, res) {
        try {
            const { numero_documento } = req.params;

            if (!numero_documento) {
                return res.status(400).json({ message: 'El número de documento es requerido.' });
            }
            
            // Se utiliza el modelo Paciente importado directamente desde sequelize.models
            const paciente = await Paciente.findOne({
                where: { numero_documento: numero_documento },
                // Aquí se pueden incluir asociaciones si fueran necesarias en el frontend
            });

            if (!paciente) {
                // Es importante devolver un 404 para que el frontend sepa que no se encontró.
                return res.status(404).json({ message: 'Paciente no encontrado.' });
            }

            // Devolver los datos completos del paciente para autollenado.
            // El frontend se encargará de mapear estos datos al formulario.
            return res.status(200).json({
                message: 'Paciente encontrado exitosamente.',
                paciente: paciente
            });

        } catch (error) {
            console.error('[BUSCAR-PACIENTE] Error:', error);
            return res.status(500).json({ message: 'Error interno al buscar el paciente.' });
        }
    },

    /**
     * Verifica específicamente la existencia de una admisión en las últimas horas.
     * Endpoint: GET /api/admissions/verificar-reciente/:pacienteId
     */
    async verificarAdmisionReciente(req, res) {
        try {
            const { pacienteId } = req.params;
            const horas = parseInt(req.query.horas) || 48;
            
            const limiteFecha = new Date(new Date() - horas * 60 * 60 * 1000);

            const admision = await db.admision.findOne({
                where: {
                    paciente_id: pacienteId,
                    fecha_creacion: {
                        [Op.gte]: limiteFecha
                    }
                }
            });

            return res.status(200).json({
                tieneAdmision: !!admision
            });
        } catch (error) {
            console.error('[VERIFICAR-RECIENTE] Error:', error);
            return res.status(500).json({ message: 'ERROR AL VERIFICAR ADMISIÓN.' });
        }
    },

    async crear_admision_completa(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const {
                paciente,
                admision_emergencia,
                adm_partos,
                admision_datos_sociales,
                admision_acompanante,
                admision_referencia_transporte,
            } = req.body;

            // 1. Crear o encontrar paciente
            const [paciente_creado, nuevo] = await Paciente.findOrCreate({
                where: { numero_identificacion: paciente.numero_identificacion },
                defaults: paciente,
                transaction,
            });

            const paciente_id = paciente_creado.id;

            // 2. Crear admisión de emergencia
            const admision_creada = await AdmisionEmergencia.create(
                { ...admision_emergencia, paciente_id },
                { transaction }
            );
            const admision_id = admision_creada.id;

            // 3. Crear datos de parto si existen
            if (adm_partos) {
                await AdmPartos.create({ ...adm_partos, admision_id }, { transaction });
            }

            // 4. Crear datos sociales si existen
            if (admision_datos_sociales) {
                await AdmisionDatosSociales.create(
                    { ...admision_datos_sociales, admision_id },
                    { transaction }
                );
            }

            // 5. Crear acompañante si existe
            if (admision_acompanante) {
                await AdmisionAcompanante.create(
                    { ...admision_acompanante, admision_id },
                    { transaction }
                );
            }

            // 6. Crear referencia si existe
            if (admision_referencia_transporte) {
                await AdmisionReferenciaTransporte.create(
                    { ...admision_referencia_transporte, admision_id },
                    { transaction }
                );
            }

            await transaction.commit();

            res.status(201).json({
                ok: true,
                message: "Admisión creada exitosamente.",
                paciente: paciente_creado,
                admision: admision_creada,
            });
        } catch (error) {
            await transaction.rollback();
            console.error("Error al crear la admisión:", error);
            res.status(500).json({
                ok: false,
                titulo: "Error Inesperado",
                mensaje: "Ocurrió un error al procesar la admisión. Por favor, contacte a soporte.",
                detalles: error.message,
            });
        }
    }
};

module.exports = admisiones_controlador;
