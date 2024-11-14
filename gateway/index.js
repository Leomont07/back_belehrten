const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
app.use(cors());


// Configuración de CORS para permitir solicitudes desde el frontend
app.use(cors({
    origin: 'http://localhost:5173', // Cambia a la URL de tu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configuración de morgan para registrar todas las peticiones al gateway
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Configuración de los proxies para cada microservicio

// Servicio de autenticación (auth)
app.use('/auth', createProxyMiddleware({
    target: 'http://localhost:3001', // Dirección del microservicio de autenticación
    changeOrigin: true,
    pathRewrite: {
        '^/auth': '/', // Reescribe la ruta para el microservicio de autenticación
    },
}));

// Servicio de usuarios (users)
app.use('/users', createProxyMiddleware({
    target: 'http://localhost:3002', // Dirección del microservicio de usuarios
    changeOrigin: true,
    pathRewrite: {
        '^/users': '/ususario', // Reescribe la ruta para el microservicio de usuarios
    },
}));

// Servicio de tests (tests)
app.use('/tests', createProxyMiddleware({
    target: 'http://localhost:3003', // Dirección del microservicio de tests
    changeOrigin: true,
    pathRewrite: {
        '^/tests': '/', // Reescribe la ruta para el microservicio de tests
    },
}));

// Servidor escuchando en el puerto 3000
app.listen(3000, () => {
    console.log('Gateway corriendo en el puerto 3000');
});
