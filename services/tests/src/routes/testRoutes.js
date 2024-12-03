const express = require('express');
const testController = require('../controllers/testController');
const respuestaController = require('../controllers/respuestaController');

const router = express.Router();

router.post('/', testController.test);
router.post('/create', testController.createTest);
router.post('/question', testController.getAdaptiveQuestion);
router.post('/save', respuestaController.saveResponse);
router.post('/finish/:id_test', testController.finishTest);

module.exports = router;
