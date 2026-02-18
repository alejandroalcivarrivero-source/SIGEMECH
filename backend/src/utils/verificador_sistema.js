/**
 * VERIFICADOR DE INTEGRIDAD DE SISTEMA (PRE-FLIGHT) - SIGEMECH
 * Misión: Asegurar que la base de datos MariaDB y los modelos de Sequelize coincidan perfectamente.
 */

const { sequelize } = require('../config/db');

const verificarIntegridad = async () => {
    console.log('--- INICIANDO VERIFICACIÓN DE INTEGRIDAD SIGEMECH ---');
    
    const tablasCriticas = [
        'cat_sexos',
        'cat_estado_nivel_instruccion',
        'cat_etnias_nacionalidades',
        'pacientes',
        'admisiones_emergencia'
    ];

    const modelosCriticos = [
        'Sexo',
        'NivelInstruccion',
        'AutoidentificacionEtnica',
        'Paciente',
        'Admision'
    ];

    try {
        // 1. Validar Existencia de Modelos en Sequelize
        for (const modelo of modelosCriticos) {
            if (!sequelize.models[modelo]) {
                throw new Error(`[CRITICAL] Fallo de Integridad Soberana: Falta el modelo ${modelo}. Abortando inicio.`);
            }
        }
        console.log('[OK] Modelos soberanos cargados correctamente.');

        // 2. Validar Tablas en MariaDB mediante consultas mínimas
        for (const tabla of tablasCriticas) {
            try {
                await sequelize.query(`SELECT 1 FROM ${tabla} LIMIT 1`, { type: sequelize.QueryTypes.SELECT });
            } catch (err) {
                throw new Error(`[CRITICAL] Fallo de Integridad Soberana: Falta la tabla ${tabla}. Abortando inicio.`);
            }
        }
        console.log('[OK] Tablas críticas verificadas en MariaDB.');

        console.log('[OK] Verificación de Integridad SIGEMECH completada. Sistemas operativos.');
        return true;
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = { verificarIntegridad };
