const { db } = require('../config/firebase');

class MetaModel {
  static async findAllByYear(anio, marca) {
    let query = db.collection('metas_mensuales')
      .where('anio', '==', Number(anio));


    if (marca && marca !== 'Todas') {
      query = query.where('marca', '==', marca);
    }


    const snapshot = await query.get();
    
    const metas = [];
    snapshot.forEach(doc => {
      metas.push(doc.data());
    });
    return metas;
  }

  static async update(anio, mes, marca, valor) {

    const docId = `${anio}-${mes}-${marca}`;
    
    return await db.collection('metas_mensuales').doc(docId).set({ 
      anio: Number(anio),
      mes: mes,
      marca: marca,
      valor: Number(valor),
      updatedAt: new Date()
    }, { merge: true });
  }
}

module.exports = MetaModel;