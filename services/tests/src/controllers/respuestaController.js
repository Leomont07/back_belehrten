const Respuesta = require('../models/Respuesta');

exports.saveResponse = async (req, res) => {
    try {
        const { id_test, id_pregunta, respuesta_usuario, correcta, tiempo_respuesta } = req.body;

        // Guardar solo si la respuesta es correcta o incorrecta
        if (respuesta_usuario === correcta) {
            const respuesta = await Respuesta.create({
                id_test,
                id_pregunta,
                respuesta_usuario,
                correcta: true,
                tiempo_respuesta
            });
            return res.status(201).json({ message: 'Respuesta correcta guardada', respuesta });
        } else {
            const respuesta = await Respuesta.create({
                id_test,
                id_pregunta,
                respuesta_usuario,
                correcta: false,
                tiempo_respuesta
            });
            return res.status(201).json({ message: 'Respuesta incorrecta guardada', respuesta });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar la respuesta: ' + error });
    }
};

