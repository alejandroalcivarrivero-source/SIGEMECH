const { sequelize } = require("../config/db");
const fs = require("fs");

/**
 * Genera un script para recrear tablas que deberían estar vacías según el diseño.
 * Este script se basa en los modelos de Sequelize para asegurar la coherencia estructural.
 * Las tablas a recrear son 'pacientes', 'admisiones' y cualquier otra que se considere transaccional y no catálogo.
 *
 * El script SQL generado se guarda en `backend/src/scripts/recrear_tablas_vacias.sql`.
 */
async function generarScriptRecreacion() {
  const queryInterface = sequelize.getQueryInterface();
  const modelosParaRecrear = ["Paciente", "Admision"]; // Nombres de los modelos en Sequelize
  let scriptSql =
    "-- Script de Recreación de Tablas Transaccionales Vacías\n\n";

  for (const modelName of modelosParaRecrear) {
    if (sequelize.models[modelName]) {
      const tableName = sequelize.models[modelName].tableName;
      scriptSql += `-- Recreando la tabla: ${tableName}\n`;
      scriptSql += `DROP TABLE IF EXISTS "${tableName}" CASCADE;\n`;
      // Sequelize no tiene una forma directa de generar el "CREATE TABLE" desde el modelo sin sincronizar.
      // La sincronización se hará en un paso posterior, aquí solo preparamos el borrado.
      // El `sync` con `alter:false` no las creará si no existen.
      // Necesitamos un enfoque diferente o ejecutar un sync temporal.
    }
  }
  
  // Dado que generar el CREATE TABLE exacto es complejo sin sync,
  // el script se enfocará en borrarlas. La recreación ocurrirá
  // al ejecutar un `sync` controlado.
  
  // Por ahora, este script solo contendrá los DROP.
  // La recreación se manejará con un script de sincronización aparte.

  fs.writeFileSync(
    "backend/src/scripts/recrear_tablas_vacias.sql",
    scriptSql
  );
  console.log(
    "Script de recreación (solo borrado) guardado en: backend/src/scripts/recrear_tablas_vacias.sql"
  );
  console.log("La creación se realizará mediante un script de sincronización separado.");
}

generarScriptRecreacion().finally(() => sequelize.close());
