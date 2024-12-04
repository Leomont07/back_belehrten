const express = require('express');
const notificacionesController = require('../controllers/notificacionesController');

const router = express.Router();

router.get('/nueva', notificacionesController.crearNotificacion);

module.exports = router;