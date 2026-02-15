const sequelize = require('../config/db');
const fs = require('fs').promises;
const path = require('path');
const { inicializarModelos } = require('../models_index');

async function auditarEstructura() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    inicializarModelos(sequelize);

    const modelos = sequelize.models;
    const nombresModelos = Object.keys(modelos);
    const tablasDB = await sequelize.getQueryInterface().showAllTables();

    let reporte = '# Auditoría Estructural de la Base de Datos\n\n';

    // 1. Tablas en la DB que no tienen modelo
    reporte += '## Tablas en la DB sin Modelo\n\n';
    const modelosEnTablas = nombresModelos.map(nombre => modelos[nombre].tableName);
    const tablasSinModelo = tablasDB.filter(tabla => !modelosEnTablas.includes(tabla) && tabla !== 'SequelizeMeta');
    if (tablasSinModelo.length > 0) {
      tablasSinModelo.forEach(tabla => reporte += `- ${tabla}\n`);
    } else {
      reporte += 'Todas las tablas tienen un modelo correspondiente.\n';
    }
    reporte += '\n';


    // 2. Columnas en la DB que no están en el modelo y viceversa
    reporte += '## Discrepancias en Columnas (DB vs. Modelo)\n\n';
    for (const nombreModelo of nombresModelos) {
      const modelo = modelos[nombreModelo];
      const nombreTabla = modelo.tableName;

      if (tablasDB.includes(nombreTabla)) {
        const descripcionTabla = await sequelize.getQueryInterface().describeTable(nombreTabla);
        const columnasDB = Object.keys(descripcionTabla);
        const columnasModelo = Object.keys(modelo.rawAttributes);

        const columnasSoloEnDB = columnasDB.filter(c => !columnasModelo.includes(c));
        const columnasSoloEnModelo = columnasModelo.filter(c => !columnasDB.includes(c));

        if (columnasSoloEnDB.length > 0 || columnasSoloEnModelo.length > 0) {
            reporte += `### Tabla: \`${nombreTabla}\`\n\n`;
            if (columnasSoloEnDB.length > 0) {
                reporte += '- **Columnas solo en la DB (potencialmente faltantes en el modelo):**\n';
                columnasSoloEnDB.forEach(c => reporte += `  - \`${c}\`\n`);
            }
            if (columnasSoloEnModelo.length > 0) {
                reporte += '- **Atributos solo en el Modelo (potencialmente faltantes en la DB):**\n';
                columnasSoloEnModelo.forEach(c => reporte += `  - \`${c}\`\n`);
            }
            reporte += '\n';
        }
      }
    }


    // 3. Modelos que apuntan a tablas inexistentes
    reporte += '## Modelos Apuntando a Tablas Inexistentes\n\n';
    const modelosSinTabla = nombresModelos.filter(nombre => !tablasDB.includes(modelos[nombre].tableName));
    if (modelosSinTabla.length > 0) {
      modelosSinTabla.forEach(nombre => reporte += `- El modelo \`${nombre}\` apunta a la tabla \`${modelos[nombre].tableName}\`, que no existe.\n`);
    } else {
      reporte += 'Todos los modelos apuntan a tablas existentes.\n';
    }
    reporte += '\n';


    const rutaReporte = path.join(__dirname, '..', '..', 'AUDITORIA_ESTRUCTURAL.md');
    await fs.writeFile(rutaReporte, reporte);

    console.log(`Reporte de auditoría generado en: ${rutaReporte}`);

  } catch (error) {
    console.error('Error durante la auditoría:', error);
  } finally {
    await sequelize.close();
  }
}

auditarEstructura();
