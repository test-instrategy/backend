// src/routes/ventaRoutes.js
const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/VentaController');

router.get('/', ventaController.getVentas);          
router.get('/stats', ventaController.getStats);      
router.get('/config/productos', ventaController.getConfig); 
router.post('/', ventaController.guardarVenta);   
router.get('/indicadores-mes', ventaController.getIndicadoresMensuales);
router.post('/meta-mes', ventaController.updateMetaMensual);
module.exports = router;