const express = require('express');
const planEstudiosController = require('../controllers/planEstudiosController');

const router = express.Router();

router.post('/generate', planEstudiosController.generatePlan);

module.exports = router;
