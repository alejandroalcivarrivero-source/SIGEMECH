const { query } = require('../config/db');

async function crearTablasCatalogos() {
    try {
        console.log('Iniciando creación de tablas de catálogos...');

        // 1. Provincias
        await query(`
            CREATE TABLE IF NOT EXISTS cat_provincias (
                id INT AUTO_INCREMENT PRIMARY KEY,
                codigo VARCHAR(2) NOT NULL UNIQUE,
                nombre VARCHAR(100) NOT NULL
            )
        `);
        console.log('Tabla cat_provincias verificada.');

        // 2. Cantones
        await query(`
            CREATE TABLE IF NOT EXISTS cat_cantones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                provincia_id INT NOT NULL,
                codigo VARCHAR(4) NOT NULL,
                nombre VARCHAR(100) NOT NULL,
                FOREIGN KEY (provincia_id) REFERENCES cat_provincias(id)
            )
        `);
        console.log('Tabla cat_cantones verificada.');

        // 3. Parroquias
        await query(`
            CREATE TABLE IF NOT EXISTS cat_parroquias (
                id INT AUTO_INCREMENT PRIMARY KEY,
                canton_id INT NOT NULL,
                codigo VARCHAR(6) NOT NULL,
                nombre VARCHAR(100) NOT NULL,
                tipo ENUM('URBANA', 'RURAL') DEFAULT 'RURAL',
                FOREIGN KEY (canton_id) REFERENCES cat_cantones(id)
            )
        `);
        console.log('Tabla cat_parroquias verificada.');

        // 4. Nacionalidades
        await query(`
            CREATE TABLE IF NOT EXISTS cat_nacionalidades (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL
            )
        `);
        console.log('Tabla cat_nacionalidades verificada.');

        // 5. Seguros de Salud
        await query(`
            CREATE TABLE IF NOT EXISTS cat_seguros_salud (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL
            )
        `);
        console.log('Tabla cat_seguros_salud verificada.');

        // Poblar datos básicos (Ejemplo Manabí - Chone)
        // Verificar si existen datos para no duplicar
        const provincias = await query('SELECT COUNT(*) as count FROM cat_provincias');
        if (provincias[0].count === 0) {
            console.log('Poblando datos iniciales...');
            
            // Provincias
            const resProv = await query("INSERT INTO cat_provincias (codigo, nombre) VALUES ('13', 'MANABI') RETURNING id");
            const idManabi = resProv[0].id;

            // Cantones
            const resCanton = await query("INSERT INTO cat_cantones (provincia_id, codigo, nombre) VALUES (?, '1303', 'CHONE') RETURNING id", [idManabi]);
            const idChone = resCanton[0].id;

            // Parroquias
            await query("INSERT INTO cat_parroquias (canton_id, codigo, nombre, tipo) VALUES (?, '130350', 'CHONE', 'URBANA')", [idChone]);
            await query("INSERT INTO cat_parroquias (canton_id, codigo, nombre, tipo) VALUES (?, '130351', 'SANTA RITA', 'URBANA')", [idChone]);
            await query("INSERT INTO cat_parroquias (canton_id, codigo, nombre, tipo) VALUES (?, '130352', 'BOYACA', 'RURAL')", [idChone]);
            await query("INSERT INTO cat_parroquias (canton_id, codigo, nombre, tipo) VALUES (?, '130353', 'CANUTO', 'RURAL')", [idChone]);
            
            // Nacionalidades
            await query("INSERT INTO cat_nacionalidades (nombre) VALUES ('ECUATORIANA'), ('EXTRANJERA')");

            // Seguros
            await query("INSERT INTO cat_seguros_salud (nombre) VALUES ('IESS'), ('ISSFA'), ('ISSPOL'), ('MSP'), ('PRIVADO'), ('NINGUNO')");

            // Etnias (si no existen)
            // cat_etnias ya existía, pero aseguramos datos
             const etnias = await query('SELECT COUNT(*) as count FROM cat_etnias');
             if (etnias[0].count === 0) {
                await query("INSERT INTO cat_etnias (descripcion) VALUES ('MESTIZO'), ('AFROECUATORIANO'), ('MONTUBIO'), ('INDIGENA'), ('BLANCO'), ('OTRO')");
             }
             
             // Niveles educacion (cat_instruccion ya existe)
             const instruccion = await query('SELECT COUNT(*) as count FROM cat_instruccion');
             if (instruccion[0].count === 0) {
                 await query("INSERT INTO cat_instruccion (descripcion) VALUES ('ANALFABETO'), ('PRIMARIA'), ('SECUNDARIA'), ('SUPERIOR'), ('POSTGRADO')");
             }

            console.log('Datos iniciales insertados.');
        } else {
            console.log('Las tablas ya tienen datos.');
        }

    } catch (error) {
        console.error('Error creando tablas:', error);
    } finally {
        process.exit();
    }
}

crearTablasCatalogos();
