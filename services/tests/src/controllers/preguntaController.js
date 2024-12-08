const axios = require('axios');

let preguntasGeneradas = new Set();

exports.generateQuestion = async (nivel_dificultad, tipo) => {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are an adaptive English question generator for people who wants to learn english. Always provide the question in the format:
                        Question: <question>
                        Options: <option 1>, <option 2>, <option 3>, <option 4>
                        Correct Answer: <correct option>
                        Category: Use one the next habilities to categorize the question: ${tipo}.
                        Do not include letterings (A, B, C, D) in the options. Ensure the correct answer is one of the four options. The options should be a comma-separated list.`
                    },
                    {
                        role: "user",
                        content: `Generate an English question to be shown in an english test for level ${nivel_dificultad} with 4 answer options. Do not include letterings (A, B, C, D) in the options. The correct answer is one of the options.`
                    }
                ],
                max_tokens: 150,
                temperature: 0.7,
            },
            {
                headers: { 'Authorization': `Bearer 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` }
            }
        );

        const content = response.data.choices[0].message.content.trim();

        const questionRegex = /Question:\s*(.*?)\n/;  
        const optionsRegex = /Options:\s*([\s\S]+?)\s*Correct Answer:/;
        const answerRegex = /Correct Answer:\s*(.*)/; 
        const categoryRegex = /Category:\s*(.*)/; 

        const questionMatch = content.match(questionRegex);
        const optionsMatch = content.match(optionsRegex);
        const answerMatch = content.match(answerRegex);
        const categoryMatch = content.match(categoryRegex);

        if (!questionMatch || !optionsMatch || !answerMatch || !categoryMatch) {
            throw new Error('El formato de la respuesta no es válido.');
        }

        const question = questionMatch[1].trim();  
        const optionsString = optionsMatch[1].trim();
        const correctAnswer = answerMatch[1].trim();
        const category = categoryMatch[1].trim();

        if (preguntasGeneradas.has(question)) {
            return exports.generateQuestion(nivel_dificultad, tipo); 
        }

        preguntasGeneradas.add(question);

        const options = optionsString.split(',').map(option => option.trim());

        return {
            question: question,
            options: options,
            correctAnswer: correctAnswer,
            nivel_dificultad: nivel_dificultad,
            category: category,
            content: content
        };

    } catch (error) {
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
