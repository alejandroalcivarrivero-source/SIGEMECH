const { EstablecimientoSalud, Parto } = require('../modules/admissions/parto_model');
const sequelize = require('../config/db');

async function seedPartos() {
    try {
        await sequelize.sync();
        
        const establecimientos = [
            'Centro de Salud Tipo C Chone',
            'Clinica Zambrano',
            'Clinica Santa Martha',
            'Hospital del Dia',
            'Hospital Padre Miguel Fitzgerald',
            'Hospital Miguel Hilario Alcivar',
            'Hospital Verdi Cevallos Balda',
            'Hospital Napoleon Davila Cordova',
            'Hospital de Especialidades',
            'Hospital Anibal Gonzalez',
            'Hospital Basico Flavio Alfaro'
        ];

        for (const nombre of establecimientos) {
            await EstablecimientoSalud.findOrCreate({
                where: { nombre }
            });
        }

        console.log('Tablas creadas y establecimientos insertados correctamente.');
        process.exit(0);
    } catch (error) {
        console.error('Error al sincronizar/insertar datos:', error);
        process.exit(1);
    }
}

seedPartos();
