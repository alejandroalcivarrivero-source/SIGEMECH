
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

require('dotenv').config({ path: './backend/.env' });

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mariadb',
        logging: false
    }
);

// Carga todos los modelos dinámicamente
const models = {};
const modelsDir = path.join(__dirname, "backend", "src", "modules");

fs.readdirSync(modelsDir).forEach(module => {
    const moduleDir = path.join(modelsDir, module);
    try {
        const modelFiles = fs.readdirSync(moduleDir).filter(file => 
            file.endsWith("_model.js") || file.endsWith("models.js")
        );
        modelFiles.forEach(file => {
            const model = require(path.join(moduleDir, file))(sequelize, Sequelize.DataTypes);
            if (model.name) {
                models[model.name] = model;
            } else {
                // Para archivos como catalog/models.js que exportan un objeto de modelos
                Object.values(model).forEach(m => {
                    if (m.name) models[m.name] = m;
                });
            }
        });
    } catch (error) {
        // Ignorar directorios que no contienen modelos
        if (error.code !== 'ENOTDIR' && error.code !== 'ENOENT') {
            console.error(`Error al leer el directorio del módulo ${module}:`, error);
        }
    }
});


const queryInterface = sequelize.getQueryInterface();
const logFilePath = path.join(__dirname, "db_inspection.log");

async function inspectDatabase() {
  const logStream = fs.createWriteStream(logFilePath, { flags: "w" });
  const log = (message) => logStream.write(message + "\n");

  try {
    await sequelize.authenticate();
    log("Conexión a la base de datos establecida.");

    let tableNames = await queryInterface.showAllTables();
    if (tableNames.length > 0 && typeof tableNames[0] === 'object') {
      const key = Object.keys(tableNames[0])[0];
      tableNames = tableNames.map(t => t[key]);
    }
    log(`Tablas encontradas en la BD: ${tableNames.join(", ")}`);
    log("---");

    const modelTableNames = Object.values(models).map(m => m.tableName);
    log(`Nombres de tabla definidos en los modelos: ${modelTableNames.join(", ")}`);
    log("---");

    log("### COMPARACIÓN DE NOMBRES DE TABLA ###");
    tableNames.forEach(dbTable => {
        const modelMatch = Object.values(models).find(m => m.tableName === dbTable);
        if (!modelMatch) {
            log(`[EXTRA EN DB] La tabla "${dbTable}" existe en la base de datos pero no tiene un modelo Sequelize correspondiente.`);
        } else if (dbTable.startsWith("cat_") && !modelMatch.tableName.startsWith("cat_")) {
             log(`[ERROR DE PREFIJO] El modelo para "${dbTable}" se llama "${modelMatch.tableName}" y le falta el prefijo "cat_".`);
        }
    });

    modelTableNames.forEach(modelTable => {
        if (!tableNames.includes(modelTable)) {
            log(`[FALTA EN DB] El modelo con tableName "${modelTable}" no tiene una tabla correspondiente en la base de datos.`);
        }
    });


    log("\n### ANÁLISIS DETALLADO DE COLUMNAS POR TABLA ###");
    for (const tableName of tableNames) {
      log(`\n--- Analizando tabla: ${tableName} ---`);
      const tableDescription = await queryInterface.describeTable(tableName);
      const model = Object.values(models).find(m => m.tableName === tableName);

      if (model) {
        const modelAttributes = model.getAttributes();
        const modelColumns = Object.keys(modelAttributes);

        log(`Modelo Sequelize: ${model.name} (tableName: ${model.tableName})`);
        log(`Columnas del modelo: ${modelColumns.join(", ")}`);
        log(`Columnas de la BD: ${Object.keys(tableDescription).join(", ")}`);
        
        // Comparar columnas
        modelColumns.forEach(modelCol => {
            const attribute = modelAttributes[modelCol];
            const dbColName = attribute.field || modelCol;
            if (!tableDescription[dbColName]) {
                 log(`[COLUMNA FALTANTE EN DB] La columna "${dbColName}" definida en el modelo "${model.name}" no existe en la tabla "${tableName}".`);
            }
        });

        Object.keys(tableDescription).forEach(dbCol => {
            const modelAttr = Object.values(modelAttributes).find(attr => attr.field === dbCol || attr.fieldName === dbCol);
             if (!modelAttr) {
                log(`[COLUMNA EXTRA EN DB] La columna "${dbCol}" en la tabla "${tableName}" no está definida en el modelo "${model.name}".`);
             }
        });


      } else {
        log(`[ADVERTENCIA] No se encontró un modelo para la tabla "${tableName}".`);
        log(`Columnas en BD: ${Object.keys(tableDescription).join(", ")}`);
      }
    }

  } catch (error) {
    log(`ERROR: ${error.message}`);
    console.error("Error durante la inspección:", error);
  } finally {
    await sequelize.close();
    log("\nInspección finalizada. Conexión cerrada.");
    logStream.end();
  }
}

inspectDatabase();
