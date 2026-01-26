const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/VentaController');

      
router.get('/config/productos', ventaController.getConfig); 
router.get('/indicadores-mes', ventaController.getIndicadoresMensuales);
router.post('/planificacion', ventaController.guardarPlanificacion); 
router.post('/comparativa', ventaController.getComparativa); 
module.exports = router;