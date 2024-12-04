const express = require('express');
const planEstudiosController = require('../controllers/planEstudiosController');

const router = express.Router();

router.post('/generate', planEstudiosController.generatePlan);
router.get('/obtenerplanes', planEstudiosController.planes);
router.get('/descargar', planEstudiosController.downloadPlan);

module.exports = router;
