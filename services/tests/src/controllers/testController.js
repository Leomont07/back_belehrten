const Test = require('../models/Test');
const Respuesta = require('../models/Respuesta');
const Resultados = require('../models/Resultados');
const { generateQuestion } = require('./preguntaController');

const getNextLevel = (nivel_inicial) => {
    switch (nivel_inicial) {
        case 'A1': return 'A2';
        case 'A2': return 'B1';
        case 'B1': return 'B2';
        case 'B2': return 'C1';
        case 'C1': return 'C2';
        default: return nivel_inicial;
    }
};

// Crear un nuevo test
exports.createTest = async (req, res) => {
    try {
        const { id_usuario, nivel_inicial } = req.body;
        let bloque_actual = 1;  // Comienza con el primer bloque

        const test = await Test.create({
            id_usuario,
            fecha_inicio: new Date(),
            nivel_inicial,
            estado: 'en progreso',
            bloque_actual  // Almacena el bloque actual
        });

        res.status(201).json({ message: 'Test iniciado', test });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el test: ' + error });
    }
};

// A medida que avanzas en las respuestas, debes actualizar el bloque
// Al finalizar el bloque y obtener los resultados, actualizas el bloque
exports.finishBlock = async (req, res) => {
    try {
        const { id_test } = req.body;
        const test = await Test.findByPk(id_test);

        // Obtener la cantidad de respuestas correctas
        const correctas = await Respuesta.count({
            where: {
                id_test: id_test,
                correcta: true
            }
        });

        // Si tiene 8 respuestas correctas, sube al siguiente bloque
        if (correctas >= 8) {
            test.bloque_actual += 1;  // Incrementa el bloque
            await test.save();
        }

        res.status(200).json({ message: 'Bloque actualizado', test });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar bloque: ' + error });
    }
};


exports.getAdaptiveQuestion = async (req, res) => {
    try {
        const { id_test } = req.body;

        if (!id_test) {
            return res.status(400).json({ error: "ID de test no proporcionado." });
        }

        const test = await Test.findByPk(id_test);

        if (!test) {
            return res.status(404).json({ error: "El test no existe." });
        }

        // Contar el número de respuestas correctas
        const correctas = await Respuesta.count({
            where: {
                id_test: id_test,
                correcta: true
            }
        });

        // Determinar el nivel en base a las respuestas correctas
        let nivel_dificultad = test.nivel_inicial;
        if (correctas >= 8) {
            nivel_dificultad = getNextLevel(test.nivel_inicial);  // Función que aumenta el nivel
        }

        const question = await generateQuestion(nivel_dificultad);

        res.status(200).json({ question });
    } catch (error) {
        res.status(500).json({ error: 'Error al generar pregunta adaptativa: ' + error });
    }
};



// Finalizar el test y generar resultado
exports.finishTest = async (req, res) => {
    try {
        const { id_test } = req.params;
        const { nivel_final, puntaje_total, duracion_total } = req.body;

        const test = await Test.findByPk(id_test);
        if (!test) {
            return res.status(404).json({ error: 'Test no encontrado' });
        }

        await test.update({
            fecha_fin: new Date(),
            nivel_final,
            puntaje_total,
            duracion_total,
            estado: 'completado'
        });

        const resultado = await Resultados.create({
            id_test,
            nivel_final,
            puntaje: puntaje_total,
            duracion: duracion_total
        });

        res.status(200).json({ message: 'Test finalizado', resultado });
    } catch (error) {
        res.status(500).json({ error: 'Error al finalizar el test: ' + error });
    }
};
