const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const Repair = require('../models/Repair');
const Review = require('../models/Review');
const { getSustainabilityRating } = require('../utils/impactData');

// ---------- Module: Dashboard Analytics (all computed live via aggregation) ----------

// @desc    High-level snapshot combining users/listings/orders/revenue
// @route   GET /api/dashboard/stats
// @access  Private (admin)
const getStats = asyncHandler(async (req, res) => {
  const [users, listings, activeListings, orders, repairs, reviews, revenueAgg] = await Promise.all([
    User.countDocuments({ isDeleted: { $ne: true } }),
    Listing.countDocuments({}),
    Listing.countDocuments({ status: 'active' }),
    Order.countDocuments({}),
    Repair.countDocuments({}),
    Review.countDocuments({}),
    Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers: users,
      totalListings: listings,
      activeListings,
      totalOrders: orders,
      totalRepairs: repairs,
      totalReviews: reviews,
      totalRevenue: revenueAgg[0]?.total || 0,
    },
  });
});

// @desc    Daily / weekly / monthly revenue breakdown
// @route   GET /api/dashboard/revenue
// @access  Private (admin)
const getRevenue = asyncHandler(async (req, res) => {
  const [daily, weekly, monthly] = await Promise.all([
    Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]),
    Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      {
        $group: {
          _id: { y: { $isoWeekYear: '$createdAt' }, w: { $isoWeek: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.y': -1, '_id.w': -1 } },
      { $limit: 12 },
    ]),
    Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      {
        $group: {
          _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.y': -1, '_id.m': -1 } },
      { $limit: 12 },
    ]),
  ]);

  res.json({ success: true, data: { daily, weekly, monthly } });
});

// @desc    User growth + role breakdown over time
// @route   GET /api/dashboard/users
// @access  Private (admin)
const getUserStats = asyncHandler(async (req, res) => {
  const [byRole, growth] = await Promise.all([
    User.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]),
    User.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
      { $limit: 12 },
    ]),
  ]);

  res.json({ success: true, data: { byRole, growth } });
});

// @desc    Order status breakdown + growth over time
// @route   GET /api/dashboard/orders
// @access  Private (admin)
const getOrderStats = asyncHandler(async (req, res) => {
  const [byStatus, growth] = await Promise.all([
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      {
        $group: {
          _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
      { $limit: 12 },
    ]),
  ]);

  res.json({ success: true, data: { byStatus, growth } });
});

// @desc    Platform sustainability impact (water, CO2, textile waste, tree equivalent)
// @route   GET /api/dashboard/sustainability
// @access  Private (admin)
const getSustainabilityStats = asyncHandler(async (req, res) => {
  const [impactAgg, repairStats] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          water: { $sum: '$totalWaterSavedLiters' },
          co2: { $sum: '$totalCo2SavedKg' },
          textile: { $sum: '$totalTextileWasteDivertedKg' },
          itemsResold: { $sum: { $size: '$items' } },
        },
      },
    ]),
    Repair.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const totals = impactAgg[0] || { water: 0, co2: 0, textile: 0, itemsResold: 0 };
  // ~21kg CO2 absorbed per tree per year is a commonly used estimate.
  const treeEquivalent = Math.round(totals.co2 / 21);

  res.json({
    success: true,
    data: {
      totalWaterSavedLiters: totals.water,
      totalCo2SavedKg: totals.co2,
      textileWasteDivertedKg: totals.textile,
      clothesRecycled: totals.itemsResold,
      treeEquivalent,
      sustainabilityRating: getSustainabilityRating({ waterSavedLiters: totals.water, co2SavedKg: totals.co2 }),
      repairStatistics: repairStats,
    },
  });
});

// @desc    Top products by views and by units sold, plus top categories/brands
// @route   GET /api/dashboard/top-products
// @access  Private (admin)
const getTopProducts = asyncHandler(async (req, res) => {
  const [mostViewed, mostPurchased, topCategories, topBrands] = await Promise.all([
    Listing.find({}).sort('-viewCount').limit(10).select('title viewCount price images category brand'),
    Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.listing', title: { $first: '$items.title' }, unitsSold: { $sum: '$items.quantity' } } },
      { $sort: { unitsSold: -1 } },
      { $limit: 10 },
    ]),
    Listing.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Listing.aggregate([
      { $match: { brand: { $ne: null } } },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  res.json({ success: true, data: { mostViewed, mostPurchased, topCategories, topBrands } });
});

// @desc    Top sellers by revenue / units sold / rating
// @route   GET /api/dashboard/top-sellers
// @access  Private (admin)
const getTopSellers = asyncHandler(async (req, res) => {
  const topByRevenue = await Order.aggregate([
    { $unwind: '$items' },
    { $match: { 'payment.status': 'paid' } },
    {
      $group: {
        _id: '$items.seller',
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        unitsSold: { $sum: '$items.quantity' },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'seller',
      },
    },
    { $unwind: '$seller' },
    {
      $project: {
        revenue: 1,
        unitsSold: 1,
        'seller.name': 1,
        'seller.sellerProfile.shopName': 1,
        'seller.ratingAverage': 1,
        'seller.avatarUrl': 1,
      },
    },
  ]);

  res.json({ success: true, data: topByRevenue });
});

// @desc    Bundle of chart-ready series for a dashboard homepage
// @route   GET /api/dashboard/charts
// @access  Private (admin)
const getCharts = asyncHandler(async (req, res) => {
  const [monthlySales, listingsByCategory, repairsByStatus, ordersByStatus] = await Promise.all([
    Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      {
        $group: {
          _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
      { $limit: 12 },
    ]),
    Listing.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Repair.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  res.json({ success: true, data: { monthlySales, listingsByCategory, repairsByStatus, ordersByStatus } });
});

module.exports = {
  getStats,
  getRevenue,
  getUserStats,
  getOrderStats,
  getSustainabilityStats,
  getTopProducts,
  getTopSellers,
  getCharts,
};
