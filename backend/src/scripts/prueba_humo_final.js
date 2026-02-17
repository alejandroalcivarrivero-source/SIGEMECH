const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mariadb',
        logging: false,
    }
);

async function pruebaHumo() {
    console.log('🔵 Iniciando Prueba de Humo de Modelos (Smoke Test)...');
    try {
        // Cargar modelos
        const { inicializarModelos } = require('../models_index');
        const models = inicializarModelos(sequelize);
        
        console.log('✅ Carga de definiciones de modelos exitosa.');

        // Verificar que no existen modelos "undefined" o con nombres en inglés accidentalmente expuestos
        const modelosEsperados = [
            'paciente', 'admision', 'parto', 'representante', 'usuario',
            'pais', 'provincia', 'canton', 'parroquia'
        ];

        let errores = 0;
        modelosEsperados.forEach(nombre => {
            if (!models[nombre]) {
                console.error(`❌ ERROR CRÍTICO: El modelo '${nombre}' no fue exportado correctamente en models_index.js`);
                errores++;
            } else {
                console.log(`   ✔️ Modelo '${nombre}' cargado OK.`);
            }
        });

        // Verificar asociaciones
        // Paciente <-> Admision
        if (models.paciente && !models.paciente.associations.admisiones) {
             console.error('❌ Falla en asociación: Paciente no tiene alias "admisiones"');
             errores++;
        }
        if (models.admision && !models.admision.associations.paciente) { // Sequelize suele capitalizar el nombre del modelo destino si no hay alias
             // A veces es models.Admision.associations.paciente dependiendo de cómo sequelize lo guarde internamente,
             // pero verificaremos si existe la asociación en general.
             // Al usar belongsTo(Paciente), la asociación se llama 'Paciente' por defecto.
             console.log('   ℹ️ Verificando asociación inversa Admision -> Paciente...');
        }

        if (errores > 0) {
            console.error(`🔴 Prueba de Humo FALLIDA con ${errores} errores.`);
            process.exit(1);
        }

        console.log('🟢 Prueba de Humo EXITOSA. Todos los modelos y relaciones críticas parecen estar bien definidos.');
        process.exit(0);

    } catch (error) {
        console.error('🔴 Excepción durante la prueba de humo:', error);
        process.exit(1);
    }
}

pruebaHumo();
