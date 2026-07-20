const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const Order = require('../models/Order');
const { IMPACT_TABLE, getSustainabilityRating } = require('../utils/impactData');

// ---------- Module: Sustainability Impact Score (4 APIs) ----------

// @desc    Get the predefined per-category water/CO2/textile-waste savings table
// @route   GET /api/impact/categories
// @access  Public
const getImpactTable = asyncHandler(async (req, res) => {
  res.json({ success: true, data: IMPACT_TABLE });
});

// @desc    Get sustainability impact for a specific order
// @route   GET /api/impact/orders/:orderId
// @access  Private (buyer who owns it / admin)
const getOrderImpact = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) throw new ApiError(404, 'Order not found');
  if (String(order.buyer) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to view this order');
  }

  res.json({
    success: true,
    data: {
      orderId: order._id,
      totalWaterSavedLiters: order.totalWaterSavedLiters,
      totalCo2SavedKg: order.totalCo2SavedKg,
      totalTextileWasteDivertedKg: order.totalTextileWasteDivertedKg,
      sustainabilityRating: getSustainabilityRating({
        waterSavedLiters: order.totalWaterSavedLiters,
        co2SavedKg: order.totalCo2SavedKg,
      }),
      items: order.items.map((i) => ({
        title: i.title,
        category: i.category,
        waterSavedLiters: i.waterSavedLiters,
        co2SavedKg: i.co2SavedKg,
        textileWasteDivertedKg: i.textileWasteDivertedKg,
      })),
    },
  });
});

// @desc    Lifetime sustainability impact summary for the logged-in buyer
// @route   GET /api/impact/buyer/summary
// @access  Private (buyer)
const getBuyerImpactSummary = asyncHandler(async (req, res) => {
  const result = await Order.aggregate([
    { $match: { buyer: req.user._id, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: null,
        totalWaterSavedLiters: { $sum: '$totalWaterSavedLiters' },
        totalCo2SavedKg: { $sum: '$totalCo2SavedKg' },
        totalTextileWasteDivertedKg: { $sum: '$totalTextileWasteDivertedKg' },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  const summary = result[0] || {
    totalWaterSavedLiters: 0,
    totalCo2SavedKg: 0,
    totalTextileWasteDivertedKg: 0,
    totalOrders: 0,
  };
  delete summary._id;
  summary.sustainabilityRating = getSustainabilityRating({
    waterSavedLiters: summary.totalWaterSavedLiters,
    co2SavedKg: summary.totalCo2SavedKg,
  });
  res.json({ success: true, data: summary });
});

// @desc    Platform-wide sustainability impact totals
// @route   GET /api/impact/platform/summary
// @access  Public
const getPlatformImpactSummary = asyncHandler(async (req, res) => {
  const result = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: null,
        totalWaterSavedLiters: { $sum: '$totalWaterSavedLiters' },
        totalCo2SavedKg: { $sum: '$totalCo2SavedKg' },
        totalTextileWasteDivertedKg: { $sum: '$totalTextileWasteDivertedKg' },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  const summary = result[0] || {
    totalWaterSavedLiters: 0,
    totalCo2SavedKg: 0,
    totalTextileWasteDivertedKg: 0,
    totalOrders: 0,
  };
  delete summary._id;
  res.json({ success: true, data: summary });
});

module.exports = { getImpactTable, getOrderImpact, getBuyerImpactSummary, getPlatformImpactSummary };
