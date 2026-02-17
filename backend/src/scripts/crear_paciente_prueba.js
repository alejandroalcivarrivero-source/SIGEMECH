const { sequelize } = require("../config/db");
const { Paciente, AdmisionEmergencia } = require("../modules/pacientes/paciente_model");
const { Op } = require("sequelize");

const { inicializarModelos } = require("../models_index");

async function crear_paciente_prueba() {
  const transaction = await sequelize.transaction();
  try {
    const { Paciente, AdmisionEmergencia } = inicializarModelos(sequelize);
    // Crear paciente
    const [paciente, created] = await Paciente.findOrCreate({
      where: { primer_nombre: "MADRE", primer_apellido: "DE PRUEBA" },
      defaults: {
        primer_nombre: "MADRE",
        segundo_nombre: "SANTA",
        primer_apellido: "DE PRUEBA",
        segundo_apellido: "ANONIMA",
        tipo_identificacion_id: 1, // CEDULA
        numero_identificacion: "9999999999",
        fecha_nacimiento: "1990-01-01",
        nacionalidad: "ECUATORIANA",
        genero_id: 2, // FEMENINO
        esta_activo: true,
        fecha_creacion: new Date(),
      },
      transaction,
    });

    if (created) {
      console.log("Paciente 'MADRE DE PRUEBA' creado con ID:", paciente.paciente_id);
    } else {
      console.log("Paciente 'MADRE DE PRUEBA' ya existe con ID:", paciente.paciente_id);
    }

    // Crear admisión de emergencia
    const fecha_admision = new Date();
    fecha_admision.setHours(fecha_admision.getHours() - 12);

    const admision = await AdmisionEmergencia.create({
      paciente_id: paciente.paciente_id,
      fecha_admision: fecha_admision,
      hora_admision: fecha_admision.toTimeString().split(" ")[0],
      viene_referido: false,
      esta_activo: true,
      fecha_creacion: new Date(),
      // Otros campos obligatorios pueden ir aquí con valores por defecto
    }, { transaction });

    console.log("Admisión de emergencia creada con ID:", admision.admision_id);

    await transaction.commit();
    console.log("Script finalizado exitosamente. Paciente y admisión creados.");
  } catch (error) {
      await transaction.rollback();
      console.error("Error durante la transacción, se hizo rollback:", error);
    }
  } catch (error) {
    console.error("Error en el script:", error);
  } finally {
    console.log("Cerrando conexión.");
    await sequelize.close();
  }
}

crear_paciente_prueba();
