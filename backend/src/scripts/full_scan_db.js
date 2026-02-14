const sequelize = require('../config/db');

async function fullScan() {
    try {
        console.log('--- ESCANEO INTEGRAL DE BASE DE DATOS ---');
        await sequelize.authenticate();
        
        const tablas = await sequelize.query('SHOW TABLES', { type: sequelize.QueryTypes.SELECT });
        const nombresTablas = tablas.map(t => Object.values(t)[0]);
        console.log('Tablas detectadas:', nombresTablas);

        for (const tabla of nombresTablas) {
            console.log(`\n--- Estructura de: ${tabla} ---`);
            const cols = await sequelize.query(`DESCRIBE ${tabla}`, { type: sequelize.QueryTypes.SELECT });
            cols.forEach(c => {
                console.log(`${c.Field} | ${c.Type} | Null: ${c.Null} | Key: ${c.Key} | Default: ${c.Default}`);
            });
        }

    } catch (error) {
        console.error('Error durante el escaneo:', error);
    } finally {
        process.exit();
    }
}

fullScan();
