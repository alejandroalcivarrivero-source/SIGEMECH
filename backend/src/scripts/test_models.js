const { sequelize, inicializar } = require('../config/db');
// require('../models_index'); // No es necesario requerirlo aquí si ya lo usa config/db.js o si lo inicializamos explícitamente

async function testModels() {
    try {
        // En lugar de llamar solo a authenticate, llamamos a la lógica de inicialización
        // que carga los modelos.
        // O alternativamente, cargamos los modelos manualmente aquí si inicializar() hace sync y no queremos sync.
        
        await sequelize.authenticate();
        console.log('Conexión establecida exitosamente.');
        
        // Importante: Asegurar que los modelos estén definidos en la instancia sequelize
        const { inicializarModelos } = require('../models_index');
        inicializarModelos(sequelize);

        const models = Object.keys(sequelize.models);
        console.log('Modelos cargados:', models);
        
        // Verificar estándares
        const excepciones = ['Usuario', 'Paciente', 'Provincia', 'Canton', 'Parroquia', 'Admision', 'Parto', 'Representante', 'Pais'];
        const catalogosSinPrefijo = models.filter(m => 
            !excepciones.includes(m) &&
            !sequelize.models[m].tableName.startsWith('cat_')
        );

        // Mapeo inverso para verificar nombres de tablas
        const detallesModelos = models.map(m => ({
            modelo: m,
            tabla: sequelize.models[m].tableName
        }));
        
        console.log('Detalle de Tablas:', JSON.stringify(detallesModelos, null, 2));
        
        if (catalogosSinPrefijo.length > 0) {
            console.warn('Advertencia: Posibles catálogos sin prefijo cat_ en tableName (o modelos no exceptuados):', 
                catalogosSinPrefijo.map(m => `${m} (${sequelize.models[m].tableName})`)
            );
        } else {
            console.log('Validación de nomenclatura de tablas (cat_*) correcta para catálogos.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error al cargar modelos:', error);
        process.exit(1);
    }
}

testModels();
