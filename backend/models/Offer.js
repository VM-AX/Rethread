const mongoose = require('mongoose');

// Replaces the old Auction module with a simpler, more practical
// buyer-initiated price negotiation flow: buyer proposes a price, seller
// accepts or rejects, and an accepted offer can be checked out at the
// negotiated price instead of the listing's sticker price.
const offerSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    listingPrice: { type: Number, required: true }, // snapshot of asking price at offer time
    offerPrice: { type: Number, required: true, min: 0 },
    message: { type: String, maxlength: 500, trim: true },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'expired', 'completed'],
      default: 'pending',
    },
    sellerResponseMessage: { type: String, maxlength: 500 },
    respondedAt: { type: Date },

    // Offers auto-expire after a window so listings don't get stuck with
    // stale pending negotiations.
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 72 * 60 * 60 * 1000), // 72h
    },

    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // set once checked out
  },
  { timestamps: true }
);

offerSchema.index({ listing: 1, status: 1 });
offerSchema.index({ buyer: 1, status: 1 });
offerSchema.index({ seller: 1, status: 1 });

module.exports = mongoose.model('Offer', offerSchema);
