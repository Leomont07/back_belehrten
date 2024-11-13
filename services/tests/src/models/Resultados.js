const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Resultados = sequelize.define('Resultados', {
    id_resultado: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_test: { type: DataTypes.INTEGER },
    nivel_final: { type: DataTypes.STRING },
    puntaje: { type: DataTypes.FLOAT },
    duracion: { type: DataTypes.INTEGER }
}, {
    tableName: 'resultados',
    timestamps: false
});

module.exports = Resultados;