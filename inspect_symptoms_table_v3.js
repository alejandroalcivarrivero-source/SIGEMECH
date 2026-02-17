require('dotenv').config({ path: 'backend/.env' });
const { Sequelize } = require('sequelize');

// Asegurar que usamos MariaDB
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: 3306, // Puerto estándar de MariaDB/MySQL
    dialect: 'mariadb',
    logging: false,
  }
);

async function inspectTable() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Consulta para MariaDB/MySQL
    const [results, metadata] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name LIKE '%motivo%'");
    console.log('Tables matching %motivo%:', results);

    if (results.length > 0) {
        for (const table of results) {
            const tableName = table.table_name || table.TABLE_NAME; // Ajuste por si el driver devuelve mayúsculas
            console.log(`\nStructure of ${tableName}:`);
            const [columns, meta] = await sequelize.query(`
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
                FROM information_schema.columns
                WHERE table_name = '${tableName}' AND table_schema = DATABASE();
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
