const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Admision extends Model {}

  Admision.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    unidad_transporte: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'unidad_transporte'
    },
    paciente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pacientes', // Corresponde al nombre de la tabla de Paciente
        key: 'id'
      }
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'usuario_id',
        references: {
            model: 'usuarios', // Asegúrate que la tabla de usuarios se llame así
            key: 'id'
        }
    },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'estado'
    },
    fecha_llegada: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'fecha_llegada'
    },
    fecha_admision: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'fecha_admision'
    },
    motivo_consulta: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'motivo_consulta'
    },
    enfermedad_actual: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'enfermedad_actual'
    },
  }, {
    sequelize,
    tableName: 'admisiones_emergencia',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  });

  return Admision;
};
