const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const Offer = require('../models/Offer');
const Listing = require('../models/Listing');

// ---------- Module: Offer / Price Negotiation System ----------
// Replaces the previous Auction module. A buyer proposes a price on a fixed
// listing, the seller accepts or rejects it, and an accepted offer can be
// checked out at the negotiated price (see orderController.createOrder).

// @desc    Send an offer on a listing
// @route   POST /api/offers
// @access  Private (buyer)
const createOffer = asyncHandler(async (req, res) => {
  const { listingId, offerPrice, message } = req.body;
  if (!listingId || offerPrice === undefined) {
    throw new ApiError(400, 'listingId and offerPrice are required');
  }

  const listing = await Listing.findById(listingId);
  if (!listing || listing.status !== 'active') {
    throw new ApiError(404, 'Listing not found or no longer available');
  }
  if (listing.offersEnabled === false) {
    throw new ApiError(400, 'The seller has disabled offers for this listing');
  }
  if (String(listing.seller) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot make an offer on your own listing');
  }
  if (Number(offerPrice) <= 0 || Number(offerPrice) >= listing.price) {
    throw new ApiError(400, 'Offer price must be a positive amount below the listing price');
  }

  const existing = await Offer.findOne({
    listing: listingId,
    buyer: req.user._id,
    status: 'pending',
  });
  if (existing) {
    throw new ApiError(409, 'You already have a pending offer on this listing');
  }

  const offer = await Offer.create({
    listing: listing._id,
    buyer: req.user._id,
    seller: listing.seller,
    listingPrice: listing.price,
    offerPrice,
    message,
  });

  res.status(201).json({ success: true, data: offer });
});

// @desc    List offers relevant to the logged-in user (sent as buyer, or
//          received as seller). Admins may pass ?all=true to see every offer.
// @route   GET /api/offers
// @access  Private
const getOffers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'admin' && req.query.all === 'true') {
    // no restriction
  } else if (req.query.as === 'seller') {
    filter.seller = req.user._id;
  } else if (req.query.as === 'buyer') {
    filter.buyer = req.user._id;
  } else {
    filter.$or = [{ buyer: req.user._id }, { seller: req.user._id }];
  }
  if (req.query.status) filter.status = req.query.status;
  if (req.query.listingId) filter.listing = req.query.listingId;

  const offers = await Offer.find(filter)
    .populate('listing', 'title images price status')
    .populate('buyer', 'name avatarUrl')
    .populate('seller', 'name avatarUrl')
    .sort('-createdAt');

  res.json({ success: true, count: offers.length, data: offers });
});

// @desc    Get a single offer
// @route   GET /api/offers/:id
// @access  Private (buyer, seller involved, or admin)
const getOfferById = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id)
    .populate('listing', 'title images price status seller')
    .populate('buyer', 'name avatarUrl')
    .populate('seller', 'name avatarUrl');
  if (!offer) throw new ApiError(404, 'Offer not found');

  const isParty = [String(offer.buyer._id), String(offer.seller._id)].includes(String(req.user._id));
  if (!isParty && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to view this offer');
  }

  res.json({ success: true, data: offer });
});

// @desc    Seller accepts an offer
// @route   PATCH /api/offers/:id/accept
// @access  Private (seller who owns the listing)
const acceptOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw new ApiError(404, 'Offer not found');
  if (String(offer.seller) !== String(req.user._id)) {
    throw new ApiError(403, 'Not authorized to respond to this offer');
  }
  if (offer.status !== 'pending') {
    throw new ApiError(400, `Offer has already been ${offer.status}`);
  }

  offer.status = 'accepted';
  offer.sellerResponseMessage = req.body.message || '';
  offer.respondedAt = new Date();
  await offer.save();

  // Auto-reject any other pending offers on the same listing — only one
  // negotiated price can be honored at checkout.
  await Offer.updateMany(
    { listing: offer.listing, _id: { $ne: offer._id }, status: 'pending' },
    { $set: { status: 'rejected', sellerResponseMessage: 'Another offer was accepted', respondedAt: new Date() } }
  );

  res.json({ success: true, data: offer });
});

// @desc    Seller rejects an offer
// @route   PATCH /api/offers/:id/reject
// @access  Private (seller who owns the listing)
const rejectOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw new ApiError(404, 'Offer not found');
  if (String(offer.seller) !== String(req.user._id)) {
    throw new ApiError(403, 'Not authorized to respond to this offer');
  }
  if (offer.status !== 'pending') {
    throw new ApiError(400, `Offer has already been ${offer.status}`);
  }

  offer.status = 'rejected';
  offer.sellerResponseMessage = req.body.message || '';
  offer.respondedAt = new Date();
  await offer.save();

  res.json({ success: true, data: offer });
});

// @desc    Withdraw (buyer) or remove (admin) an offer
// @route   DELETE /api/offers/:id
// @access  Private (buyer who sent it, or admin)
const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw new ApiError(404, 'Offer not found');

  const isOwner = String(offer.buyer) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to remove this offer');
  }
  if (offer.status === 'completed') {
    throw new ApiError(400, 'A completed offer cannot be removed');
  }

  if (isOwner && offer.status === 'pending') {
    offer.status = 'withdrawn';
    await offer.save();
  } else {
    await offer.deleteOne();
  }

  res.json({ success: true, message: 'Offer removed' });
});

module.exports = { createOffer, getOffers, getOfferById, acceptOffer, rejectOffer, deleteOffer };
