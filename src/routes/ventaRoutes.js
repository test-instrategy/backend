const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/VentaController');

router.get('/', ventaController.getVentas);
router.get('/ventas/stats', ventaController.getStats);
router.get('/config/productos', ventaController.getConfig);
router.post('/', ventaController.guardarVenta);

module.exports = router;