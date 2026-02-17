// scripts/crear_paciente_prueba_estricto.js
const { sequelize } = require('../config/db');
const { inicializarModelos } = require('../models_index');

/**
 * Script de prueba para crear un paciente materno para el flujo de neonatos.
 * Utiliza estrictamente los nombres de campo de la BDD (`snake_case`).
 * Cédula: 9999999999
 * Sexo: Femenino (ID 2)
 */
async function crearPacienteMaternoPrueba() {
  try {
    console.log("Inicializando modelos...");
    inicializarModelos(sequelize); // Corregido: Pasar la instancia de sequelize
    const { Paciente } = sequelize.models;

    if (!Paciente) {
      throw new Error("El modelo Paciente no está disponible. Verifica models_index.js");
    }

    const numero_documento_prueba = '9999999999';

    console.log(`Verificando si el paciente con documento ${numero_documento_prueba} ya existe...`);
    
    let paciente = await Paciente.findOne({ where: { numero_documento: numero_documento_prueba } });

    const datosPaciente = {
        id_tipo_identificacion: 1, // Cédula
        numero_documento: numero_documento_prueba,
        primer_nombre: 'PRUEBA',
        primer_apellido: 'MATERNA',
        fecha_nacimiento: '1990-01-15',
        id_sexo: 2, // Femenino
        id_estado_civil: 1, // Soltero/a
        id_nacionalidad: 1, // ECUATORIANA
        creado_por: 1, // Usuario Sistema
        esta_activo: true
    };

    if (paciente) {
      console.log("Paciente encontrado. Actualizando para asegurar consistencia de la prueba...");
      await paciente.update(datosPaciente);
    } else {
      console.log("Paciente no encontrado. Creando nuevo paciente de prueba...");
      paciente = await Paciente.create(datosPaciente);
    }

    console.log('--- Paciente de Prueba Procesado ---');
    console.log('ID:', paciente.id);
    console.log('Documento:', paciente.numero_documento);
    console.log('Nombres:', `${paciente.primer_nombre} ${paciente.primer_apellido}`);
    console.log('ID Sexo:', paciente.id_sexo);
    console.log('------------------------------------');
    console.log("Script finalizado exitosamente.");

  } catch (error) {
    console.error("Error durante la ejecución del script de prueba:", error);
  } finally {
    await sequelize.close();
    console.log("Conexión a la base de datos cerrada.");
  }
}

crearPacienteMaternoPrueba();
