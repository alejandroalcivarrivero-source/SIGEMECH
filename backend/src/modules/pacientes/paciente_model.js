const { DataTypes, Model } = require('sequelize');
const { normalizeStrings } = require('../../config/model_helper');

module.exports = (sequelize) => {
    class Paciente extends Model {}

    Paciente.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        // ... otros campos
    }, {
        sequelize,
        modelName: 'Paciente',
        tableName: 'pac_pacientes',
        timestamps: true,
        underscored: true,
        freezeTableName: true,
        hooks: {
            beforeValidate: (paciente) => {
                normalizeStrings(paciente, ['primer_nombre', 'segundo_nombre', 'apellido_paterno', 'apellido_materno']);
            }
        }
    });

    return Paciente;
};
