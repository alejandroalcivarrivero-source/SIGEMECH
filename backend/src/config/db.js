const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const { inicializarModelos } = require('../models_index');

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mariadb',
        define: { underscored: true, timestamps: true, freezeTableName: true },
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        dialectOptions: {
            connectTimeout: 5000
        },
    }
);

const inicializar = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida exitosamente.');
        
        const models = inicializarModelos(sequelize);
        console.log('Modelos inicializados.');

        // await sequelize.sync({ alter: true }); // Desactivado para modo producción/estable
        console.log('Sincronización de modelos desactivada en modo estable.');
    } catch (error) {
        console.error('No se pudo conectar o sincronizar la base de datos:', error);
        process.exit(1); // Salir si la BD no está disponible
    }
};

module.exports = {
    sequelize,
    inicializar
};
