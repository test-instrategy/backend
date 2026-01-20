const { db } = require('../config/firebase');

class VentaModel {

  constructor(id, categoria, marca, monto, fecha) {
    this.id = id;
    this.categoria = categoria;
    this.marca = marca;
    this.monto = Number(monto);
    

    if (fecha && typeof fecha.toDate === 'function') {
      this.fecha = fecha.toDate();
    } else if (fecha) {
      this.fecha = new Date(fecha);
    } else {
      this.fecha = new Date();
    }
  }


  toJSON() {
    return {
      id: this.id,
      categoria: this.categoria,
      marca: this.marca,
      monto: this.monto,
      fecha: this.fecha
    };
  }

  static validar(data) {
    if (!data.categoria || !data.marca || !data.monto || data.monto <= 0) {
      throw new Error("Datos de venta inválidos");
    }
  }


  static async create(data) {
    VentaModel.validar(data);

    const docRef = await db.collection('ventas').add({
      categoria: data.categoria,
      marca: data.marca,
      monto: Number(data.monto),
      fecha: new Date()
    });


    return new VentaModel(docRef.id, data.categoria, data.marca, data.monto, new Date());
  }


  static async findAll({ categoria, marca, fechaInicio, fechaFin }) {
    let query = db.collection('ventas');

    if (categoria && categoria !== 'Todas') query = query.where('categoria', '==', categoria);
    if (marca && marca !== 'Todas') query = query.where('marca', '==', marca);
    
    if (fechaInicio && fechaFin) {
      query = query.where('fecha', '>=', fechaInicio)
                   .where('fecha', '<=', fechaFin);
    }

    const snapshot = await query.get();
    

    const ventas = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const venta = new VentaModel(
        doc.id, 
        data.categoria, 
        data.marca, 
        data.monto, 
        data.fecha
      );
      ventas.push(venta);
    });

    return ventas;
  }
}

module.exports = VentaModel;