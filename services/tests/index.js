const express = require('express');
require('dotenv').config();
const app = express();
const testRoutes = require('./src/routes/testRoutes');
const respuestaRoutes = require('./src/routes/respuestaRoutes');
const sequelize = require('./config/database');
const port = process.env.PORT || 3003;

app.use(express.json());

app.use('/', testRoutes);
app.use('/respuestas', respuestaRoutes);

app.get('/run', (req, res) => res.send('Tests service is running'));

sequelize.authenticate()
    .then(() => console.log('Conexión a la base de datos exitosa'))
    .catch(err => console.error('Error al conectar con la base de datos:', err));

app.listen(port, () => {
    console.log(`Service running on port ${port}`);
});
