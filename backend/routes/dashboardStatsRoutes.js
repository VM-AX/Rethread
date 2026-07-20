const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getStats, getRevenue, getUserStats, getOrderStats,
  getSustainabilityStats, getTopProducts, getTopSellers, getCharts,
} = require('../controllers/dashboardStatsController');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/revenue', getRevenue);
router.get('/users', getUserStats);
router.get('/orders', getOrderStats);
router.get('/sustainability', getSustainabilityStats);
router.get('/top-products', getTopProducts);
router.get('/top-sellers', getTopSellers);
router.get('/charts', getCharts);

module.exports = router;
