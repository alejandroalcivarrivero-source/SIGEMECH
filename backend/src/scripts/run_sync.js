require('dotenv').config({ path: require('path').resolve(__dirname, '../../../backend/.env') });

const { sequelize } = require('../config/db');

// Importar todos los modelos para que Sequelize los conozca
require('../models_index');

async function syncDatabase() {
  try {
    console.log('Iniciando sincronización estructural con la base de datos...');
    // La opción { alter: true } comprueba el estado actual de la tabla en la base de datos (qué columnas tiene, 
    // cuáles son sus tipos de datos, etc.), y luego realiza los cambios necesarios en la tabla para que coincida con el modelo.
    await sequelize.sync({ alter: true });
    console.log('¡Sincronización estructural completada exitosamente!');
    console.log('La base de datos ahora está alineada con el diagrama de entidad-relación.');
  } catch (error) {
    console.error('Error durante la sincronización de la base de datos:', error);
  } finally {
    await sequelize.close();
    console.log('Conexión con la base de datos cerrada.');
  }
}

syncDatabase();
