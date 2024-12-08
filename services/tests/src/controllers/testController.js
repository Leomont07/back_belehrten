const Test = require('../models/Test');
const Respuesta = require('../models/Respuesta');
const Resultados = require('../models/Resultados');
const { generateQuestion } = require('./preguntaController');
const { generateResults } = require('./retroController')

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

const getTipo = (tipo) => {
    switch (tipo) {
        case 'Grammar': return 'Reading';
        case 'Reading': return 'Vocabulary';
        case 'Vocabulary': return 'Elocuence';
        case 'Elocuence': return 'Grammar';
        default: return tipo;
    }
};

exports.test = async (req, res) => {
    try {
        res.status(200).json({ message: 'Servicio de test corriendo de manera correcta'});
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

exports.createTest = async (req, res) => {
    try {
        const { id_usuario, nivel_inicial } = req.body;
        let bloque_actual = 1;  

        const test = await Test.create({
            id_usuario,
            fecha_inicio: new Date(),
            nivel_inicial,
            estado: 'en progreso',
            bloque_actual 
        });

        res.status(201).json({ message: 'Test iniciado', test });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el test: ' + error });
    }
};

exports.finishBlock = async (req, res) => {
    try {
        const { id_test } = req.body;
        const test = await Test.findByPk(id_test);

        const correctas = await Respuesta.count({
            where: {
                id_test: id_test,
                correcta: true
            }
        });

        if (correctas >= 8) {
            test.bloque_actual += 1;
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

        let nivel_dificultad;
        let tipo;

        const lastQuestion = await Respuesta.findOne({
            where: { id_test },
            order: [['id_respuesta', 'DESC']],
        });
        
        console.log('Ultima: ' + JSON.stringify(lastQuestion));

        if (!lastQuestion) {
            nivel_dificultad = test.nivel_inicial;
            tipo = await getTipo('Elocuence');
        } else {
            console.log('Inical de Ultima pregunta: ' + lastQuestion.nivel_dificultad)
            nivel_dificultad = await calculateDifficultyLevel(id_test, lastQuestion.nivel_dificultad);
            tipo = await getTipo(lastQuestion.category);
        }


        const question = await generateQuestion(nivel_dificultad, tipo);

        res.status(200).json({ question });
    } catch (error) {
        res.status(500).json({ error: 'Error al generar pregunta adaptativa: ' + error.message });
    }
};

const calculateDifficultyLevel = async (id_test, nivel_dificultad) => {
    const preguntasPorBloque = 4;

    const preguntasRespondidas = await Respuesta.count({ where: { id_test, nivel_dificultad} });
    const respuestasCorrectas = await Respuesta.count({ where: { id_test, correcta: true, nivel_dificultad } });

    const bloqueActual = Math.floor(preguntasRespondidas / preguntasPorBloque);

    let nivelActual = nivel_dificultad;

    for (let i = 1; i <= bloqueActual; i++) {
        if (respuestasCorrectas >= i * preguntasPorBloque) {
            nivelActual = getNextLevel(nivelActual);
        }
    }

    return nivelActual;
};


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

        const retro = await generateResults({ params: { id_test } });

        res.status(200).json({ message: 'Test finalizado', retro });
    } catch (error) {
        res.status(500).json({ error: 'Hay un error al finalizar el test: ' + error.message });
    }
};


