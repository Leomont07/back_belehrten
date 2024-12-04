const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Notificaciones = sequelize.define('Notificaciones', {
  id_notificacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER },
  descripcion: { type: DataTypes.TEXT },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'notificaciones',
  timestamps: false
});

module.exports = Notificaciones;
