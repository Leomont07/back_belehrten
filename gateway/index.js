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

app.get("/", (req, res) => {
    console.log('Servidor corriendo a la perfección');
    res.send('Servidor corriendo a la perfección');
  });

// Servicio de autenticación (auth)
app.use('/auth', createProxyMiddleware({
    target: 'http://localhost:3001', // Dirección del microservicio de autenticación
    changeOrigin: true,
    pathRewrite: {
        '^/auth': '/',  // Reescribir la ruta para el microservicio de autenticación
    },
}));

// Servicio de usuarios (users)
app.use('/users', createProxyMiddleware({
    target: 'http://localhost:3002', // Dirección del microservicio de usuarios
    changeOrigin: true,
    pathRewrite: {
        '^/users': '/',  // Reescribir la ruta para el microservicio de usuarios
    },
}));

// Servicio de tests (tests)
app.use('/tests', createProxyMiddleware({
    target: 'http://localhost:3003', // Dirección del microservicio de tests
    changeOrigin: true,
    pathRewrite: {
        '^/tests': '/',  // Reescribir la ruta para el microservicio de tests
    },
}));

// Servicio de plan de estudio (study_plan)
app.use('/plan', createProxyMiddleware({
    target: 'http://localhost:3004', // Dirección del microservicio de plan
    changeOrigin: true,
    pathRewrite: {
        '^/plan': '/',  // Reescribir la ruta para el microservicio de plan
    },
}));

// Middleware para manejo de errores en los proxies
app.use((err, req, res, next) => {
    console.error('Error en el proxy:', err);
    res.status(500).json({ message: 'Error al procesar la solicitud.' });
});

// Servidor escuchando en el puerto 3000
app.listen(3000, () => {
    console.log('API Gateway corriendo en http://localhost:3000');
});
