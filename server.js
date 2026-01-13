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
    const snapshot = await db.collection('ventas').get();
    const ventas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(ventas);
  } catch (error) {
    res.status(500).send({ error: "Error al obtener datos" });
  }
});

// 3. Ruta para GUARDAR o ACTUALIZAR ventas (POST)
app.post('/api/ventas', async (req, res) => {
  try {
    const { categoria, marca, monto } = req.body;
    
    
    const query = await db.collection('ventas').where('marca', '==', marca).get();
    
    if (query.empty) {
     
      await db.collection('ventas').add({ categoria, marca, monto: Number(monto) });
    } else {
      
      const docId = query.docs[0].id;
      await db.collection('ventas').doc(docId).update({ monto: Number(monto) });
    }
    
    res.status(200).send({ message: "Venta guardada con éxito" });
  } catch (error) {
    res.status(500).send({ error: "Error al guardar" });
  }
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo en http://localhost:${PORT}`);
});