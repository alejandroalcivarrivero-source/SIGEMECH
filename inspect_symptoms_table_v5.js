require('dotenv').config({ path: 'backend/.env' });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: 3306,
    dialect: 'mariadb',
    logging: false,
  }
);

async function inspectTable() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Sequelize con dialecto mariadb a veces tiene problemas con .query y metadatos.
    // Usaremos una consulta cruda simple.
    const [results, metadata] = await sequelize.query("SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA = 'sigemech_db' AND TABLE_NAME LIKE '%motivo%'");
    
    // Sequelize raw query results structure depends on dialect.
    // For MariaDB, results might be directly the array of objects if type is SELECT.
    console.log('Tables matching %motivo%:', results);

    let tables = results;
    // Si results es un array de objetos con TABLE_NAME
    if (tables && tables.length > 0) {
        for (const table of tables) {
            const tableName = table.TABLE_NAME || table.table_name;
            console.log(`\nStructure of ${tableName}:`);
            const [columns, meta] = await sequelize.query(`
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
                FROM information_schema.columns
                WHERE TABLE_NAME = '${tableName}' AND TABLE_SCHEMA = 'sigemech_db';
            `);
            console.table(columns);
        }
    } else {
        console.log("No tables found matching '%motivo%'");
    }

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

inspectTable();
