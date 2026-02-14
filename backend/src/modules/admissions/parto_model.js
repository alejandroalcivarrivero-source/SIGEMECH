const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const EstablecimientoSalud = sequelize.define('cat_establecimientos_salud', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    timestamps: false
});

const Parto = sequelize.define('adm_partos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    paciente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID del Recién Nacido'
    },
    madre_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID de la Madre'
    },
    id_lugar_parto: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    fecha_hora_parto: {
        type: DataTypes.DATE,
        allowNull: true
    },
    peso_gramos: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    talla_cm: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    perimetro_cefalico: {
        type: DataTypes.DECIMAL(5, 2)
    },
    perimetro_braquial: {
        type: DataTypes.DECIMAL(5, 2)
    },
    perimetro_toracico: {
        type: DataTypes.DECIMAL(5, 2)
    },
    apgar_5min: {
        type: DataTypes.INTEGER
    },
    apgar_10min: {
        type: DataTypes.INTEGER
    },
    tipo_parto: {
        type: DataTypes.STRING(50)
    },
    posicion_parto: {
        type: DataTypes.STRING(50)
    },
    entrega_placenta: {
        type: DataTypes.STRING(50)
    },
    hb_aplicada: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    bcg_aplicada: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    id_responsable_atencion_rn: {
        type: DataTypes.INTEGER
    },
    id_responsable_parto: {
        type: DataTypes.INTEGER
    },
    admision_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Vínculo con la admisión de emergencia'
    }
});

module.exports = { EstablecimientoSalud, Parto };
