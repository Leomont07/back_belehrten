const PlanEstudios = require('../models/PlanEstudios');
const PDFDocument = require('pdfkit');
const fetch = require('node-fetch');
const axios = require('axios');
const { crearNotificacion } = require('../../../notifications/src/controllers/notificacionesController');

exports.generatePlan = async (req, res) => {
    try {
        const { grammar, elocuence, reading, vocabulary, nivel, id_usuario } = req.body;
        console.log('Datos: ' + grammar, elocuence, reading, vocabulary, nivel, id_usuario)

        if (![grammar, elocuence, reading, vocabulary].every(score => score >= 0 && score <= 10) || !nivel) {
            return res.status(400).json({ error: 'Datos inválidos. Asegúrese de que los puntajes estén entre 0 y 10 y el nivel sea válido (A1-C2).' });
        }

        const prompt = `Genera un plan de estudios personalizado para mejorar las habilidades de inglés de un usuario con el nivel ${nivel}. 
        Los resultados de las habilidades son:
        - Grammar: ${grammar}/10
        - Elocuence: ${elocuence}/10
        - Reading: ${reading}/10
        - Vocabulary: ${vocabulary}/10

        Identifica las áreas que necesitan más atención y sugiere recursos, ejercicios y estrategias específicas para cada habilidad. 
        También incluye recomendaciones generales para pasar al siguiente nivel. Muestra la habilidad sefuida de la calificacion que obtuvo el usuario seguido de la demas información`;

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

        if (response.status !== 200) {
            throw new Error(response.data.error?.message || 'Error en la solicitud a la API de OpenAI.');
        }

        const contenidoPlan = response.data.choices[0].message.content;
        const pdfDoc = new PDFDocument();
        let buffers = [];

        pdfDoc.on('data', buffers.push.bind(buffers));
        pdfDoc.on('end', async () => {
            const pdfData = Buffer.concat(buffers);

            await PlanEstudios.create({
                id_usuario: id_usuario,
                nivel_inicial: nivel,
                nivel_destino: nivel,
                contenido: contenidoPlan
            });

            res.setHeader('Content-Disposition', 'attachment; filename="plan_estudios.pdf"');
            res.setHeader('Content-Type', 'application/pdf');
            res.send(pdfData);
        });

        pdfDoc.fontSize(12).text(`Plan de Estudios - Nivel ${nivel}`);
        pdfDoc.moveDown();
        pdfDoc.text(contenidoPlan);
        pdfDoc.end();

        await crearNotificacion(id_usuario, `Se generó un plan de estudios para el nivel ${nivel}.`);

    } catch (error) {
        console.error("Error al generar el plan de estudios:", error);
        res.status(500).json({ error: "Error al generar el plan de estudios: " + error.message });
    }
};


exports.planes = async (req, res) => {
    try {
        const { id_usuario } = req.query;
        const planes = await PlanEstudios.findAll({ where: { id_usuario } });
        res.json(planes);
    } catch (error) {
        console.error("Error al consultar el planes de estudios:", error);
        res.status(500).json({ error: "Error al al consultar de estudios: " + error.message });
    }
};

exports.downloadPlan = async (req, res) => {
    try {
        const { id_plan } = req.query;

        if (!id_plan) {
            return res.status(400).json({ error: 'El ID del plan es obligatorio.' });
        }

        const plan = await PlanEstudios.findByPk(id_plan);

        if (!plan) {
            return res.status(404).json({ error: 'Plan de estudios no encontrado.' });
        }

        await crearNotificacion(plan.id_usuario, `Se realizo la descarga del plan de estudios del dia: ${plan.fecha_generacion}.`);

        const pdfDoc = new PDFDocument();
        let buffers = [];

        pdfDoc.on('data', buffers.push.bind(buffers));
        pdfDoc.on('end', () => {
            const pdfData = Buffer.concat(buffers);

            res.setHeader('Content-Disposition', `attachment; filename="plan_estudios_${id_plan}.pdf"`);
            res.setHeader('Content-Type', 'application/pdf');
            res.send(pdfData);
        });

        pdfDoc.fontSize(12).text(`Plan de Estudios - Nivel Inicial: ${plan.nivel_inicial} - Nivel Destino: ${plan.nivel_destino}`);
        pdfDoc.moveDown();
        pdfDoc.text(plan.contenido);
        pdfDoc.end();

    } catch (error) {
        console.error("Error al descargar el plan de estudios:", error);
        res.status(500).json({ error: "Error al descargar el plan de estudios: " + error.message });
    }
};