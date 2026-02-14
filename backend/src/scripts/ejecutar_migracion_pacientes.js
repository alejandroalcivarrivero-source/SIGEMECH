const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    console.log('Conectado a MariaDB en', process.env.DB_HOST);

    try {
        const sqlPath = path.join(__dirname, 'migracion_soberania_pacientes.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Ejecutando script de migración...');
        await connection.query(sql);
        console.log('¡Migración completada con éxito!');
    } catch (error) {
        console.error('Error durante la migración:', error);
    } finally {
        await connection.end();
    }
}

runMigration();
