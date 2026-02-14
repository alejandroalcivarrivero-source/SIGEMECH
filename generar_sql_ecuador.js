const fs = require('fs');
const path = require('path');

// Rutas de archivos
const jsonPath = path.join('formularios cvs', 'ecuador.json');
const sqlPath = 'importar_datos_ecuador.sql';

try {
    // Cargar el archivo JSON
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    let sqlStatements = [];
    
    // Templates para las inserciones
    const insProvincia = (id, nombre) => `INSERT INTO cat_provincias (id, nombre) VALUES ('${id}', '${nombre}');`;
    const insCanton = (id, provincia_id, nombre) => `INSERT INTO cat_cantones (id, provincia_id, nombre) VALUES ('${id}', '${provincia_id}', '${nombre}');`;
    const insParroquia = (id, canton_id, nombre) => `INSERT INTO cat_parroquias (id, canton_id, nombre) VALUES ('${id}', '${canton_id}', '${nombre}');`;

    // Limpiar comillas simples para SQL
    const escapeSQL = (str) => str.replace(/'/g, "''");

    // Agregar desactivación de checks de llaves foráneas
    sqlStatements.push("SET FOREIGN_KEY_CHECKS = 0;");
    sqlStatements.push("TRUNCATE TABLE cat_parroquias;");
    sqlStatements.push("TRUNCATE TABLE cat_cantones;");
    sqlStatements.push("TRUNCATE TABLE cat_provincias;");

    for (const [prov_id, prov_data] of Object.entries(data)) {
        // Saltamos si no tiene estructura de provincia
        if (prov_data && prov_data.provincia) {
            const prov_nombre = escapeSQL(prov_data.provincia);
            sqlStatements.push(insProvincia(prov_id, prov_nombre));
            
            if (prov_data.cantones) {
                for (const [canton_id, canton_data] of Object.entries(prov_data.cantones)) {
                    const canton_nombre = escapeSQL(canton_data.canton);
                    sqlStatements.push(insCanton(canton_id, prov_id, canton_nombre));
                    
                    if (canton_data.parroquias) {
                        for (const [parr_id, parr_nombre] of Object.entries(canton_data.parroquias)) {
                            const nombre_limpio = escapeSQL(parr_nombre);
                            sqlStatements.push(insParroquia(parr_id, canton_id, nombre_limpio));
                        }
                    }
                }
            }
        }
    }

    sqlStatements.push("SET FOREIGN_KEY_CHECKS = 1;");

    // Guardar el resultado en un archivo .sql
    fs.writeFileSync(sqlPath, sqlStatements.join('\n'), 'utf8');

    console.log(`Se ha generado el archivo ${sqlPath} con ${sqlStatements.length} sentencias SQL.`);

} catch (error) {
    console.error(`Error: ${error.message}`);
}
