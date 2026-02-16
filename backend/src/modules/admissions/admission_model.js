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
  }, {
    sequelize,
    tableName: 'admisiones_emergencia',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  });

  return Admision;
};
