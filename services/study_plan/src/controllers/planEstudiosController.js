const PlanEstudios = require('../models/PlanEstudios');
const Respuesta = require('../models/Respuesta');
const Resultados = require('../models/Resultados');

exports.generatePlan = async (req, res) => {
    try {
        const { id_usuario } = req.body;

        // Obtener resultados y respuestas del usuario
        const resultados = await Resultados.findAll({ where: { id_usuario } });
        const respuestas = await Respuesta.findAll({ where: { id_test: resultados.map(r => r.id_test) } });

        // Analizar áreas a reforzar (ejemplo basado en nivel)
        const areasPorMejorar = respuestas
            .filter(r => !r.correcta)
            .map(r => r.nivel_dificultad);

        // Generar contenido del plan (puedes hacerlo más detallado)
        const contenido = {
            areas_por_mejorar: [...new Set(areasPorMejorar)],
            recomendaciones: "Completar ejercicios de gramática, vocabulario y comprensión lectora.",
            recursos: ["https://englishgrammar.org", "https://duolingo.com"]
        };

        // Guardar el plan en la base de datos
        const plan = await PlanEstudios.create({
            id_usuario,
            nivel_inicial: resultados[0]?.nivel_inicial,
            nivel_final: resultados[resultados.length - 1]?.nivel_final,
            contenido: JSON.stringify(contenido)
        });

        res.status(201).json({ message: "Plan de estudios generado", plan });
    } catch (error) {
        res.status(500).json({ error: "Error al generar el plan de estudios: " + error.message });
    }
};
