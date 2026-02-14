const sequelize = require('../config/db');

/**
 * Script de limpieza para eliminar tablas en inglés creadas por error
 */
const cleanDatabase = async () => {
    try {
        console.log('Iniciando limpieza de tablas en inglés...');
        
        // Deshabilitar temporalmente restricciones de llaves foráneas para evitar errores al borrar
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        
        const tablesToDelete = [
            'emergency_admissions',
            'patients',
            'users',
            'parishes',
            'cantons',
            'provinces'
        ];

        for (const table of tablesToDelete) {
            console.log(`Eliminando tabla: ${table}...`);
            await sequelize.query(`DROP TABLE IF EXISTS ${table}`);
        }

        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log('Limpieza completada exitosamente.');
        process.exit(0);
    } catch (error) {
        console.error('Error durante la limpieza:', error);
        process.exit(1);
    }
};

cleanDatabase();
