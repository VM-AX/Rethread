const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const Review = require('../models/Review');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Order = require('../models/Order');
const { normalizeUploadedFiles } = require('../middleware/upload');

// ---------- Module: Reviews & Ratings (4 APIs) ----------

async function recalcListingRating(listingId) {
  const stats = await Review.aggregate([
    { $match: { listing: listingId, targetType: 'listing', isHidden: false } },
    { $group: { _id: '$listing', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Listing.findByIdAndUpdate(listingId, { ratingAverage: avg, ratingCount: count });
}

async function recalcUserRating(userId) {
  const stats = await Review.aggregate([
    { $match: { targetUser: userId, targetType: 'user', isHidden: false } },
    { $group: { _id: '$targetUser', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await User.findByIdAndUpdate(userId, { ratingAverage: avg, ratingCount: count });
}

// @desc    Create a review for a listing (product) or a user (seller/repair partner)
// @route   POST /api/reviews
// @access  Private (buyer)
const createReview = asyncHandler(async (req, res) => {
  const { targetType, listing, targetUser, order, rating, comment } = req.body;

  if (!['listing', 'user'].includes(targetType)) {
    throw new ApiError(400, "targetType must be 'listing' or 'user'");
  }
  if (targetType === 'listing' && !listing) throw new ApiError(400, 'listing is required');
  if (targetType === 'user' && !targetUser) throw new ApiError(400, 'targetUser is required');

  const images = normalizeUploadedFiles(req.files, req);

  // A review is "verified purchase" only if the buyer really bought this
  // listing on an order that belongs to them.
  let isVerifiedPurchase = false;
  if (order) {
    const ownedOrder = await Order.findOne({ _id: order, buyer: req.user._id });
    if (ownedOrder) {
      if (targetType === 'listing') {
        isVerifiedPurchase = ownedOrder.items.some((i) => String(i.listing) === String(listing));
      } else {
        isVerifiedPurchase = ownedOrder.items.some((i) => String(i.seller) === String(targetUser));
      }
    }
  }

  const review = await Review.create({
    author: req.user._id,
    targetType,
    listing: targetType === 'listing' ? listing : undefined,
    seller: targetType === 'listing' ? (await Listing.findById(listing).select('seller'))?.seller : undefined,
    targetUser: targetType === 'user' ? targetUser : undefined,
    order,
    rating,
    comment,
    images,
    isVerifiedPurchase,
  });

  if (targetType === 'listing') await recalcListingRating(listing);
  else await recalcUserRating(targetUser);

  res.status(201).json({ success: true, data: review });
});

// @desc    Get all reviews for a listing
// @route   GET /api/reviews/listing/:listingId
// @access  Public
const getListingReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({
    listing: req.params.listingId,
    targetType: 'listing',
    isHidden: false,
  })
    .populate('author', 'name avatarUrl')
    .sort('-createdAt');

  res.json({ success: true, count: reviews.length, data: reviews });
});

// @desc    Get all reviews for a seller / repair partner
// @route   GET /api/reviews/user/:userId
// @access  Public
const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({
    targetUser: req.params.userId,
    targetType: 'user',
    isHidden: false,
  })
    .populate('author', 'name avatarUrl')
    .sort('-createdAt');

  res.json({ success: true, count: reviews.length, data: reviews });
});

// @desc    Delete own review (or admin can remove any)
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  if (String(review.author) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to delete this review');
  }

  await review.deleteOne();

  if (review.targetType === 'listing') await recalcListingRating(review.listing);
  else await recalcUserRating(review.targetUser);

  res.json({ success: true, message: 'Review deleted' });
});

module.exports = { createReview, getListingReviews, getUserReviews, deleteReview };
