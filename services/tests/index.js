const express = require('express');
require('dotenv').config();
const app = express();
const PORT = 3003;
const testRoutes = require('./src/routes/testRoutes');
const respuestaRoutes = require('./src/routes/respuestaRoutes');
const sequelize = require('./config/database');

app.use(express.json());

app.use('/', testRoutes);
app.use('/respuestas', respuestaRoutes);

app.get('/run', (req, res) => res.send('Tests service is running'));

sequelize.authenticate()
    .then(() => console.log('Conexión a la base de datos exitosa'))
    .catch(err => console.error('Error al conectar con la base de datos:', err));

app.listen(PORT, () => {
    console.log(`Service running on port ${PORT}`);
});
