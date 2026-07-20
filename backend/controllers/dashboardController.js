const asyncHandler = require('../middleware/asyncHandler');
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const Repair = require('../models/Repair');
const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');
const { getSustainabilityRating } = require('../utils/impactData');

// ---------- Module: Seller Dashboard ----------

// @desc    Seller overview stats
// @route   GET /api/seller/dashboard
// @access  Private (seller)
const getSellerDashboard = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  const [
    totalListings,
    activeListings,
    soldItems,
    pendingOrdersAgg,
    revenueAgg,
    viewsAgg,
  ] = await Promise.all([
    Listing.countDocuments({ seller: sellerId }),
    Listing.countDocuments({ seller: sellerId, status: 'active' }),
    Listing.countDocuments({ seller: sellerId, status: 'sold' }),
    Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.seller': sellerId } },
      { $match: { status: { $in: ['pending', 'confirmed', 'shipped'] } } },
      { $group: { _id: '$_id' } },
      { $count: 'count' },
    ]),
    Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.seller': sellerId } },
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
    ]),
    Listing.aggregate([
      { $match: { seller: sellerId } },
      { $group: { _id: null, total: { $sum: '$viewCount' } } },
    ]),
  ]);

  const user = req.user;

  res.json({
    success: true,
    data: {
      totalListings,
      activeListings,
      soldItems,
      pendingOrders: pendingOrdersAgg[0]?.count || 0,
      totalRevenue: revenueAgg[0]?.total || 0,
      averageRating: Number((user.ratingAverage || 0).toFixed(2)),
      listingViews: viewsAgg[0]?.total || 0,
    },
  });
});

// @desc    Seller sales & performance analytics
// @route   GET /api/seller/analytics
// @access  Private (seller)
const getSellerAnalytics = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  const [monthlySalesAgg, mostViewed, bestCategoryAgg] = await Promise.all([
    Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.seller': sellerId, 'payment.status': 'paid' } },
      {
        $group: {
          _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          unitsSold: { $sum: '$items.quantity' },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
      { $limit: 12 },
    ]),
    Listing.find({ seller: sellerId }).sort('-viewCount').limit(5).select('title viewCount price images'),
    Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.seller': sellerId, 'payment.status': 'paid' } },
      { $group: { _id: '$items.category', unitsSold: { $sum: '$items.quantity' } } },
      { $sort: { unitsSold: -1 } },
      { $limit: 1 },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      monthlySales: monthlySalesAgg,
      mostViewedListings: mostViewed,
      bestSellingCategory: bestCategoryAgg[0]?._id || null,
      averageRating: Number((req.user.ratingAverage || 0).toFixed(2)),
    },
  });
});

// ---------- Module: Buyer Dashboard ----------

// @desc    Buyer overview stats
// @route   GET /api/buyer/dashboard
// @access  Private (buyer)
const getBuyerDashboard = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;

  const [orders, wishlistCount, repairsBooked, reviewsGiven, impactAgg, spentAgg] = await Promise.all([
    Order.countDocuments({ buyer: buyerId }),
    Wishlist.countDocuments({ user: buyerId }),
    Repair.countDocuments({ buyer: buyerId }),
    Review.countDocuments({ author: buyerId }),
    Order.aggregate([
      { $match: { buyer: buyerId, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          water: { $sum: '$totalWaterSavedLiters' },
          co2: { $sum: '$totalCo2SavedKg' },
        },
      },
    ]),
    Order.aggregate([
      { $match: { buyer: buyerId, 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
  ]);

  const waterSaved = impactAgg[0]?.water || 0;
  const co2Saved = impactAgg[0]?.co2 || 0;

  res.json({
    success: true,
    data: {
      orders,
      wishlistCount,
      repairsBooked,
      reviewsGiven,
      waterSavedLiters: waterSaved,
      co2SavedKg: co2Saved,
      moneySpent: spentAgg[0]?.total || 0,
      sustainabilityRating: getSustainabilityRating({ waterSavedLiters: waterSaved, co2SavedKg: co2Saved }),
    },
  });
});

module.exports = { getSellerDashboard, getSellerAnalytics, getBuyerDashboard };
