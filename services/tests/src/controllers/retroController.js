const axios = require('axios');
const Respuesta = require('../models/Respuesta');
const Test = require('../models/Test');
const Resultados = require('../models/Resultados');

// Variable para almacenar las preguntas generadas
let resultadosGenerados = new Set();

exports.generateResults = async (reqOrParams, res) => {
    try {
        const id_test = reqOrParams.params?.id_test || reqOrParams.id_test;
        console.log('Obteniendo datos del test con id:', id_test);

        // Obtener las respuestas correctas del test y sus categorías
        const respuestasCorrectas = await Respuesta.findAll({
            where: {
                id_test: id_test,
                correcta: true
            }
        });

        if (!respuestasCorrectas || respuestasCorrectas.length === 0) {
            console.log('No se encontraron respuestas correctas.');
            return res.status(404).json({ error: 'No se encontraron respuestas correctas.' });
        }

        // Contar el número de respuestas correctas por categoría
        const categoriaCount = {};
        respuestasCorrectas.forEach(respuesta => {
            const categoria = respuesta.category; // Suponiendo que existe un campo 'category'
            if (categoria) {
                categoriaCount[categoria] = (categoriaCount[categoria] || 0) + 1;
            }
        });

        // Calcular el total de respuestas correctas
        const totalCorrect = Object.values(categoriaCount).reduce((sum, count) => sum + count, 0);

        // Generar el prompt para ChatGPT
        const prompt = `You are an expert in generating skill charts. Based on the following data:
Categories: ${JSON.stringify(categoriaCount)}. The keys are the categories (e.g., grammar, reading, etc.), and the values are the number of correct answers in each category.
Generate a JSON object that includes:
- grammar, reading, vocabulary, listening (or other relevant categories) as keys with their corresponding values.
- totalCorrect as the total number of correct answers.
- level as a derived level based on performance.
Ensure the JSON is concise and clear.`;

        // Llamar a la API de ChatGPT
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a data visualization assistant.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 150,
                temperature: 0.7
            },
            {
                headers: { 'Authorization': `Bearer YOUR_API_KEY` }
            }
        );

        if (!response.data || !response.data.choices || response.data.choices.length === 0) {
            return res.status(500).json({ error: 'No se obtuvo respuesta válida de la API de ChatGPT.' });
        }

        const content = JSON.parse(response.data.choices[0].message.content.trim());

        // Verificar si los resultados ya han sido generados
        if (resultadosGenerados.has(content)) {
            console.log('Resultado ya generado, regenerando...');
            return exports.generateResults(reqOrParams, res);
        }

        resultadosGenerados.add(content);

        // Enviar la respuesta al frontend en el formato adecuado
        res.status(200).json({
            message: 'Datos para la gráfica generados correctamente.',
            data: {
                grammar: content.grammar || 0,
                reading: content.reading || 0,
                vocabulary: content.vocabulary || 0,
                listening: content.listening || 0,
                totalCorrect: content.totalCorrect,
                level: content.level
            }
        });
    } catch (error) {
        console.error('Error al generar resultados:', error.message);
        res.status(500).json({ error: 'Error al generar resultados: ' + error.message });
    }
};
