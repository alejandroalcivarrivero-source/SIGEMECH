const { Parto } = require('./parto_model');

/**
 * Controlador para manejar la información del Libro de Partos (RPIS/MSP).
 * Implementado de forma modular para no afectar la velocidad de la admisión general.
 */
const partosController = {
    /**
     * Guarda o actualiza los datos de un parto asociado a un neonato.
     */
    async guardarParto(req, res) {
        try {
            const { 
                paciente_id,
                madre_id,
                id_lugar_parto,
                fecha_hora_parto,
                peso_gramos,
                talla_cm,
                perimetro_cefalico,
                perimetro_braquial,
                perimetro_toracico,
                apgar_5min,
                apgar_10min,
                tipo_parto,
                posicion_parto,
                entrega_placenta,
                hb_aplicada,
                bcg_aplicada,
                id_responsable_atencion_rn,
                id_responsable_parto
            } = req.body;

            if (!paciente_id || !madre_id) {
                return res.status(400).json({ 
                    message: 'Faltan IDs críticos (Neonato/Madre) para el Libro de Parto.' 
                });
            }

            // Buscar si ya existe un registro para este paciente
            let parto = await Parto.findOne({ where: { paciente_id } });

            if (parto) {
                await parto.update(req.body);
            } else {
                parto = await Parto.create(req.body);
            }

            return res.status(200).json({
                message: 'Datos del Libro de Parto sincronizados correctamente.',
                data: parto
            });

        } catch (error) {
            console.error('Error en partosController.guardarParto:', error);
            return res.status(500).json({ 
                message: 'Error interno al procesar datos del parto.',
                error: error.message 
            });
        }
    },

    /**
     * Obtiene los datos del parto de un paciente.
     */
    async obtenerPartoPorPaciente(req, res) {
        try {
            const { paciente_id } = req.params;
            const parto = await Parto.findOne({ where: { paciente_id } });

            if (!parto) {
                return res.status(404).json({ message: 'No se encontraron datos de parto para este paciente.' });
            }

            return res.status(200).json(parto);
        } catch (error) {
            console.error('Error en partosController.obtenerPartoPorPaciente:', error);
            return res.status(500).json({ message: 'Error al obtener datos del parto.' });
        }
    }
};

module.exports = partosController;
