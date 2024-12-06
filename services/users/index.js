const express = require('express');
require('dotenv').config();
const app = express();
const PORT = 3002;
const userRoutes = require('./src/routes/userRoutes');
const sequelize = require('./config/database');

app.use(express.json());

app.use('/', userRoutes);

app.get('/run', (req, res) => res.send('Users Service is running'));

sequelize.authenticate()
    .then(() => console.log('Conexión a la base de datos exitosa'))
    .catch(err => console.error('Error al conectar con la base de datos:', err));

app.listen(PORT, () => {
  console.log(`Users Service running on port ${PORT}`);
});
