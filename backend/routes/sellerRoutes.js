const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getSellerDashboard, getSellerAnalytics } = require('../controllers/dashboardController');

const router = express.Router();

router.use(protect, authorize('seller'));

router.get('/dashboard', getSellerDashboard);
router.get('/analytics', getSellerAnalytics);

module.exports = router;
