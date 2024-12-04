const Notificaciones = require('../models/Notificaciones');

exports.crearNotificacion = async (id_usuario, descripcion) => {
    try {
        await Notificaciones.create({
            id_usuario,
            descripcion,
            fecha: new Date(),
        });
    } catch (error) {
        console.error("Error al crear la notificación:", error);
    }
};

exports.obtenerNotificaciones = async (req, res) => {
    try {
        const { id_usuario } = req.query;

        const notificaciones = await Notificaciones.findAll({
            where: { id_usuario },
            order: [['fecha', 'DESC']],
        });

        res.json(notificaciones);
    } catch (error) {
        console.error("Error al obtener notificaciones:", error);
        res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
};