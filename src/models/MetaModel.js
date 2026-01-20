const { db } = require('../config/firebase');

class MetaModel {
  static async findAllByYear(anio) {
    const snapshot = await db.collection('metas_mensuales')
      .where('__name__', '>=', `${anio}-01`)
      .where('__name__', '<=', `${anio}-12`)
      .get();
    
    const metas = {};
    snapshot.forEach(doc => {
      metas[doc.id] = Number(doc.data().valor || 0);
    });
    return metas;
  }

  static async update(id, valor) {
    return await db.collection('metas_mensuales').doc(id).set({ 
      valor: Number(valor),
      updatedAt: new Date()
    }, { merge: true });
  }
}

module.exports = MetaModel;