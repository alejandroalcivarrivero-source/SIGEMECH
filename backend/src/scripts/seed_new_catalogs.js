const { Sexo, EstadoCivil, Genero } = require('../models_index');
const sequelize = require('../config/db');

async function seedCatalogos() {
    try {
        await sequelize.sync(); // Asegurar que las tablas existen

        const sexosCount = await Sexo.count();
        if (sexosCount === 0) {
            await Sexo.bulkCreate([
                { nombre: 'HOMBRE' },
                { nombre: 'MUJER' }
            ]);
            console.log('Catálogo de Sexos sembrado.');
        }

        const estadosCount = await EstadoCivil.count();
        if (estadosCount === 0) {
            await EstadoCivil.bulkCreate([
                { nombre: 'SOLTERO/A' },
                { nombre: 'CASADO/A' },
                { nombre: 'DIVORCIADO/A' },
                { nombre: 'VIUDO/A' },
                { nombre: 'UNIÓN DE HECHO' }
            ]);
            console.log('Catálogo de Estados Civiles sembrado.');
        }

        const generosCount = await Genero.count();
        if (generosCount === 0) {
            await Genero.bulkCreate([
                { nombre: 'MASCULINO' },
                { nombre: 'FEMENINO' },
                { nombre: 'TRANSGÉNERO' },
                { nombre: 'OTRO' }
            ]);
            console.log('Catálogo de Géneros sembrado.');
        }

        console.log('Proceso de siembra de catálogos finalizado.');
        process.exit(0);
    } catch (error) {
        console.error('Error sembrando catálogos:', error);
        process.exit(1);
    }
}

seedCatalogos();
