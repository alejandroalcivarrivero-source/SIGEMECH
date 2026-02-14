const { sequelize } = require('../config/db');
const { inicializarModelos } = require('../models_index');

/**
 * Script para sincronizar los modelos de Sequelize con la base de datos MariaDB.
 * PRECAUCIÓN: alter: true intentará actualizar las tablas sin borrar datos, 
 * pero siempre es recomendable tener respaldo.
 */
const syncDatabase = async () => {
    try {
        console.log('Iniciando sincronización de modelos...');
        
        inicializarModelos(sequelize);
        // Sincronizar todos los modelos definidos en models_index
        await sequelize.sync({ alter: false, force: false });
        
        console.log('Sincronización completada exitosamente.');
        process.exit(0);
    } catch (error) {
        console.error('Error durante la sincronización:', error);
        process.exit(1);
    }
};

syncDatabase();
