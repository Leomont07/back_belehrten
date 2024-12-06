const express = require('express');
require('dotenv').config();
const app = express();
const PORT = 3005;
const notificacionesRoutes = require('./src/routes/notificacionesRoutes');
const sequelize = require('./config/database');

app.use(express.json());

app.use('/', notificacionesRoutes);

app.get('/run', (req, res) => res.send('Notifications Service is running'));

sequelize.authenticate()
    .then(() => console.log('Conexión a la base de datos exitosa'))
    .catch(err => console.error('Error al conectar con la base de datos:', err));

app.listen(PORT, () => {
  console.log(`Notifications Service running on port ${PORT}`);
});
