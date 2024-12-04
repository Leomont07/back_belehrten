const PlanEstudios = require('../models/PlanEstudios');
const Resultados = require('../models/Resultados');
const { Configuration, OpenAIApi } = require('openai');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY
}));

exports.generatePlan = async (req, res) => {
    try {
        const { id_test, id_usuario } = req.body;
        
        // Obtener resultados del test
        const resultados = await Resultados.findOne({ where: { id_test } });
        if (!resultados) {
            return res.status(404).json({ error: 'Resultados no encontrados.' });
        }

        const prompt = `Genera un plan de estudios para mejorar el nivel de inglés de un usuario que ha alcanzado el nivel ${resultados.nivel_final}. Identifica las áreas débiles según los resultados de las pruebas y sugiere recursos y ejercicios para mejorar.`;

        // Llamar a la API de OpenAI
        const completion = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }]
        });

        const contenidoPlan = completion.data.choices[0].message.content;

        // Crear el PDF en memoria
        const pdfDoc = new PDFDocument();
        let buffers = [];
        
        pdfDoc.on('data', buffers.push.bind(buffers));
        pdfDoc.on('end', async () => {
            const pdfData = Buffer.concat(buffers);

            // Guardar el plan en la base de datos
            await PlanEstudios.create({
                id_usuario: id_usuario,
                nivel_inicial: resultados.nivel_final,
                nivel_destino: resultados.nivel_final,
                contenido: JSON.stringify(contenidoPlan)
            });

            // Enviar el PDF al cliente
            res.setHeader('Content-Disposition', 'attachment; filename="plan_estudios.pdf"');
            res.setHeader('Content-Type', 'application/pdf');
            res.send(pdfData);
        });

        // Agregar contenido al PDF
        pdfDoc.text(contenidoPlan);
        pdfDoc.end();

        res.json({ message: 'Plan de estudios generado exitosamente'});

    } catch (error) {
        res.status(500).json({ error: "Error al generar el plan de estudios: " + error.message });
    }
};
