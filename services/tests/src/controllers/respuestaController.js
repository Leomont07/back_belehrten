const Respuesta = require('../models/Respuesta');
const Test = require('../models/Test');

exports.saveResponse = async (req, res) => {
    try {
        const { id_test, nivel_dificultad, respuesta_usuario, correcta, category } = req.body;

        console.log('Cuerpo de la solicitud:', req.body);

        const tiempo_respuesta = Date.now(); 

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
        console.error('Error al guardar la respuesta:', error);
        return res.status(500).json({ error: 'Error al guardar la respuesta. Intente nuevamente.' });
    }
};
