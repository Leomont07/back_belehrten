const axios = require('axios');
const Respuesta = require('../models/Respuesta');
const Test = require('../models/Test');
const Resultados = require('../models/Resultados');

// Variable para almacenar las preguntas generadas
let resultadosGenerados = new Set();

exports.generateResults = async (req, res) => {
    try {
        const { id_test } = req.params;

        // Obtener las respuestas correctas del test y sus categorías
        const respuestasCorrectas = await Respuesta.findAll({
            where: {
                id_test: id_test,
                correcta: true
            },
            include: [
                {
                    model: Test,
                    attributes: ['id_test']
                }
            ]
        });
        
        // Verifica si respuestasCorrectas tiene datos
        if (!respuestasCorrectas || respuestasCorrectas.length === 0) {
            return res.status(404).json({ error: 'No se encontraron respuestas correctas.' });
        }

        // Contar el número de preguntas correctas por categoría
        const categoriaCount = {};
        respuestasCorrectas.forEach(respuesta => {
            const categoria = respuesta.category; // Suponiendo que cada respuesta tiene un campo 'category'
            if (categoria) {
                categoriaCount[categoria] = (categoriaCount[categoria] || 0) + 1;
            }
        });

        // Crear el prompt para la API de ChatGPT
        const prompt = `You are an expert in generating skill charts. Based on the following data:
Categories: ${JSON.stringify(categoriaCount)}. The keys are the categories (e.g., grammar, reading, etc.), and the values are the number of correct answers in each category.
Generate a set of variables suitable for creating a skill chart that represents the user's performance in each category.
Include the total number of correct answers and how to display this on a graph.
Ensure the variables can be used to visualize performance in a clear and actionable way.`;

        // Llamar a la API de ChatGPT con el prompt para obtener las variables para la gráfica
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
            return res.status(500).json({ error: 'No se obtuvo respuesta válida de la API de ChatGPT.' });
        }

        // Extraer el contenido de la respuesta de la API
        const content = response.data.choices[0].message.content.trim();
        console.log('Respuestas correctas:', respuestasCorrectas);
        console.log('Respuesta de ChatGPT:', response.data);
        // Verificar si los resultados ya han sido generados
        if (resultadosGenerados.has(content)) {
            return exports.generateResults(req, res);  // Generar nuevos resultados si ya existen
        }

        // Marcar los resultados como generados
        resultadosGenerados.add(content);

        // Devolver las variables necesarias para la gráfica
        res.status(200).json({
            message: 'Datos para la gráfica generados correctamente.',
            data: content
        });

    } catch (error) {
        console.error('Error al generar los resultados: ', error);
        // Manejo de errores detallado
        if (error.response) {
            console.error('Error de la API:', error.response.data);
            res.status(500).json({ error: 'Error al generar los resultados: ' + error.response.data.error?.message || 'Respuesta no válida de la API.' });
        } else if (error.request) {
            console.error('Error en la solicitud:', error.request);
            res.status(500).json({ error: 'Error al generar los resultados: No se recibió respuesta de la API.' });
        } else {
            console.error('Error desconocido:', error.message);
            res.status(500).json({ error: 'Error al generar los resultados: ' + error.message });
        }
    }
};
