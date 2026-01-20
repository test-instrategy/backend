const ventaService = require('../services/ventaService');

exports.getVentas = async (req, res) => {
  try {
    const { categoria, marca } = req.query;
    const ventas = await ventaService.getVentasAgrupadas(categoria, marca);
    res.json(ventas);
  } catch (error) {
    res.status(500).send({ error: "Error al procesar ventas" });
  }
};

exports.getStats = async (req, res) => {
  try {
    const { categoria, marca } = req.query;
    const stats = await ventaService.getCalculatedStats(categoria, marca);
    res.json(stats);
  } catch (error) {
    res.status(500).send({ error: "Error en cálculos" });
  }
};

exports.guardarVenta = async (req, res) => {
  try {
    await ventaService.guardarNuevaVenta(req.body);
    res.status(200).send({ message: "Venta registrada" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.getConfig = async (req, res) => {
  try {
    const config = await ventaService.getProductosConfig();
    res.json(config);
  } catch (error) {
    res.status(500).send({ error: "Error de config" });
  }
};


exports.getIndicadoresMensuales = async (req, res) => {
  try {
    const { anio } = req.query;
    const data = await ventaService.getIndicadoresMensuales(anio);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error calculando mensuales" });
  }
};

exports.updateMetaMensual = async (req, res) => {
  try {
    const { id, valor } = req.body; 
    await ventaService.updateMetaMensual(id, valor);
    res.json({ success: true });
  } catch (error) {
    res.status(500).send({ error: "Error guardando meta" });
  }
};