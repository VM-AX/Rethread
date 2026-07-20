const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const Repair = require('../models/Repair');
const Offer = require('../models/Offer');
const Report = require('../models/Report');
const Review = require('../models/Review');
const { Conversation } = require('../models/Message');
const AIReport = require('../models/AIReport');

// ---------- Module: Admin Moderation ----------

// @desc    List/filter all users (buyers, sellers, repair partners)
// @route   GET /api/admin/users
// @access  Private (admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.blocked === 'true') filter.isBlocked = true;
  if (req.query.deleted === 'true') filter.isDeleted = true;
  else if (req.query.deleted !== 'all') filter.isDeleted = { $ne: true };

  const users = await User.find(filter).sort('-createdAt');
  res.json({ success: true, count: users.length, data: users });
});

// @desc    Block or unblock a user account
// @route   PATCH /api/admin/users/:id/block
// @access  Private (admin)
const toggleBlockUser = asyncHandler(async (req, res) => {
  const { block, reason } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === 'admin') throw new ApiError(400, 'Cannot block an admin account');

  user.isBlocked = Boolean(block);
  user.blockReason = block ? reason || 'Blocked by admin' : '';
  await user.save();

  res.json({ success: true, data: user.toSafeObject() });
});

// @desc    Soft-delete or restore a user account
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
const toggleDeleteUser = asyncHandler(async (req, res) => {
  const { restore } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === 'admin') throw new ApiError(400, 'Cannot delete an admin account');

  user.isDeleted = !restore;
  await user.save();

  res.json({ success: true, message: restore ? 'User restored' : 'User deleted' });
});

// @desc    View all listings, with moderation filters (flagged, status)
// @route   GET /api/admin/listings
// @access  Private (admin)
const getAllListingsAdmin = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.flagged === 'true') filter.isFlagged = true;

  const listings = await Listing.find(filter).populate('seller', 'name email').sort('-createdAt');
  res.json({ success: true, count: listings.length, data: listings });
});

// @desc    Moderate a listing: remove, flag, or restore
// @route   PATCH /api/admin/listings/:id/moderate
// @access  Private (admin)
const moderateListing = asyncHandler(async (req, res) => {
  const { action, reason } = req.body; // action: 'remove' | 'flag' | 'restore'
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found');

  if (action === 'remove') {
    listing.status = 'removed';
  } else if (action === 'flag') {
    listing.isFlagged = true;
    listing.flagReason = reason || 'Flagged by admin';
    listing.status = 'flagged';
  } else if (action === 'restore') {
    listing.isFlagged = false;
    listing.flagReason = '';
    listing.status = 'active';
  } else {
    throw new ApiError(400, "action must be 'remove', 'flag', or 'restore'");
  }

  await listing.save();
  res.json({ success: true, data: listing });
});

// @desc    Platform dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (admin)
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalBuyers,
    totalSellers,
    totalRepairPartners,
    totalListings,
    activeListings,
    totalOrders,
    totalRepairs,
    totalOffers,
    pendingOffers,
    reportedConversations,
    flaggedAIReports,
    pendingReports,
    totalReviews,
    revenueAgg,
    impactAgg,
    monthlySales,
    newUsersByMonth,
    listingsByCategory,
    repairsByStatus,
  ] = await Promise.all([
    User.countDocuments({ isDeleted: { $ne: true } }),
    User.countDocuments({ role: 'buyer', isDeleted: { $ne: true } }),
    User.countDocuments({ role: 'seller', isDeleted: { $ne: true } }),
    User.countDocuments({ role: 'repair_partner', isDeleted: { $ne: true } }),
    Listing.countDocuments({}),
    Listing.countDocuments({ status: 'active' }),
    Order.countDocuments({}),
    Repair.countDocuments({}),
    Offer.countDocuments({}),
    Offer.countDocuments({ status: 'pending' }),
    Conversation.countDocuments({ isReported: true }),
    AIReport.countDocuments({ flaggedForReview: true }),
    Report.countDocuments({ status: 'pending' }),
    Review.countDocuments({}),
    Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          water: { $sum: '$totalWaterSavedLiters' },
          co2: { $sum: '$totalCo2SavedKg' },
        },
      },
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
      { $sort: { '_id.y': 1, '_id.m': 1 } },
      { $limit: 12 },
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
    Listing.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Repair.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  res.json({
    success: true,
    data: {
      users: { total: totalUsers, buyers: totalBuyers, sellers: totalSellers, repairPartners: totalRepairPartners },
      listings: { total: totalListings, active: activeListings },
      orders: { total: totalOrders },
      repairs: { total: totalRepairs },
      offers: { total: totalOffers, pending: pendingOffers },
      reviews: { total: totalReviews },
      moderation: {
        reportedConversations,
        flaggedAIReports,
        reportsPending: pendingReports,
      },
      revenue: revenueAgg[0]?.total || 0,
      environmentalImpact: {
        totalWaterSavedLiters: impactAgg[0]?.water || 0,
        totalCo2SavedKg: impactAgg[0]?.co2 || 0,
      },
      charts: {
        monthlySales,
        newUsersByMonth,
        listingsByCategory,
        repairsByStatus,
      },
    },
  });
});

module.exports = {
  getAllUsers,
  toggleBlockUser,
  toggleDeleteUser,
  getAllListingsAdmin,
  moderateListing,
  getDashboardStats,
};
