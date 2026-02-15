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
    // ... otros campos
  }, {
    sequelize,
    tableName: 'admisiones_emergencia',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  });

  return Admision;
};
