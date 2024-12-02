const express = require('express');
require('dotenv').config();
const app = express();
const authRoutes = require('./src/routes/authRoutes');
const sequelize = require('./config/database');
const port = process.env.PORT || 3001;

app.use(express.json());

app.use('/', authRoutes);

// Define rutas del servicio
app.get('/run', (req, res) => res.send('Auth Service is running'));

sequelize.authenticate()
    .then(() => console.log('Conexión a la base de datos exitosa'))
    .catch(err => console.error('Error al conectar con la base de datos:', err));

app.listen(port, () => {
  console.log(`Auth Service running on port ${port}`);
});
