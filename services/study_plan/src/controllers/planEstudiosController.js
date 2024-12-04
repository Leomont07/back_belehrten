const PlanEstudios = require('../models/PlanEstudios');
const PDFDocument = require('pdfkit');
const fetch = require('node-fetch');
const axios = require('axios');

exports.generatePlan = async (req, res) => {
    try {
        const { grammar, listening, reading, vocabulary, nivel, id_usuario } = req.body;

        // Validar datos de entrada
        if (![grammar, listening, reading, vocabulary].every(score => score >= 0 && score <= 10) || !nivel) {
            return res.status(400).json({ error: 'Datos inválidos. Asegúrese de que los puntajes estén entre 0 y 10 y el nivel sea válido (A1-C2).' });
        }

        // Crear el prompt dinámico
        const prompt = `
Genera un plan de estudios personalizado para mejorar las habilidades de inglés de un usuario con el nivel ${nivel}. 
Los resultados de las habilidades son:
- Grammar: ${grammar}/10
- Listening: ${listening}/10
- Reading: ${reading}/10
- Vocabulary: ${vocabulary}/10

Identifica las áreas que necesitan más atención y sugiere recursos, ejercicios y estrategias específicas para cada habilidad. 
También incluye recomendaciones generales para pasar al siguiente nivel.`;

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "user",
                        content: prompt 
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7,
            },
            {
                headers: { 'Authorization': `Bearer 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` }
            }
        );

        // Verificar si la solicitud fue exitosa
        if (response.status !== 200) {
            throw new Error(response.data.error?.message || 'Error en la solicitud a la API de OpenAI.');
        }

        const contenidoPlan = response.data.choices[0].message.content;

        // Crear el PDF en memoria
        const pdfDoc = new PDFDocument();
        let buffers = [];

        pdfDoc.on('data', buffers.push.bind(buffers));
        pdfDoc.on('end', async () => {
            const pdfData = Buffer.concat(buffers);

            // Guardar el plan en la base de datos
            await PlanEstudios.create({
                id_usuario: id_usuario,
                nivel_inicial: nivel,
                nivel_destino: nivel,
                contenido: contenidoPlan
            });

            // Enviar el PDF al cliente
            res.setHeader('Content-Disposition', 'attachment; filename="plan_estudios.pdf"');
            res.setHeader('Content-Type', 'application/pdf');
            res.send(pdfData);
        });

        // Agregar contenido al PDF
        pdfDoc.fontSize(12).text(`Plan de Estudios - Nivel ${nivel}`);
        pdfDoc.moveDown();
        pdfDoc.text(contenidoPlan);
        pdfDoc.end();

    } catch (error) {
        console.error("Error al generar el plan de estudios:", error);
        res.status(500).json({ error: "Error al generar el plan de estudios: " + error.message });
    }
};
