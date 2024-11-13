const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Test = sequelize.define('Test', {
    id_test: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_usuario: { type: DataTypes.INTEGER },
    fecha_inicio: { type: DataTypes.DATE },
    fecha_fin: { type: DataTypes.DATE },
    nivel_inicial: { type: DataTypes.STRING },
    nivel_final: { type: DataTypes.STRING },
    puntaje_total: { type: DataTypes.FLOAT },
    duracion_total: { type: DataTypes.INTEGER },
    estado: { type: DataTypes.STRING, defaultValue: 'en progreso' }
}, {
    tableName: 'test',
    timestamps: false
});

module.exports = Test;
