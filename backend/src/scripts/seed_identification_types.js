const { TipoIdentificacion } = require('../models_index');

async function seedIdentificationTypes() {
    try {
        console.log('Iniciando carga de tipos de identificación...');
        
        // Sincronizar el modelo para crear la tabla si no existe
        await TipoIdentificacion.sync();
        
        const types = [
            { id: 1, nombre: 'Cédula de Identidad' },
            { id: 2, nombre: 'Pasaporte' },
            { id: 3, nombre: 'Visa' },
            { id: 4, nombre: 'Carnet de Refugiado' },
            { id: 5, nombre: 'No Identificado' }
        ];

        for (const type of types) {
            await TipoIdentificacion.findOrCreate({
                where: { id: type.id },
                defaults: type
            });
        }

        console.log('Carga de tipos de identificación completada con éxito.');
        process.exit(0);
    } catch (error) {
        console.error('Error cargando tipos de identificación:', error);
        process.exit(1);
    }
}

seedIdentificationTypes();
