const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const nodemailer = require('nodemailer');
require('dotenv').config();


exports.users = async (req, res) => {
    try {
        res.status(200).json({ message: 'Servicio corriendo de manera correcta'});
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
        res.status(500).json({ error: 'Error al registrar usuario' + error});
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
               <a href="http://localhost:3000/users/verificar?token=${token}">Verificar correo</a>`
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

        const token = jwt.sign({ id: user.id_usuario }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login exitoso', token });
    } catch (error) {
        res.status(500).json({ error: 'Error al iniciar sesión: ' + error });
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
        const { nombre, apellido_pat, apellido_mat, edad, psw, correo } = req.body;
        
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
            psw: psw ? hashedPassword : user.psw,
            correo: correo || user.correo,
        });

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

        await user.destroy();
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar usuario: ' + error });
    }
};