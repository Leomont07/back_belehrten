const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Respuesta = sequelize.define('Respuesta', {
    id_respuesta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_test: { type: DataTypes.INTEGER },
    nivel_dificultad: { type: DataTypes.STRING },
    correcta: { type: DataTypes.TINYINT },
    tiempo_respuesta: { type: DataTypes.DATE }
}, {
    tableName: 'respuestas',
    timestamps: false
});

module.exports = Respuesta;
