const { sequelize } = require("./src/config/db");
const fs = require("fs");

/**
 * Genera un script SQL para realizar las siguientes operaciones de limpieza y refactorización en la base de datos:
 * 1.  Elimina las columnas `created_at` y `updated_at` de todas las tablas, ya que son consideradas corruptas o redundantes.
 *     Las columnas correctas deben ser `fecha_creacion` y `fecha_actualizacion`.
 * 2.  Transfiere registros únicos de `seg_usuarios` a la tabla `usuarios`, asumiendo que `usuarios` es la tabla principal y `seg_usuarios` una duplicada.
 *     - Se evita la inserción de duplicados basándose en el campo `username`.
 *     - Posteriormente, elimina la tabla `seg_usuarios`.
 * 3.  Genera sentencias `TRUNCATE TABLE` para todas las tablas de catálogo (prefijo `cat_`) y la tabla `usuarios` para limpiarlas sin borrarlas.
 *
 * El script SQL generado se guarda en `backend/src/scripts/reconstruccion_soberana.sql`.
 */
async function generarScriptReconstruccion() {
  const queryInterface = sequelize.getQueryInterface();
  const tables = await queryInterface.showAllTables();
  let scriptSql =
    "-- Script de Reconstrucción Soberana de la Base de Datos SIGEMECH\n";
  scriptSql += "-- Generado Automáticamente\n\n";

  // 1. Purga de Columnas Corruptas (created_at, updated_at)
  scriptSql +=
    "-- Paso 1: Eliminación de columnas de auditoría en inglés (created_at, updated_at)\n";
  for (const table of tables) {
    const tableInfo = await queryInterface.describeTable(table);
    if (tableInfo.created_at) {
      scriptSql += `ALTER TABLE "${table}" DROP COLUMN "created_at";\n`;
    }
    if (tableInfo.updated_at) {
      scriptSql += `ALTER TABLE "${table}" DROP COLUMN "updated_at";\n`;
    }
  }
  scriptSql += "\n";

  // 2. Aniquilación de Duplicados (seg_usuarios)
  scriptSql += "-- Paso 2: Consolidación de la tabla de usuarios\n";
  if (tables.includes("seg_usuarios")) {
    scriptSql += `
-- Transferir registros no duplicados de seg_usuarios a usuarios
INSERT INTO "usuarios" (/* Alinear columnas aquí */)
SELECT /* Alinear columnas aquí */
FROM "seg_usuarios" s
WHERE NOT EXISTS (
  SELECT 1 FROM "usuarios" u WHERE u.username = s.username
);

-- Eliminación de la tabla duplicada
DROP TABLE "seg_usuarios";
`;
  }
  scriptSql += "\n";

  // 3. Limpieza de Catálogos y Usuarios (sin borrar la tabla)
  scriptSql += "-- Paso 3: Limpieza de catálogos y tabla de usuarios\n";
  for (const table of tables) {
    if (table.startsWith("cat_") || table === "usuarios") {
      scriptSql += `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;\n`;
    }
  }
  scriptSql += "\n-- Fin del Script\n";

  fs.writeFileSync(
    "backend/src/scripts/reconstruccion_soberana.sql",
    scriptSql
  );
  console.log(
    "Script de reconstrucción guardado en: backend/src/scripts/reconstruccion_soberana.sql"
  );
}

generarScriptReconstruccion().finally(() => sequelize.close());
