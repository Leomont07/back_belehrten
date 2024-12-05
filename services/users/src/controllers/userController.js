const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { crearNotificacion } = require('../../../notifications/src/controllers/notificacionesController');


exports.users = async (req, res) => {
    try {
        res.status(200).json({ message: 'Servicio corriendo de manera correcta' });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

exports.register = async (req, res) => {
    try {
        const { nombre, apellido_pat, apellido_mat, edad, psw, correo, fecha_registro } = req.body;

        const verificarExistencia = await User.findOne({ where: { correo } });
        if (verificarExistencia) {
            return res.status(400).json({ error: 'Este correo ya está registrado.' });
        }

        const hashedPassword = await bcrypt.hash(psw, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const user = await User.create({ nombre, apellido_pat, apellido_mat, edad, psw: hashedPassword, correo, fecha_registro, isVerified: false, verificationToken });

        await sendVerificationEmail(user, verificationToken);

        res.status(201).json({ message: 'Usuario registrado exitosamente. Verifica tu correo para activar tu cuenta.', user });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar usuario' + error });
    }
};

const sendVerificationEmail = async (user, token) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.ionos.mx',
        port: 587,
        secure: false,
        auth: {
            user: 'leonsiu@lexius.mx',
            pass: 'Leonardocr7.',
        }
    });

    const mailOptions = {
        from: 'leonsiu@lexius.mx',
        to: user.correo,
        subject: 'Verificación de correo electrónico',
        html: `<p>Hola ${user.nombre},</p>
               <p>Por favor verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
               <a href="https://back-belehrten.onrender.com/verificar?token=${token}">Verificar correo</a>`
    };

    await transporter.sendMail(mailOptions);
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        // Buscar al usuario por el token de verificación
        const user = await User.findOne({ where: { verificationToken: token } });

        if (!user) {
            return res.status(400).json({ error: 'Token de verificación inválido o expirado' });
        }

        // Actualizar el estado de verificación del usuario
        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        res.status(200).json({ message: 'Correo verificado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al verificar correo: ' + error });
    }
};


exports.login = async (req, res) => {
    try {
        const { correo, psw } = req.body;
        const user = await User.findOne({ where: { correo } });

        // Verificar si el usuario existe y si la cuenta está verificada
        if (!user || !await bcrypt.compare(psw, user.psw)) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ error: 'Tu cuenta no ha sido verificada. Revisa tu correo electrónico.' });
        }

        if (user.isLogin === 1) {
            return res.status(403).json({ error: 'Ya hay una sesión activa con esta cuenta.' });
        }

        await User.update({ isLogin: 1 }, { where: { id_usuario: user.id_usuario } });

        const token = jwt.sign({ id: user.id_usuario }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login exitoso', token, user });
    } catch (error) {
        res.status(500).json({ error: 'Error al iniciar sesión: ' + error });
    }
};

exports.logout = async (req, res) => {

    const { id_usuario } = req.body;
    const user = await User.findOne({ where: { id_usuario } });

    try {
        if (!id_usuario) {
        return res.status(400).send({ message: 'ID de usuario no proporcionado.' });
        }

        await user.update({
            isLogin: 0,
        });

        res.status(200).send({ message: 'Sesión cerrada correctamente.' });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        res.status(500).send({ message: 'Error al cerrar sesión.' });
    }
};

exports.restorePassword = async (req, res) => {
    try {
        const { correo } = req.body;
        const user = await User.findOne({ where: { correo } });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Generar un token de restablecimiento
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Guardar el token y su expiración en el usuario
        user.passwordToken = resetToken;
        await user.save();

        // Configurar y enviar el correo con el enlace de restablecimiento
        const transporter = nodemailer.createTransport({
            host: 'smtp.ionos.mx',
            port: 587,
            secure: false,
            auth: {
                user: 'leonsiu@lexius.mx',
                pass: 'Leonardocr7.',
            }
        });

        const mailOptions = {
            from: 'leonsiu@lexius.mx',
            to: user.correo,
            subject: 'Reestablecimiento de contraseña',
            html: `<p>Para restablecer tu contraseña, sigue el siguiente enlace:</p><a href="https://lexius.mx/updatePassword?token=${resetToken}">Reestablecer Contraseña</a>`
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Enlace de restablecimiento enviado a tu correo.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al enviar el enlace de restablecimiento: ' + error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, psw } = req.body;

        // Encontrar al usuario por el token y verificar que el token no ha expirado
        const user = await User.findOne({
            where: {
                passwordToken: token,
            },
        });

        if (!user) {
            return res.status(400).json({ error: 'Token inválido o expirado' });
        }

        const hashedPassword = await bcrypt.hash(psw, 10);

        // Actualizar la contraseña y eliminar el token de restablecimiento
        await user.update({
            psw: hashedPassword,
            passwordToken: null,
        });

        await crearNotificacion(user.id_usuario, "Se restableció la contraseña.");

        res.json({ message: 'Contraseña restablecida correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al restablecer la contraseña: ' + error.message });
    }
};


// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los usuarios: ' + error });
    }
};

// Modificar usuario
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido_pat, apellido_mat, edad, psw } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        let hashedPassword;
        if (psw) {
            hashedPassword = await bcrypt.hash(psw, 10);
        }

        await user.update({
            nombre: nombre || user.nombre,
            apellido_pat: apellido_pat || user.apellido_pat,
            apellido_mat: apellido_mat || user.apellido_mat,
            edad: edad || user.edad,
            psw: user.psw === psw ? user.psw : hashedPassword,
        });

        await crearNotificacion(id, "Se actualizó la información del usuario.");

        res.status(200).json({ message: 'Usuario actualizado correctamente', user });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar usuario: ' + error });
    }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        await user.update({
            status: 0,
        });

        res.status(200).json({ message: 'Usuario eliminado correctamente', user });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar usuario: ' + error });
    }
};
