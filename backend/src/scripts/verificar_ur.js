const { query } = require('../config/db');

async function verificarColumnasUsuariosRoles() {
    try {
        const urCols = await query('DESCRIBE usuarios_roles', []);
        console.log('✅ Estructura de tabla usuarios_roles:', urCols);
    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        process.exit();
    }
}

verificarColumnasUsuariosRoles();
