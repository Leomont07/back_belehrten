const express = require('express');
const respuestaController = require('../controllers/respuestaController');

const router = express.Router();

router.post('/save', respuestaController.saveResponse);

module.exports = router;
