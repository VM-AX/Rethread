const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true }, // snapshot at purchase time
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    category: { type: String, required: true },

    // Sustainability snapshot per item (see utils/impactData.js)
    waterSavedLiters: { type: Number, required: true },
    co2SavedKg: { type: Number, required: true },
    textileWasteDivertedKg: { type: Number, default: 0 },

    // Set when this item was purchased at a negotiated price via the Offer system
    offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
    negotiated: { type: Boolean, default: false },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },

    shippingAddress: {
      line1: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },

    payment: {
      method: { type: String, enum: ['mock_card', 'mock_upi', 'cod'], default: 'mock_card' },
      status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
      transactionId: { type: String },
      paidAt: { type: Date },
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },

    // Aggregated impact for the whole order (sum of items)
    totalWaterSavedLiters: { type: Number, default: 0 },
    totalCo2SavedKg: { type: Number, default: 0 },
    totalTextileWasteDivertedKg: { type: Number, default: 0 },

    cancelReason: { type: String },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ 'items.seller': 1 });

module.exports = mongoose.model('Order', orderSchema);
