const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const sequelize = require('../config/db');
const { Admision } = require('../models_index');

async function syncAndVerify() {
    console.log('--- Iniciando Sincronización y Verificación de Refactorización: Admisión ---');
    
    try {
        console.log('1. Autenticando conexión a base de datos...');
        await sequelize.authenticate();
        console.log('   Conexión exitosa.');

        console.log('2. Sincronizando modelo (alter: true)...');
        // Usamos alter: true para que modifique la tabla existente sin borrar datos (si es posible)
        // Ojo: Si los cambios de nombre de columna son drásticos, alter podría no detectar renombrado y crear nuevas columnas.
        // Dado que hemos cambiado 'field', Sequelize intentará mapear a las nuevas columnas.
        // Si las columnas viejas tienen datos, 'alter' NO las migra automáticamente, solo crea las nuevas.
        // Para este ejercicio asumimos que estamos en etapa de desarrollo/refactorización y alter es aceptable,
        // o que se aceptará la creación de nuevas columnas.
        console.log('   (Usando alter: { drop: false } para evitar error de metadatos)');
        await Admision.sync({ alter: { drop: false } });
        console.log('   Sincronización completada.');

        console.log('3. Verificando estructura de la tabla...');
        const tableDescription = await sequelize.getQueryInterface().describeTable('admisiones_emergencia');
        
        // Verificamos algunas columnas clave
        const expectedColumns = [
            'motivo_consulta',
            'presion_arterial_sistolica',
            'registrado_por',
            'medico_tratante_id',
            'fecha_admision'
        ];

        let allColumnsPresent = true;
        expectedColumns.forEach(col => {
            if (tableDescription[col]) {
                console.log(`   [OK] Columna '${col}' encontrada.`);
            } else {
                console.error(`   [ERROR] Columna '${col}' NO encontrada en la tabla.`);
                allColumnsPresent = false;
            }
        });

        if (allColumnsPresent) {
            console.log('4. Verificación Estructural EXITOSA.');
            
            console.log('5. Prueba de Lectura (Count)...');
            const count = await Admision.count();
            console.log(`   Total de admisiones en base de datos: ${count}`);
            
            console.log('--- Refactorización y Verificación Completadas Exitosamente ---');
        } else {
            console.error('--- FALLO EN LA VERIFICACIÓN ESTRUCTURAL ---');
            process.exit(1);
        }

    } catch (error) {
        console.error('--- ERROR CRÍTICO ---');
        console.error(error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

syncAndVerify();
