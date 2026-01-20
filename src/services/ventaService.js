const VentaModel = require('../models/VentaModel');
const MetaModel = require('../models/MetaModel'); 
const ConfigModel = require('../models/ConfigModel');

class VentaService {
  
  async getVentasAgrupadas(categoria, marca) {
    const ventas = await VentaModel.findAll({ categoria, marca });
    
    const ventasMap = {};

    ventas.forEach(venta => {
      const key = `${venta.categoria}-${venta.marca}`;
      if (!ventasMap[key]) {
        ventasMap[key] = { categoria: venta.categoria, marca: venta.marca, monto: 0 };
      }
      ventasMap[key].monto += venta.monto;
    });

    return Object.values(ventasMap);
  }



  async getCalculatedStats(categoria, marca) {
    const ventas = await VentaModel.findAll({ categoria, marca });
    const totalVentas = ventas.reduce((acc, curr) => acc + curr.monto, 0);

    return {
      totalVentas,
      totalTransacciones: ventas.length,
      promedioVentas: ventas.length > 0 ? totalVentas / ventas.length : 0
    };
  }



  async guardarNuevaVenta(ventaData) {
    const nuevaVenta = await VentaModel.create(ventaData);
    return nuevaVenta.toJSON(); 
  }



  async getProductosConfig() {
    const config = await ConfigModel.getProductos();
    if (!config) throw new Error("Configuración no encontrada");
    return config;
  }



  async getIndicadoresMensuales(anio = new Date().getFullYear()) {
    const mesesNombres = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
    
    const datosMap = {};
    mesesNombres.forEach((nombre, index) => {
      const mesNum = (index + 1).toString().padStart(2, '0');
      const key = `${anio}-${mesNum}`; 
      datosMap[key] = { id: key, label: nombre, real: 0, meta: 0, order: index };
    });

    try {
      const inicioAnio = new Date(`${anio}-01-01T00:00:00`);
      const finAnio = new Date(`${anio}-12-31T23:59:59`);


      const [ventas, metasDict] = await Promise.all([
        VentaModel.findAll({ fechaInicio: inicioAnio, fechaFin: finAnio }),
        MetaModel.findAllByYear(anio) 
      ]);

      ventas.forEach(venta => {

        if (venta.fecha) { 
           const mesNum = (venta.fecha.getMonth() + 1).toString().padStart(2, '0');
           const key = `${anio}-${mesNum}`;
           if (datosMap[key]) datosMap[key].real += venta.monto;
        }
      });


      Object.keys(metasDict).forEach(key => {
         if (datosMap[key]) datosMap[key].meta = metasDict[key];
      });


      return Object.values(datosMap)
        .sort((a, b) => a.order - b.order)
        .map(item => {
          const meta = item.meta;
          const real = Number(item.real.toFixed(2));
          let variacion = 0;
          let score = 0;
          
          if (meta > 0) {
            variacion = ((real - meta) / meta) * 100;
            score = (real / meta) * 100;
          }
          
          return {
            id: item.id,
            mes: item.label,
            real,
            meta,
            variacion: Number(variacion.toFixed(2)),
            score: Math.round(score)
          };
        });

    } catch (error) {
      console.error("❌ Error en getIndicadoresMensuales:", error);
      throw error;
    }
  }



  async updateMetaMensual(mesId, nuevoValor) {
    await MetaModel.update(mesId, nuevoValor);
    return { message: "Meta actualizada" };
  }
}

module.exports = new VentaService();