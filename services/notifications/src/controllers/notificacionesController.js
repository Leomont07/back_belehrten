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