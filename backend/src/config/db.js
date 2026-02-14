const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Configuración de Sequelize para MariaDB/MySQL
 * Se utiliza snake_case para la base de datos y camelCase para el código.
 */
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mariadb',
        dialectOptions: {
            connectTimeout: 10000
        },
        define: {
            underscored: true, // Usa snake_case para campos generados automáticamente (createdAt, etc.)
            timestamps: true,
            freezeTableName: true // Evita que Sequelize pluralice los nombres de las tablas
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente con Sequelize.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
};

testConnection();

module.exports = sequelize;
