const axios = require('axios');
const Respuesta = require('../models/Respuesta');
const Test = require('../models/Test');
const Resultados = require('../models/Resultados');

// Variable para almacenar las preguntas generadas
let resultadosGenerados = new Set();

exports.generateResults = async (reqOrParams, res) => {
    try {

        
        const id_test = reqOrParams.params?.id_test || reqOrParams.id_test;
        console.log('obteniendo datos test id: ' + id_test)
        // Obtener las respuestas correctas del test y sus categorías
        console.log('obteniendo respuestas')
        const respuestasCorrectas = await Respuesta.findAll({
            where: {
                id_test: id_test,
                correcta: true
            }
        });
        console.log('datos obtenidos')
        // Verifica si respuestasCorrectas tiene datos
        if (!respuestasCorrectas || respuestasCorrectas.length === 0) {
            console.log('No se tuvieron respuesta correctas')
            return res.status(404).json({ error: 'No se encontraron respuestas correctas.' });
        }

        console.log('Contando preguntas')
        // Contar el número de preguntas correctas por categoría
        const categoriaCount = {};
        respuestasCorrectas.forEach(respuesta => {
            const categoria = respuesta.category; // Suponiendo que cada respuesta tiene un campo 'category'
            if (categoria) {
                categoriaCount[categoria] = (categoriaCount[categoria] || 0) + 1;
            }
        });
        console.log('Preguntas contadas')
        // Crear el prompt para la API de ChatGPT
        const prompt = `You are an expert in generating skill charts. Based on the following data:
Categories: ${JSON.stringify(categoriaCount)}. The keys are the categories (e.g., grammar, reading, etc.), and the values are the number of correct answers in each category.
Generate a set of variables suitable for creating a skill chart that represents the user's performance in each category.
Include the total number of correct answers and how to display this on a graph.
Ensure the variables can be used to visualize performance in a clear and actionable way.`;

console.log('Solicitud a API')
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

        console.log('Extrayendo respuesta')
        // Extraer el contenido de la respuesta de la API
        const content = response.data.choices[0].message.content.trim();
        console.log('Respuestas correctas:', respuestasCorrectas);
        console.log('Respuesta de ChatGPT:', response.data);
        // Verificar si los resultados ya han sido generados
        if (resultadosGenerados.has(content)) {
            console.log('Resultado ya generado, regenerando...');
            return exports.generateResults(reqOrParams, res); // Recursividad
        }

        console.log('Generando resultados')
        // Marcar los resultados como generados
        resultadosGenerados.add(content);

        // Devolver las variables necesarias para la gráfica
        if (res) {
            res.status(200).json({
                message: 'Datos para la gráfica generados correctamente.',
                data: content
            });
        } else {
            return { message: 'Datos para la gráfica generados correctamente.', data: content };
        }
    } catch (error) {
        console.error('Error al generar resultados:', error.message);
        if (res) {
            res.status(500).json({ error: 'Error al generar resultados: ' + error.message });
        } else {
            throw error; // Lanzar para manejo interno
        }
    }
};
