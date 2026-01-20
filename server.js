const express = require('express');
const cors = require('cors');
const ventaRoutes = require('./src/routes/ventaRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Registro de rutas
app.use('/api/ventas', ventaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor profesional corriendo en puerto ${PORT}`);
});