const express = require('express');
const notificacionesController = require('../controllers/notificacionesController');

const router = express.Router();

router.get('/nueva', notificacionesController.crearNotificacion);
router.get('/getNotifications', notificacionesController.obtenerNotificaciones);

module.exports = router;