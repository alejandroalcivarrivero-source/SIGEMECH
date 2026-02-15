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
    id_tipo_identificacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_tipo_identificacion'
    },
    numero_documento: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'numero_documento'
    },
    primer_nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'primer_nombre'
    },
    segundo_nombre: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'segundo_nombre'
    },
    primer_apellido: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'primer_apellido'
    },
    segundo_apellido: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'segundo_apellido'
    },
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'fecha_nacimiento'
    },
    id_sexo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'id_sexo'
    },
    id_genero: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'id_genero'
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'direccion'
    },
    referencia_domicilio: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'referencia_domicilio'
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'telefono'
    },
    telefono_fijo: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'telefono_fijo'
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: { isEmail: true },
        field: 'email'
    },
    id_nacionalidad: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'id_nacionalidad'
    },
    id_parroquia: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'id_parroquia'
    },
    lugar_nacimiento: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'lugar_nacimiento'
    },
    id_etnia: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'id_etnia'
    },
    id_nacionalidad_etnica: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'id_nacionalidad_etnica'
    },
    id_pueblo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'id_pueblo'
    },
    id_estado_civil: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'id_estado_civil'
    },
    id_instruccion: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'id_instruccion'
    },
    ocupacion: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'ocupacion'
    },
    tipo_empresa: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'tipo_empresa'
    },
    tiene_discapacidad: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'tiene_discapacidad'
    },
    tipo_discapacidad: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'tipo_discapacidad'
    },
    porcentaje_discapacidad: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'porcentaje_discapacidad'
    },
    carnet_discapacidad: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'carnet_discapacidad'
    },
    nombre_representante: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'nombre_representante'
    },
    id_tipo_doc_representante: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'id_tipo_doc_representante'
    },
    documento_representante: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'documento_representante'
    },
    id_parentesco_representante: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'id_parentesco_representante'
    },
    creado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'creado_por'
    },
    id_seguro_salud: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'id_seguro_salud'
    },
  }, {
    sequelize,
    modelName: 'Paciente',
    tableName: 'pacientes',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    freezeTableName: true,
    hooks: {
      beforeValidate: (paciente) => {
        normalizeStrings(paciente, [
          'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido',
          'direccion', 'referencia_domicilio', 'lugar_nacimiento', 'ocupacion',
          'tipo_empresa', 'nombre_representante'
        ]);
      }
    }
  });

  return Paciente;
};
