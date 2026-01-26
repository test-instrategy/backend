const { db } = require('../config/firebase');

class IndicadorModel {

  static async update(anio, mes, marca, categoria, campo, valor) {
    const docId = `${anio}-${mes}-${marca}`;

    return await db.collection('indicadores').doc(docId).set({ 
      anio: Number(anio),
      mes: mes,
      marca: marca,
      categoria: categoria, 
      [campo]: Number(valor), 
      updatedAt: new Date()
    }, { merge: true });
  }

  static async findAll(anio, categoria, marca) {
    let query = db.collection('indicadores')
      .where('anio', '==', Number(anio));

    if (categoria && categoria !== 'Todas') {
      query = query.where('categoria', '==', categoria);
    }
    
    if (marca && marca !== 'Todas') {
      query = query.where('marca', '==', marca);
    }

    const snapshot = await query.get();
    const datos = [];
    snapshot.forEach(doc => datos.push(doc.data()));
    return datos;
  }


  static async updateBatch(indicadores) {
    const batch = db.batch();

    indicadores.forEach(item => {
      const docId = `${item.anio}-${item.mes}-${item.marca}`;
      const docRef = db.collection('indicadores').doc(docId);
      
      batch.set(docRef, {
        ...item,
        updatedAt: new Date()
      }, { merge: true });
    });

    return await batch.commit();
  }
}

module.exports = IndicadorModel;