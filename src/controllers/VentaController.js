const ventaService = require('../services/ventaService');

exports.getIndicadoresMensuales = async (req, res) => {
  try {
    const { anio, categoria, marca } = req.query;
    const data = await ventaService.getIndicadoresMensuales(anio, categoria, marca);
    res.json(data);
  } catch (error) { res.status(500).send({ error: "Error en indicadores" }); }
};


exports.getConfig = async (req, res) => {
  try {
    const config = await ventaService.getProductosConfig();
    res.json(config);
  } catch (error) { res.status(500).send({ error: "Error config" }); }
};


exports.guardarPlanificacion = async (req, res) => {
  try {
    const datos = req.body; 
    await ventaService.guardarPlanificacionAnual(datos);
    res.json({ success: true, message: "Planificación guardada correctamente" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.getComparativa = async (req, res) => {
  try {
    const { anio, categoria, marcas } = req.body; 
    const data = await ventaService.getDataComparativa(anio, categoria, marcas);
    res.json(data);
  } catch (error) {
    res.status(500).send({ error: "Error en comparativa" });
  }
};