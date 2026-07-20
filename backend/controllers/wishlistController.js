const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const Wishlist = require('../models/Wishlist');
const Listing = require('../models/Listing');

// ---------- Module: Wishlist ----------

// @desc    Save a listing to the buyer's wishlist
// @route   POST /api/wishlist/:listingId
// @access  Private (buyer)
const addToWishlist = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.listingId);
  if (!listing) throw new ApiError(404, 'Listing not found');

  const entry = await Wishlist.findOneAndUpdate(
    { user: req.user._id, listing: listing._id },
    { user: req.user._id, listing: listing._id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ success: true, data: entry });
});

// @desc    Get the logged-in buyer's wishlist
// @route   GET /api/wishlist
// @access  Private (buyer)
const getWishlist = asyncHandler(async (req, res) => {
  const items = await Wishlist.find({ user: req.user._id })
    .populate({
      path: 'listing',
      select: 'title price images conditionLabel aiAuthenticityScore ratingAverage ratingCount status repairAvailable',
    })
    .sort('-createdAt');

  // Filter out wishlist entries whose listing has since been removed
  const data = items.filter((i) => i.listing);
  res.json({ success: true, count: data.length, data });
});

// @desc    Remove a listing from the wishlist
// @route   DELETE /api/wishlist/:listingId
// @access  Private (buyer)
const removeFromWishlist = asyncHandler(async (req, res) => {
  const result = await Wishlist.findOneAndDelete({
    user: req.user._id,
    listing: req.params.listingId,
  });
  if (!result) throw new ApiError(404, 'This listing is not in your wishlist');

  res.json({ success: true, message: 'Removed from wishlist' });
});

module.exports = { addToWishlist, getWishlist, removeFromWishlist };
