const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PlanEstudios = sequelize.define('PlanEstudios', {
    id_plan: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_usuario: { type: DataTypes.INTEGER },
    nivel_inicial: { type: DataTypes.STRING },
    nivel_final: { type: DataTypes.STRING },
    fecha_generacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    contenido: { type: DataTypes.TEXT } // JSON con el detalle del plan
}, {
    tableName: 'planes_estudios',
    timestamps: false
});

module.exports = PlanEstudios;