const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const User = sequelize.define('User', {
    id_usuario: { 
        type: DataTypes.INTEGER, 
        primaryKey: true,
        autoIncrement: true
    },
    nombre: { type: DataTypes.STRING, allowNull: false, unique: false },
    apellido_pat: { type: DataTypes.STRING, allowNull: false, unique: false },
    apellido_mat: { type: DataTypes.STRING, allowNull: false, unique: false },
    edad: { type: DataTypes.INTEGER, allowNull: false, unique: false },
    tipo: { type: DataTypes.INTEGER, allowNull: false, unique: false, defaultValue: 1 },
    correo: { type: DataTypes.STRING, allowNull: false, unique: true },
    fecha_registro: { type: DataTypes.DATE, allowNull: false, unique: true },
    psw: { type: DataTypes.STRING, allowNull: false },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    verificationToken: { type: DataTypes.STRING, allowNull: true },
    tipo: { type: DataTypes.INTEGER, allowNull: false },
    isLogin: { type: DataTypes.INTEGER, allowNull: false },
    passwordToken: { type: DataTypes.STRING, allowNull: true },
}, {
    tableName: 'usuario',
    timestamps: false 
});

module.exports = User;
