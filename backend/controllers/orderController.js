const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const Offer = require('../models/Offer');
const { getImpactForCategory } = require('../utils/impactData');

// ---------- Module: Order & Payment Flow (7 APIs) ----------

// @desc    Checkout — create an order from a list of {listingId, quantity, offerId?}
// @route   POST /api/orders
// @access  Private (buyer)
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, payment } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Order must contain at least one item');
  }

  const listingIds = items.map((i) => i.listingId);
  const listings = await Listing.find({ _id: { $in: listingIds }, status: 'active' });

  if (listings.length !== items.length) {
    throw new ApiError(400, 'One or more items are no longer available');
  }

  // Resolve any accepted offers referenced on the checkout items so items can
  // be purchased at their negotiated price instead of the sticker price.
  const offerIds = items.map((i) => i.offerId).filter(Boolean);
  const offers = offerIds.length
    ? await Offer.find({ _id: { $in: offerIds }, buyer: req.user._id, status: 'accepted' })
    : [];

  let subtotal = 0;
  let totalWaterSavedLiters = 0;
  let totalCo2SavedKg = 0;
  let totalTextileWasteDivertedKg = 0;

  const orderItems = items.map((reqItem) => {
    const listing = listings.find((l) => String(l._id) === reqItem.listingId);
    const quantity = reqItem.quantity || 1;
    const impact = getImpactForCategory(listing.category);

    let unitPrice = listing.price;
    let matchedOffer = null;
    if (reqItem.offerId) {
      matchedOffer = offers.find(
        (o) => String(o._id) === reqItem.offerId && String(o.listing) === String(listing._id)
      );
      if (!matchedOffer) {
        throw new ApiError(400, 'Offer is invalid, not yours, or not yet accepted');
      }
      unitPrice = matchedOffer.offerPrice;
    }

    subtotal += unitPrice * quantity;
    totalWaterSavedLiters += impact.waterSavedLiters * quantity;
    totalCo2SavedKg += impact.co2SavedKg * quantity;
    totalTextileWasteDivertedKg += impact.textileWasteDivertedKg * quantity;

    return {
      listing: listing._id,
      seller: listing.seller,
      title: listing.title,
      price: unitPrice,
      quantity,
      category: listing.category,
      waterSavedLiters: impact.waterSavedLiters * quantity,
      co2SavedKg: impact.co2SavedKg * quantity,
      textileWasteDivertedKg: impact.textileWasteDivertedKg * quantity,
      offer: matchedOffer ? matchedOffer._id : undefined,
      negotiated: Boolean(matchedOffer),
    };
  });

  const shippingFee = subtotal > 2000 ? 0 : 99;

  const order = await Order.create({
    buyer: req.user._id,
    items: orderItems,
    subtotal,
    shippingFee,
    total: subtotal + shippingFee,
    shippingAddress,
    payment: { method: payment?.method || 'mock_card', status: 'pending' },
    totalWaterSavedLiters,
    totalCo2SavedKg,
    totalTextileWasteDivertedKg,
  });

  // Mark listings as sold (simple single-unit resale assumption)
  await Listing.updateMany({ _id: { $in: listingIds } }, { $set: { status: 'sold' } });

  // Close out any offers used in this checkout
  if (offers.length) {
    await Offer.updateMany(
      { _id: { $in: offers.map((o) => o._id) } },
      { $set: { status: 'completed', order: order._id } }
    );
  }

  res.status(201).json({ success: true, data: order });
});

// @desc    Get orders placed by the logged-in buyer
// @route   GET /api/orders/mine
// @access  Private (buyer)
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id }).sort('-createdAt');
  res.json({ success: true, count: orders.length, data: orders });
});

// @desc    Get single order (buyer who owns it, seller of an item, or admin)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('buyer', 'name email');
  if (!order) throw new ApiError(404, 'Order not found');

  const isBuyer = String(order.buyer._id) === String(req.user._id);
  const isSeller = order.items.some((i) => String(i.seller) === String(req.user._id));
  if (!isBuyer && !isSeller && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to view this order');
  }

  res.json({ success: true, data: order });
});

// @desc    Orders containing items sold by the logged-in seller
// @route   GET /api/orders/seller/mine
// @access  Private (seller)
const getSellerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ 'items.seller': req.user._id }).sort('-createdAt');
  res.json({ success: true, count: orders.length, data: orders });
});

// @desc    Update order status (seller ships/delivers, admin can override)
// @route   PATCH /api/orders/:id/status
// @access  Private (seller of an item / admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['confirmed', 'shipped', 'delivered', 'returned'];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${allowed.join(', ')}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  const isSeller = order.items.some((i) => String(i.seller) === String(req.user._id));
  if (!isSeller && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to update this order');
  }

  order.status = status;
  await order.save();
  res.json({ success: true, data: order });
});

// @desc    Mock payment processing for an order
// @route   POST /api/orders/:id/pay
// @access  Private (buyer)
const payOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  if (String(order.buyer) !== String(req.user._id)) {
    throw new ApiError(403, 'Not authorized to pay for this order');
  }
  if (order.payment.status === 'paid') {
    throw new ApiError(400, 'Order is already paid');
  }

  // Mock payment gateway — always succeeds and generates a fake transaction id.
  order.payment.status = 'paid';
  order.payment.transactionId = `MOCK-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  order.payment.paidAt = new Date();
  order.status = 'confirmed';
  await order.save();

  res.json({ success: true, data: order });
});

// @desc    Cancel an order (buyer, before shipping)
// @route   POST /api/orders/:id/cancel
// @access  Private (buyer)
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  if (String(order.buyer) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to cancel this order');
  }
  if (['shipped', 'delivered'].includes(order.status)) {
    throw new ApiError(400, 'Order has already shipped and cannot be cancelled');
  }

  order.status = 'cancelled';
  order.cancelReason = req.body.reason || 'Cancelled by buyer';
  await order.save();

  await Listing.updateMany(
    { _id: { $in: order.items.map((i) => i.listing) } },
    { $set: { status: 'active' } }
  );

  res.json({ success: true, data: order });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getSellerOrders,
  updateOrderStatus,
  payOrder,
  cancelOrder,
};
