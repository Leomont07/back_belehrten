const express = require('express');
const testController = require('../controllers/testController');

const router = express.Router();

router.post('/create', testController.createTest);
router.post('/question', testController.getAdaptiveQuestion);
router.post('/finish/:id_test', testController.finishTest);

module.exports = router;
