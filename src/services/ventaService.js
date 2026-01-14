const { db } = require('../config/firebase');

class VentaService {
  
  async getVentasAgrupadas(categoria, marca) {
    let query = db.collection('ventas');

    if (categoria && categoria !== 'Todas') query = query.where('categoria', '==', categoria);
    if (marca && marca !== 'Todas') query = query.where('marca', '==', marca);

    const snapshot = await query.get();
    const ventasMap = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      const key = `${data.categoria}-${data.marca}`;
      if (!ventasMap[key]) {
        ventasMap[key] = { categoria: data.categoria, marca: data.marca, monto: 0 };
      }
      ventasMap[key].monto += Number(data.monto || 0);
    });

    return Object.values(ventasMap);
  }

  
  async getCalculatedStats(categoria, marca) {
    let query = db.collection('ventas');

    if (categoria && categoria !== 'Todas') query = query.where('categoria', '==', categoria);
    if (marca && marca !== 'Todas') query = query.where('marca', '==', marca);

    const snapshot = await query.get();
    let totalVentas = 0;

    snapshot.forEach(doc => {
      totalVentas += Number(doc.data().monto || 0); 
    });

    return {
      totalVentas,
      totalTransacciones: snapshot.size,
      promedioVentas: snapshot.size > 0 ? totalVentas / snapshot.size : 0
    };
  }

  
  async guardarNuevaVenta(ventaData) {
    const { categoria, marca, monto } = ventaData;
    if (!categoria || !marca || !monto || Number(monto) <= 0) {
      throw new Error("Datos de venta inválidos");
    }
    return await db.collection('ventas').add({ 
      categoria, 
      marca, 
      monto: Number(monto), 
      fecha: new Date() 
    });
  }

  
  async getProductosConfig() {
    const doc = await db.collection('configuracion').doc('productos').get();
    if (!doc.exists) throw new Error("Configuración no encontrada");
    return doc.data();
  }
}

module.exports = new VentaService();