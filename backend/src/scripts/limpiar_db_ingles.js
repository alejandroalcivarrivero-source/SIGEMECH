const { sequelize } = require('../config/db');

/**
 * Script de limpieza para eliminar tablas en inglés creadas por error
 */
const limpiarBaseDeDatos = async () => {
    try {
        console.log('Iniciando limpieza de tablas obsoletas (inglés)...');
        
        // Deshabilitar temporalmente restricciones de llaves foráneas para evitar errores al borrar
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        
        const tablasParaEliminar = [
            'Users',
            'Admissions',
            'Patients',
            'Nationalities'
        ];

        for (const tabla of tablasParaEliminar) {
            console.log(`Eliminando tabla: ${tabla}...`);
            await sequelize.query(`DROP TABLE IF EXISTS ${tabla}`);
        }

        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log('Limpieza completada exitosamente.');
        process.exit(0);
    } catch (error) {
        console.error('Error durante la limpieza:', error);
        process.exit(1);
    }
};

limpiarBaseDeDatos();
