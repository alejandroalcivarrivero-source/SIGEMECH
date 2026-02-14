const sequelize = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    console.log('Iniciando migración de pacientes con Sequelize...');
    
    try {
        const sqlPath = path.join(__dirname, 'migracion_soberania_pacientes.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Dividir por punto y coma preservando el contenido
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`Ejecutando ${statements.length} sentencias SQL...`);
        
        for (const statement of statements) {
            // Limpiar comentarios de cada sentencia para el log
            const cleanLog = statement.split('\n').filter(line => !line.trim().startsWith('--')).join(' ');
            console.log(`Ejecutando: ${cleanLog.substring(0, 100)}...`);
            await sequelize.query(statement);
        }
        
        console.log('¡Migración completada con éxito!');
    } catch (error) {
        console.error('Error durante la migración:', error.message);
        if (error.parent) {
            console.error('Detalle del error:', error.parent.sqlMessage);
        }
    } finally {
        await sequelize.close();
    }
}

runMigration();
