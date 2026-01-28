const express = require('express');
const cors = require('cors');
const ventaRoutes = require('./src/routes/ventaRoutes');

const app = express();
app.use(cors({ origin: 'https://ventas-app-42956.web.app' }));
app.use(express.json());


app.use('/api/ventas', ventaRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor profesional corriendo en puerto ${PORT}`);
});