const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const Listing = require('../models/Listing');
const { normalizeUploadedFiles } = require('../middleware/upload');

// ---------- Module: Listing Management (7 APIs) ----------

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private (seller)
const createListing = asyncHandler(async (req, res) => {
  const files = req.files || [];
  if (files.length === 0) {
    throw new ApiError(400, 'At least one product image is required');
  }

  const images = normalizeUploadedFiles(files, req);

  const listing = await Listing.create({
    ...req.body,
    tags: req.body.tags ? String(req.body.tags).split(',').map((t) => t.trim()) : [],
    seller: req.user._id,
    images,
  });

  res.status(201).json({ success: true, data: listing });
});

// @desc    Get listings created by the logged-in seller
// @route   GET /api/listings/mine
// @access  Private (seller)
const getMyListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ seller: req.user._id }).sort('-createdAt');
  res.json({ success: true, count: listings.length, data: listings });
});

// @desc    Get single listing by id (public product page)
// @route   GET /api/listings/:id
// @access  Public
const getListingById = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate('seller', 'name ratingAverage ratingCount avatarUrl createdAt')
    .populate('latestAIReport');

  if (!listing || listing.status === 'removed') {
    throw new ApiError(404, 'Listing not found');
  }

  listing.viewCount += 1;
  await listing.save({ validateBeforeSave: false });

  res.json({ success: true, data: listing });
});

// @desc    Update a listing (owner only)
// @route   PUT /api/listings/:id
// @access  Private (seller - owner)
const updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found');
  if (String(listing.seller) !== String(req.user._id)) {
    throw new ApiError(403, 'You do not own this listing');
  }

  const editable = [
    'title', 'description', 'category', 'size', 'brand', 'color', 'gender',
    'originalPrice', 'price', 'conditionLabel', 'quantity', 'tags',
    'offersEnabled', 'repairAvailable',
  ];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) listing[field] = req.body[field];
  });
  if (req.body.tags) listing.tags = String(req.body.tags).split(',').map((t) => t.trim());

  await listing.save();
  res.json({ success: true, data: listing });
});

// @desc    Delete (soft-remove) a listing
// @route   DELETE /api/listings/:id
// @access  Private (seller - owner)
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found');
  if (String(listing.seller) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not own this listing');
  }

  listing.status = 'removed';
  await listing.save();
  res.json({ success: true, message: 'Listing removed' });
});

// @desc    Add more images to an existing listing
// @route   POST /api/listings/:id/images
// @access  Private (seller - owner)
const addListingImages = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found');
  if (String(listing.seller) !== String(req.user._id)) {
    throw new ApiError(403, 'You do not own this listing');
  }

  const files = req.files || [];
  if (files.length === 0) throw new ApiError(400, 'No images provided');

  listing.images.push(...normalizeUploadedFiles(files, req));
  await listing.save();
  res.json({ success: true, data: listing });
});

// @desc    Change listing status (draft/active/sold)
// @route   PATCH /api/listings/:id/status
// @access  Private (seller - owner)
const updateListingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['draft', 'active', 'sold'];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${allowed.join(', ')}`);
  }

  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found');
  if (String(listing.seller) !== String(req.user._id)) {
    throw new ApiError(403, 'You do not own this listing');
  }

  listing.status = status;
  await listing.save();
  res.json({ success: true, data: listing });
});

module.exports = {
  createListing,
  getMyListings,
  getListingById,
  updateListing,
  deleteListing,
  addListingImages,
  updateListingStatus,
};
