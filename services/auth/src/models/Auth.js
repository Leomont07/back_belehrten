const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Auth = sequelize.define('Auth', {}, {
  timestamps: false
});

module.exports = Auth;
