const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: '*',
}));

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.get("/", (req, res) => {
    console.log('Servidor corriendo a la perfección');
    res.send('Servidor corriendo a la perfección');
  });

app.use('/auth', createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: {
        '^/auth': '/',
    },
}));

app.use('/users', createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: {
        '^/users': '/',
    },
}));

app.use('/tests', createProxyMiddleware({
    target: 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: {
        '^/tests': '/', 
    },
}));

app.use('/plan', createProxyMiddleware({
    target: 'http://localhost:3004', 
    changeOrigin: true,
    pathRewrite: {
        '^/plan': '/', 
    },
}));

app.use('/notificacion', createProxyMiddleware({
    target: 'http://localhost:3005',
    changeOrigin: true,
    pathRewrite: {
        '^/notificacion': '/', 
    },
}));

app.use((err, req, res, next) => {
    console.error('Error en el proxy:', err);
    res.status(500).json({ message: 'Error al procesar la solicitud.' });
});

app.listen(3000, () => {
    console.log('API Gateway corriendo en http://localhost:3000');
});
