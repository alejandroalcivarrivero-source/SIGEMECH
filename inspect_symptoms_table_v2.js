require('dotenv').config({ path: 'backend/.env' });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

async function inspectTable() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    const [results, metadata] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%motivo%'");
    console.log('Tables matching %motivo%:', results);

    if (results.length > 0) {
        for (const table of results) {
            const tableName = table.table_name;
            console.log(`\nStructure of ${tableName}:`);
            const [columns, meta] = await sequelize.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = '${tableName}';
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
