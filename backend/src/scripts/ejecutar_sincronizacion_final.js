// Este script ejecutará la sincronización de la base de datos.
// Sequelize creará las tablas que no existan, basándose en los modelos definidos.
// Es el paso final para recrear las tablas transaccionales que fueron borradas.

const { sequelize } = require("../config/db");

async function sincronizarModelos() {
  console.log("Iniciando la sincronización de modelos para crear tablas faltantes...");
  try {
    // Importar todos los modelos para que Sequelize los conozca
    require("../models_index"); 

    // El archivo db.js ya tiene la configuración de sync, pero lo llamamos explícitamente
    // para asegurar la creación de tablas. Lo ideal es un sync sin alter.
    await sequelize.sync({ force: false, alter: false });
    console.log("Sincronización completada. Las tablas han sido creadas si no existían.");
  } catch (error) {
    console.error("Error durante la sincronización de la base de datos:", error);
  } finally {
    await sequelize.close();
  }
}

sincronizarModelos();
