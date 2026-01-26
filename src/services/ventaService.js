const IndicadorModel = require('../models/IndicadorModel');
const ConfigModel = require('../models/ConfigModel');

class VentaService {

  async getVentasAgrupadas(categoria, marca) {
    const anio = new Date().getFullYear();
    const datos = await IndicadorModel.findAll(anio, categoria, marca);
    
    const agrupado = {};

    datos.forEach(d => {
      const key = d.marca; 
      if (!agrupado[key]) {
        agrupado[key] = { marca: key, categoria: d.categoria, monto: 0, meta: 0 };
      }

      agrupado[key].monto += (d.real || 0);
      agrupado[key].meta += (d.meta || 0);
    });

    return Object.values(agrupado);
  }


  async getCalculatedStats(categoria, marca) {
    const anio = new Date().getFullYear();
    const datos = await IndicadorModel.findAll(anio, categoria, marca);
    
    let totalVentas = 0;
    datos.forEach(d => totalVentas += (d.real || 0));

    return {
      totalVentas,
      totalTransacciones: datos.length, 
      promedioVentas: datos.length > 0 ? totalVentas / datos.length : 0
    };
  }


  async getIndicadoresMensuales(anio, categoria, marca) {
    const mesesNombres = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
    const datosMap = {};
    

    mesesNombres.forEach((nombre, index) => {
      const mesNum = (index + 1).toString().padStart(2, '0');
      datosMap[mesNum] = { id: mesNum, mes: nombre, real: 0, meta: 0, order: index };
    });


    const registros = await IndicadorModel.findAll(anio, categoria, marca);
    registros.forEach(reg => {
      if (datosMap[reg.mes]) {
        datosMap[reg.mes].real += (reg.real || 0);
        datosMap[reg.mes].meta += (reg.meta || 0);
      }
    });

    return Object.values(datosMap)
      .sort((a, b) => a.order - b.order)
      .map(item => {
        const { real, meta } = item;
        let variacion = 0;
        let score = 0;
        if (meta > 0) {
          variacion = ((real - meta) / meta) * 100;
          score = (real / meta) * 100;
        }
        return {
          ...item,
          real: Number(real.toFixed(2)),
          meta: Number(meta.toFixed(2)),
          variacion: Number(variacion.toFixed(2)),
          score: Math.round(score)
        };
      });
  }


  async updateIndicador(anio, mes, marca, categoria, tipo, valor) {
    if (!marca || marca === 'Todas') throw new Error("Selecciona una marca específica.");

    await IndicadorModel.update(anio, mes, marca, categoria, tipo, valor);
    return { success: true };
  }

  async getProductosConfig() {
    const config = await ConfigModel.getProductos();
    return config || {};
  }


  async guardarPlanificacionAnual(datos) {
    if (!Array.isArray(datos) || datos.length === 0) return;
    return await IndicadorModel.updateBatch(datos);
  }


  async getDataComparativa(anio, categoria, marcasArray) {

    const catFiltro = (marcasArray && marcasArray.length > 0) ? 'Todas' : categoria;
    
    const datosRaw = await IndicadorModel.findAll(anio, catFiltro, 'Todas'); 
    

    const filtrados = (marcasArray && marcasArray.length > 0)
      ? datosRaw.filter(d => marcasArray.includes(d.marca))
      : datosRaw;

    const ordenMeses = { 'ene': 1, 'feb': 2, 'mar': 3, 'abr': 4, 'may': 5, 'jun': 6, 'jul': 7, 'ago': 8, 'sept': 9, 'oct': 10, 'nov': 11, 'dic': 12 };
    
    return filtrados
      .sort((a, b) => ordenMeses[a.mes] - ordenMeses[b.mes])
      .map(d => ({
        mes: d.mes,
        marca: d.marca,
        real: d.real || 0,
        meta: d.meta || 0
      }));
  }
}

module.exports = new VentaService();