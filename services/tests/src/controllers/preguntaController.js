const axios = require('axios');

exports.generateQuestion = async (nivel_dificultad) => {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are an adaptive English question generator. Always provide the question in the format:
Question: <question>
Options: <option 1>, <option 2>, <option 3>, <option 4>
Correct Answer: <correct option>
Do not include letterings (A, B, C, D) in the options. Ensure the correct answer is one of the four options. The options should be a comma-separated list.`
                    },
                    {
                        role: "user",
                        content: `Generate an English question for level ${nivel_dificultad} with 4 answer options. Do not include letterings (A, B, C, D) in the options. The correct answer is one of the options.`
                    }
                ],
                max_tokens: 150,
                temperature: 0.7,
            },
            {
                headers: { 'Authorization': `Bearer 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` }
            }
        );

        // Extraer el contenido de la respuesta
        const content = response.data.choices[0].message.content.trim();

        // Regex para procesar el formato de la respuesta
        const questionRegex = /Question:\s*(.*?)\n/;  // Captura la pregunta
        const optionsRegex = /Options:\s*([\s\S]+?)\s*Correct Answer:/; // Captura todas las opciones (en una cadena)
        const answerRegex = /Correct Answer:\s*(.*)/; // Captura la respuesta correcta

        // Aplicar las expresiones regulares
        const questionMatch = content.match(questionRegex);
        const optionsMatch = content.match(optionsRegex);
        const answerMatch = content.match(answerRegex);

        // Validar que las respuestas sean correctas
        if (!questionMatch || !optionsMatch || !answerMatch) {
            throw new Error('El formato de la respuesta no es válido.');
        }

        // Obtener los valores de la respuesta
        const question = questionMatch[1].trim();  // Obtener la pregunta
        const optionsString = optionsMatch[1].trim();  // Obtener las opciones como una cadena
        const correctAnswer = answerMatch[1].trim();  // Obtener la respuesta correcta

        // Separar las opciones por coma y eliminar espacios innecesarios
        const options = optionsString.split(',').map(option => option.trim());

        // Retornar el objeto estructurado con la pregunta, las opciones y la respuesta correcta
        return {
            question: question,
            options: options,
            correctAnswer: correctAnswer,
            nivel_dificultad: nivel_dificultad,
            content: content
        };

    } catch (error) {
        // Manejo de errores detallado
        if (error.response) {
            console.error('Error de la API:', error.response.data);
            throw new Error('Error al generar pregunta: ' + error.response.data.error?.message || 'Respuesta no válida de la API.');
        } else if (error.request) {
            console.error('Error en la solicitud:', error.request);
            throw new Error('Error al generar pregunta: No se recibió respuesta de la API.');
        } else {
            console.error('Error desconocido:', error.message);
            throw new Error('Error al generar pregunta: ' + error.message);
        }
    }
};
