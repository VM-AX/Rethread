const asyncHandler = require('../middleware/asyncHandler');
const Listing = require('../models/Listing');
const User = require('../models/User');
const APIFeatures = require('../utils/apiFeatures');

// ---------- Module: Search & Filters (5 APIs) ----------

// @desc    Search + filter listings (brand, category, size, gender, price range,
//          condition, seller rating, sustainability score, AI authenticity score)
// @route   GET /api/search/listings
// @access  Public
const searchListings = asyncHandler(async (req, res) => {
  const baseFilter = { status: 'active' };

  // sellerRating is a filter on the populated User, so resolve it first into
  // a set of eligible seller ids before running the main listing query.
  if (req.query.sellerRating) {
    const minRating = Number(req.query.sellerRating);
    const sellers = await User.find({ role: 'seller', ratingAverage: { $gte: minRating } }).select('_id');
    baseFilter.seller = { $in: sellers.map((s) => s._id) };
    delete req.query.sellerRating;
  }

  let query = Listing.find(baseFilter).populate('seller', 'name ratingAverage');

  const features = new APIFeatures(query, req.query)
    .search(['title', 'description', 'brand', 'tags'])
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const [listings, total] = await Promise.all([
    features.query,
    Listing.countDocuments(baseFilter),
  ]);

  res.json({
    success: true,
    count: listings.length,
    total,
    page: features.pagination.page,
    limit: features.pagination.limit,
    data: listings,
  });
});

// @desc    Get distinct categories with counts (for filter sidebar)
// @route   GET /api/search/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Listing.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  res.json({ success: true, data: categories });
});

// @desc    Get distinct brands (for filter sidebar)
// @route   GET /api/search/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Listing.distinct('brand', { status: 'active', brand: { $ne: '' } });
  res.json({ success: true, data: brands.sort() });
});

// @desc    Lightweight autocomplete suggestions by keyword
// @route   GET /api/search/suggestions
// @access  Public
const getSuggestions = asyncHandler(async (req, res) => {
  const { keyword = '' } = req.query;
  if (!keyword.trim()) return res.json({ success: true, data: [] });

  const regex = new RegExp(keyword, 'i');
  const suggestions = await Listing.find({ status: 'active', title: regex })
    .select('title slug images price')
    .limit(8);

  res.json({ success: true, data: suggestions });
});

// @desc    Trending / most-viewed active listings
// @route   GET /api/search/trending
// @access  Public
const getTrending = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ status: 'active' })
    .sort('-viewCount')
    .limit(12)
    .select('title price images category viewCount ratingAverage');
  res.json({ success: true, data: listings });
});

module.exports = { searchListings, getCategories, getBrands, getSuggestions, getTrending };
