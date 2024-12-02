const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

// Configuración de CORS
app.use(cors({
    origin: '*',  // Permitir todos los orígenes (ajustar según tus necesidades)
}));

// Configuración de morgan para registrar las peticiones
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Configuración de los proxies para los microservicios

// Servicio de autenticación (auth)
app.use('/', createProxyMiddleware({
    target: 'https://back-belehrten.onrender.com/', // Dirección del microservicio de autenticación
    changeOrigin: true,
    pathRewrite: {
        '^/auth': '/',  // Reescribir la ruta para el microservicio de autenticación
    },
}));

// Servicio de usuarios (users)
app.use('/users', createProxyMiddleware({
    target: 'https://back-belehrten.onrender.com/', // Dirección del microservicio de usuarios
    changeOrigin: true,
    pathRewrite: {
        '^/users': '/',  // Reescribir la ruta para el microservicio de usuarios
    },
}));

// Servicio de tests (tests)
app.use('/tests', createProxyMiddleware({
    target: 'https://back-belehrten.onrender.com/', // Dirección del microservicio de tests
    changeOrigin: true,
    pathRewrite: {
        '^/tests': '/',  // Reescribir la ruta para el microservicio de tests
    },
}));

// Middleware para manejo de errores en los proxies
app.use((err, req, res, next) => {
    console.error('Error en el proxy:', err);
    res.status(500).json({ message: 'Error al procesar la solicitud.' });
});

// Servidor escuchando en el puerto 3000
app.listen(3000, () => {
    console.log('API Gateway corriendo en https://back-belehrten.onrender.com/');
});
