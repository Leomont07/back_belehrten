const axios = require('axios');
const Respuesta = require('../models/Respuesta');
const Test = require('../models/Test');
const Resultados = require('../models/Resultados');

let resultadosGenerados = new Set();

exports.generateResults = async (reqOrParams) => {
    try {
        const id_test = reqOrParams.params?.id_test || reqOrParams.id_test;
        console.log('Obteniendo datos del test con id:', id_test);

        const respuestasCorrectas = await Respuesta.findAll({
            where: {
                id_test: id_test,
                correcta: true
            }
        });

        if (!respuestasCorrectas || respuestasCorrectas.length === 0) {
            console.log('No se encontraron respuestas correctas.');
            return { error: 'No se encontraron respuestas correctas.', statusCode: 404 };
        }

        const categoriaCount = {};
        respuestasCorrectas.forEach(respuesta => {
            const categoria = respuesta.category;
            if (categoria) {
                categoriaCount[categoria] = (categoriaCount[categoria] || 0) + 1;
            }
        });

        const totalCorrect = Object.values(categoriaCount).reduce((sum, count) => sum + count, 0);

        const prompt = `You are an expert in generating skill charts. Based on the following data:
        Categories: ${JSON.stringify(categoriaCount)}. The keys are the categories (e.g., grammar, reading, etc.), and the values are the number of correct answers in each category.
        Generate a JSON object that includes:
        - grammar, reading, vocabulary, listening (or other relevant categories) as keys with their corresponding values.
        - totalCorrect as the total number of correct answers.
        - level as a derived level based on performance.
        Ensure the JSON is concise and clear.`;

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
                headers: { 'Authorization': `Bearer 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` }
            }
        );

        if (!response.data || !response.data.choices || response.data.choices.length === 0) {
            return { error: 'No se obtuvo respuesta válida de la API de ChatGPT.', statusCode: 500 };
        }

        const content = JSON.parse(response.data.choices[0].message.content.trim());

        if (resultadosGenerados.has(content)) {
            console.log('Resultado ya generado, regenerando...');
            return exports.generateResults(reqOrParams);
        }

        resultadosGenerados.add(content);

        return {
            statusCode: 200,
            data: {
                message: 'Datos para la gráfica generados correctamente.',
                grammar: content.grammar || 0,
                reading: content.reading || 0,
                vocabulary: content.vocabulary || 0,
                listening: content.listening || 0,
                totalCorrect: content.totalCorrect,
                level: content.level
            }
        };
    } catch (error) {
        console.error('Error al generar resultados:', error.message);
        return { error: 'Error al generar resultados: ' + error.message, statusCode: 500 };
    }
};
