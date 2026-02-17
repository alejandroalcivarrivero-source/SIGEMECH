require('dotenv').config({ path: 'backend/.env' });
const { Sequelize, QueryTypes } = require('sequelize');

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

    // Usar QueryTypes.SELECT para evitar problemas de parsing en MariaDB connector
    const results = await sequelize.query(
        "SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA = 'sigemech_db' AND TABLE_NAME LIKE '%motivo%'",
        { type: QueryTypes.SELECT }
    );
    
    console.log('Tables matching %motivo%:', results);

    if (results.length > 0) {
        for (const table of results) {
            const tableName = table.TABLE_NAME || table.table_name;
            console.log(`\nStructure of ${tableName}:`);
            const columns = await sequelize.query(
                `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM information_schema.columns WHERE TABLE_NAME = '${tableName}' AND TABLE_SCHEMA = 'sigemech_db'`,
                { type: QueryTypes.SELECT }
            );
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
