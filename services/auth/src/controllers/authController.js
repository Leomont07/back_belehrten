const Auth = require('../models/Auth');

exports.auth = async (req, res) => {
    try {
        res.status(200).json({ message: 'Servicio corriendo de manera correcta'});
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};