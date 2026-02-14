const sequelize = require('../config/db');
require('../models_index');

async function testModels() {
    try {
        await sequelize.authenticate();
        console.log('Conexión establecida exitosamente.');
        
        const models = Object.keys(sequelize.models);
        console.log('Modelos cargados:', models);
        
        // Verificar estándares
        const catalogosSinPrefijo = models.filter(m => 
            !['User', 'Paciente', 'Province', 'Canton', 'Parish', 'EmergencyAdmission'].includes(m) && 
            !sequelize.models[m].tableName.startsWith('cat_')
        );
        
        if (catalogosSinPrefijo.length > 0) {
            console.warn('Advertencia: Catálogos sin prefijo cat_ en tableName:', catalogosSinPrefijo.map(m => `${m} (${sequelize.models[m].tableName})`));
        } else {
            console.log('Todos los catálogos tienen el prefijo cat_ correctamente.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error al cargar modelos:', error);
        process.exit(1);
    }
}

testModels();
