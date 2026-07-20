const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getImpactTable, getOrderImpact, getBuyerImpactSummary, getPlatformImpactSummary,
} = require('../controllers/impactController');

const router = express.Router();

router.get('/categories', getImpactTable);
router.get('/orders/:orderId', protect, getOrderImpact);
router.get('/buyer/summary', protect, authorize('buyer'), getBuyerImpactSummary);
router.get('/platform/summary', getPlatformImpactSummary);

module.exports = router;
