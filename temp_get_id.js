
require('dotenv').config({ path: './backend/.env' });
const { sequelize } = require('./backend/src/config/db');
const { inicializarModelos } = require('./backend/src/models_index');
const { Op } = require('sequelize');

async function findEcuatorianaId() {
    try {
        await sequelize.authenticate();
        const { Nacionalidad } = inicializarModelos(sequelize);
        
        const ecuatoriana = await Nacionalidad.findOne({
            where: {
                nombre: 'ECUATORIANA'
            }
        });

        if (ecuatoriana) {
            console.log(`El ID de la nacionalidad 'ECUATORIANA' es: ${ecuatoriana.id}`);
        } else {
            console.log("No se encontró la nacionalidad 'ECUATORIANA'. Buscando sinónimos...");
            const ecuatorianaLike = await Nacionalidad.findOne({
                where: {
                    nombre: {
                        [Op.like]: '%ECUATORIANA%'
                    }
                }
            });
             if (ecuatorianaLike) {
                 console.log(`Se encontró una coincidencia: ID ${ecuatorianaLike.id} para '${ecuatorianaLike.nombre}'`);
             } else {
                console.log("No se encontró ninguna coincidencia para 'ECUATORIANA'.");
             }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

findEcuatorianaId();
