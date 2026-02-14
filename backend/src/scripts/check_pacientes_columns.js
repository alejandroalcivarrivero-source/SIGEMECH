const sequelize = require('../config/db');

async function checkColumns() {
    try {
        const results = await sequelize.query("SHOW COLUMNS FROM pacientes", {
            type: sequelize.QueryTypes.SELECT
        });
        console.log('Columnas actuales en tabla pacientes:');
        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error('Error obteniendo columnas:', error);
    } finally {
        await sequelize.close();
    }
}

checkColumns();
