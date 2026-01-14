const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: 'https://ventas-app-42956.web.app'
})); 
app.use(express.json()); 


let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  serviceAccount = require("./serviceAccountKey.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 2. Ruta para OBTENER las ventas (GET)
app.get('/api/ventas', async (req, res) => {
  try {
    const { categoria, marca } = req.query;
    let query = db.collection('ventas');

    if (categoria && categoria !== 'Todas') query = query.where('categoria', '==', categoria);
    if (marca && marca !== 'Todas') query = query.where('marca', '==', marca);

    const snapshot = await query.get();
    
    
    const ventasMap = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      const key = `${data.categoria}-${data.marca}`;
      
      if (!ventasMap[key]) {
        ventasMap[key] = {
          categoria: data.categoria,
          marca: data.marca,
          monto: 0
        };
      }
      ventasMap[key].monto += Number(data.monto || 0);
    });

    
    const ventasAgrupadas = Object.values(ventasMap);
    res.json(ventasAgrupadas);

  } catch (error) {
    res.status(500).send({ error: "Error al procesar ventas en el servidor" });
  }
});

// 3. Ruta para GUARDAR o ACTUALIZAR ventas (POST)
app.post('/api/ventas', async (req, res) => {
  try {
    const { categoria, marca, monto } = req.body;
    
    
    if (!categoria || !marca || !monto || Number(monto) <= 0) {
      return res.status(400).send({ error: "Faltan campos obligatorios o el monto es inválido" });
    }
    
    await db.collection('ventas').add({ 
      categoria, 
      marca, 
      monto: Number(monto),
      fecha: new Date()
    });
    
    res.status(200).send({ message: "Venta registrada con éxito" });
  } catch (error) {
    res.status(500).send({ error: "Error interno al guardar en base de datos" });
  }
});


// endpoint dinámico de categorias y marca 
app.get('/api/config/productos', async (req, res) => {
  try {
    const doc = await db.collection('configuracion').doc('productos').get();
    
    if (!doc.exists) {
      return res.status(404).send({ error: "Configuración no encontrada" });
    }

    // Retorna el objeto con las categorías y marcas
    res.json(doc.data());
  } catch (error) {
    res.status(500).send({ error: "Error al leer la base de datos" });
  }
});


// stats
app.get('/api/ventas/stats', async (req, res) => {
  try {
    const { categoria, marca } = req.query;
    let query = db.collection('ventas');

    if (categoria && categoria !== 'Todas') query = query.where('categoria', '==', categoria);
    if (marca && marca !== 'Todas') query = query.where('marca', '==', marca);

    const snapshot = await query.get();
    let totalVentas = 0;

    snapshot.forEach(doc => {
      totalVentas += Number(doc.data().monto || 0); 
    });

    res.json({
      totalVentas,
      totalTransacciones: snapshot.size,
      promedioVentas: snapshot.size > 0 ? totalVentas / snapshot.size : 0
    });
  } catch (error) {
    res.status(500).send({ error: "Error en cálculos" });
  }
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});