const Respuesta = require('../models/Respuesta');
const Test = require('../models/Test');

exports.saveResponse = async (req, res) => {
    try {
        const { id_test, nivel_dificultad, respuesta_usuario, correcta, category } = req.body;

        console.log('Cuerpo de la solicitud:', req.body);

        // Calcular el tiempo de respuesta (en milisegundos)
        const tiempo_respuesta = Date.now(); // Obtiene el tiempo en milisegundos desde el 1 de enero de 1970

        // Guardar solo si la respuesta es correcta o incorrecta
        if (respuesta_usuario === correcta) {
            const respuesta = await Respuesta.create({
                id_test,
                nivel_dificultad: nivel_dificultad,
                correcta: true,
                tiempo_respuesta,
                category: category
            });
            return res.status(201).json({ message: 'Respuesta correcta guardada', respuesta });
        } else {
            const respuesta = await Respuesta.create({
                id_test,
                nivel_dificultad: nivel_dificultad,
                correcta: false,
                tiempo_respuesta,
                category: category
            });
            return res.status(201).json({ message: 'Respuesta incorrecta guardada', respuesta });
        }
    } catch (error) {
        // Registrar el error completo para depuración
        console.error('Error al guardar la respuesta:', error);

        // Devolver un mensaje genérico para no exponer detalles del error
        return res.status(500).json({ error: 'Error al guardar la respuesta. Intente nuevamente.' });
    }
};
