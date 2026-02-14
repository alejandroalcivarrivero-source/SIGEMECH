const sequelize = require('../config/db');

async function diagnosticarDB() {
    try {
        console.log('Iniciando diagnóstico de base de datos...');
        
        // 1. Verificar conexión
        await sequelize.authenticate();
        console.log('✅ Conexión a base de datos exitosa.');

        // 2. Verificar tablas
        const tablas = await sequelize.query('SHOW TABLES', { type: sequelize.QueryTypes.SELECT });
        console.log('✅ Tablas encontradas:', tablas.map(t => Object.values(t)[0]));

        // 3. Verificar estructura de usuarios
        try {
            const usuariosCols = await sequelize.query('DESCRIBE usuarios', { type: sequelize.QueryTypes.SELECT });
            console.log('✅ Estructura de tabla usuarios:', usuariosCols.map(c => c.Field));
            console.log('Detalle de columnas:', usuariosCols.map(c => `${c.Field} (${c.Type})`));
        } catch (e) {
            console.error('❌ Error al describir tabla usuarios:', e.message);
        }

        // 4. Verificar estructura de roles
        try {
            const rolesCols = await sequelize.query('DESCRIBE roles', { type: sequelize.QueryTypes.SELECT });
            console.log('✅ Estructura de tabla roles:', rolesCols.map(c => c.Field));
        } catch (e) {
            console.error('❌ Error al describir tabla roles:', e.message);
        }

        // 5. Verificar estructura de usuarios_roles
        try {
            const urCols = await sequelize.query('DESCRIBE usuarios_roles', { type: sequelize.QueryTypes.SELECT });
            console.log('✅ Estructura de tabla usuarios_roles:', urCols.map(c => c.Field));
        } catch (e) {
            console.error('❌ Error al describir tabla usuarios_roles:', e.message);
        }

        // 6. Verificar usuario administrador (si existe)
        try {
            const users = await sequelize.query('SELECT * FROM usuarios LIMIT 5', { type: sequelize.QueryTypes.SELECT });
            console.log('ℹ️ Primeros usuarios en DB (muestra de datos):', users);
        } catch (e) {
             console.error('❌ Error al consultar usuarios:', e.message);
        }

    } catch (error) {
        console.error('❌ Error general en diagnóstico:', error);
    } finally {
        process.exit();
    }
}

diagnosticarDB();
