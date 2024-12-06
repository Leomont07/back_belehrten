const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PlanEstudios = sequelize.define('PlanEstudios', {
    id_plan: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_usuario: { type: DataTypes.INTEGER },
    nivel_inicial: { type: DataTypes.STRING },
    nivel_destino: { type: DataTypes.STRING },
    fecha_generacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    contenido: { type: DataTypes.TEXT } 
}, {
    tableName: 'planes_estudio',
    timestamps: false
});

module.exports = PlanEstudios;
