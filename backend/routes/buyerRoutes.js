const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getBuyerDashboard } = require('../controllers/dashboardController');

const router = express.Router();

router.use(protect, authorize('buyer'));

router.get('/dashboard', getBuyerDashboard);

module.exports = router;
