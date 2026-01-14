const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json()); 


const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 2. Ruta para OBTENER las ventas (GET)
app.get('/api/ventas', async (req, res) => {
  try {
    const { categoria, marca } = req.query; 
    let query = db.collection('ventas');

    if (categoria && categoria !== 'Todas') {
      query = query.where('categoria', '==', categoria);
    }
    if (marca && marca !== 'Todas') {
      query = query.where('marca', '==', marca);
    }

    const snapshot = await query.get();
    const ventas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(ventas);
  } catch (error) {
    res.status(500).send({ error: "Error al filtrar en el servidor" });
  }
});

// 3. Ruta para GUARDAR o ACTUALIZAR ventas (POST)
app.post('/api/ventas', async (req, res) => {
  try {
    const { categoria, marca, monto } = req.body;
    
    // Agregamos siempre un nuevo documento para tener historial
    await db.collection('ventas').add({ 
      categoria, 
      marca, 
      monto: Number(monto),
      fecha: new Date()
    });
    
    res.status(200).send({ message: "Venta registrada con éxito" });
  } catch (error) {
    res.status(500).send({ error: "Error al guardar" });
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


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo en http://localhost:${PORT}`);
});