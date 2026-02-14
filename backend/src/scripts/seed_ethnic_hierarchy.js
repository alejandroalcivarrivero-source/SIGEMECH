const { Etnia, NacionalidadEtnica, Pueblo } = require('../models_index');
const sequelize = require('../config/db');

async function seedEthnicHierarchy() {
    try {
        console.log('Iniciando sincronización de jerarquía étnica...');
        
        // Sincronizar tablas (usamos force: false para evitar errores de alter con mariadb en este entorno)
        await Etnia.sync();
        await NacionalidadEtnica.sync();
        await Pueblo.sync();

        // Nivel 1: Autoidentificación
        const etnias = [
            { id: 1, nombre: 'INDÍGENA' },
            { id: 2, nombre: 'AFROECUATORIANO' },
            { id: 3, nombre: 'NEGRO' },
            { id: 4, nombre: 'MULATO' },
            { id: 5, nombre: 'MONTUBIO' },
            { id: 6, nombre: 'MESTIZO' },
            { id: 7, nombre: 'BLANCO' },
            { id: 8, nombre: 'OTRO' }
        ];

        for (const etnia of etnias) {
            await Etnia.findOrCreate({
                where: { id: etnia.id },
                defaults: etnia
            });
        }
        console.log('Etnias insertadas/verificadas.');

        // Nivel 2: Nacionalidades (Vinculadas a Indígena ID: 1)
        const nacionalidades = [
            'KICHWA', 'SHUAR', 'ACHUAR', 'CHACHI', 'TSÁCHILA', 
            'AWA', 'ÉPERA', 'WAORANI', 'SIONA', 'SECOYA'
        ];

        for (const nombre of nacionalidades) {
            await NacionalidadEtnica.findOrCreate({
                where: { nombre, etniaId: 1 },
                defaults: { nombre, etniaId: 1 }
            });
        }
        console.log('Nacionalidades insertadas/verificadas.');

        // Nivel 3: Pueblos Kichwa (Vinculados a Nacionalidad Kichwa)
        // Buscamos el ID real de KICHWA para ser precisos
        const kichwaNac = await NacionalidadEtnica.findOne({ where: { nombre: 'KICHWA' } });
        
        if (kichwaNac) {
            const pueblosKichwa = [
                'OTAVALO', 'KAYAMBI', 'SARAGURO', 'PANZALEO', 'CHIBULEO', 
                'PURUHÁ', 'WARANKA', 'SALASAKA', 'KANARI', 'KITU KARA'
            ];

            for (const nombre of pueblosKichwa) {
                await Pueblo.findOrCreate({
                    where: { nombre, nacionalidadId: kichwaNac.id },
                    defaults: { nombre, nacionalidadId: kichwaNac.id }
                });
            }
            console.log('Pueblos Kichwa insertados/verificadas.');
        }

        console.log('Semillero de jerarquía étnica completado con éxito.');
        process.exit(0);
    } catch (error) {
        console.error('Error en el semillero:', error);
        process.exit(1);
    }
}

seedEthnicHierarchy();
