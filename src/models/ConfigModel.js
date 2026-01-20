const { db } = require('../config/firebase');

class ConfigModel {
  static async getProductos() {
    const doc = await db.collection('configuracion').doc('productos').get();
    if (!doc.exists) return null;
    return doc.data();
  }
}

module.exports = ConfigModel;