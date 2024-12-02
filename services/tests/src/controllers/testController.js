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
exports.test = async (req, res) => {
    try {
        res.status(200).json({ message: 'Servicio de test corriendo de manera correcta'});
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar usuario' });
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

        // Validación de entrada
        if (!id_test) {
            return res.status(400).json({ error: "ID de test no proporcionado." });
        }

        // Obtener el test por ID
        const test = await Test.findByPk(id_test);
        if (!test) {
            return res.status(404).json({ error: "El test no existe." });
        }

        // Obtener el nivel de dificultad basado en las preguntas respondidas
        const nivel_dificultad = await calculateDifficultyLevel(id_test, test.nivel_inicial);

        // Generar la pregunta
        const question = await generateQuestion(nivel_dificultad);

        res.status(200).json({ question });
    } catch (error) {
        res.status(500).json({ error: 'Error al generar pregunta adaptativa: ' + error.message });
    }
};

// Función auxiliar para calcular el nivel de dificultad
const calculateDifficultyLevel = async (id_test, nivel_inicial) => {
    // Contar la cantidad de preguntas respondidas (no necesariamente correctas)
    const preguntasRespondidas = await Respuesta.count({
        where: { id_test: id_test }
    });

    // Determinar el bloque actual en base a las preguntas respondidas (cada 4 preguntas)
    const bloqueActual = Math.floor(preguntasRespondidas / 4);  // Dividimos entre 4 para determinar el bloque

    // Contar las respuestas correctas en el test
    const respuestasCorrectas = await Respuesta.count({
        where: { id_test: id_test, correcta: true }
    });

    // Lógica para aumentar el nivel cada 4 preguntas correctamente respondidas
    // Por cada bloque de 4 preguntas respondidas correctamente, aumentamos el nivel
    let nivelActual = nivel_inicial;
    
    // Revisamos por cada bloque completado si las 4 respuestas fueron correctas
    for (let i = 1; i <= bloqueActual; i++) {
        // Si el bloque i tiene 4 respuestas correctas
        if (respuestasCorrectas >= i * 4) {
            nivelActual = getNextLevel(nivelActual);  // Aumentamos el nivel
        }
    }

    // Retornar el nivel actualizado basado en las respuestas correctas en cada bloque
    return nivelActual;
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
