const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// Cargar .env desde el directorio backend
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mariadb',
        logging: false
    }
);

async function migrarProvincias() {
    try {
        console.log('Iniciando migración de cat_provincias...');
        await sequelize.authenticate();
        console.log('Conexión exitosa a la base de datos.');
        
        // 1. Agregar la columna codigo_inec
        await sequelize.query("ALTER TABLE cat_provincias ADD COLUMN IF NOT EXISTS codigo_inec VARCHAR(2)");
        console.log('Columna codigo_inec verificada/agregada.');

        const provinciasMap = {
            'AZUAY': '01',
            'BOLIVAR': '02',
            'CAÑAR': '03',
            'CARCHI': '04',
            'COTOPAXI': '05',
            'CHIMBORAZO': '06',
            'EL ORO': '07',
            'ESMERALDAS': '08',
            'GUAYAS': '09',
            'IMBABURA': '10',
            'LOJA': '11',
            'LOS RIOS': '12',
            'MANABI': '13',
            'MORONA SANTIAGO': '14',
            'NAPO': '15',
            'PASTAZA': '16',
            'PICHINCHA': '17',
            'TUNGURAHUA': '18',
            'ZAMORA CHINCHIPE': '19',
            'GALAPAGOS': '20',
            'SUCUMBIOS': '21',
            'ORELLANA': '22',
            'SANTO DOMINGO DE LOS TSACHILAS': '23',
            'SANTA ELENA': '24',
            'ZONAS NO DELIMITADAS': '90'
        };

        for (const [nombre, codigo] of Object.entries(provinciasMap)) {
            await sequelize.query(
                "UPDATE cat_provincias SET codigo_inec = ? WHERE UPPER(nombre) = ?",
                { replacements: [codigo, nombre] }
            );
            console.log(`Actualizado: ${nombre} -> ${codigo}`);
        }

        // 2. Hacer la columna NOT NULL después de poblarla
        const [results] = await sequelize.query("SELECT COUNT(*) as count FROM cat_provincias WHERE codigo_inec IS NULL", { type: Sequelize.QueryTypes.SELECT });
        if (results.count === 0) {
            await sequelize.query("ALTER TABLE cat_provincias MODIFY COLUMN codigo_inec VARCHAR(2) NOT NULL");
            console.log('Columna codigo_inec establecida como NOT NULL.');
        } else {
            console.warn(`Advertencia: Hay ${results.count} provincias sin código INEC. No se pudo aplicar NOT NULL.`);
        }

        console.log('Migración completada con éxito.');
        process.exit(0);
    } catch (error) {
        console.error('Error durante la migración:', error);
        process.exit(1);
    }
}

migrarProvincias();
