const axios = require('axios');

exports.generateQuestion = async (nivel_dificultad) => {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Eres un generador de preguntas de inglés adaptativo." },
                { role: "user", content: `Genera una pregunta de inglés para el nivel ${nivel_dificultad} con 4 opciones de respuesta. La respuesta correcta es una de las opciones.` }
            ],
            max_tokens: 150,
            temperature: 0.7
        }, {
            headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
        });

        // Suponiendo que la respuesta de OpenAI tiene un formato predefinido
        const questionData = response.data.choices[0].message.content.trim();
        const [question, options] = questionData.split('\n');  // Puedes adaptarlo al formato que devuelva OpenAI

        return {
            question: question,
            options: options.split(', ')  // Asumiendo que las opciones están separadas por comas
        };
    } catch (error) {
        throw new Error('Error al generar pregunta: ' + error.message);
    }
};
