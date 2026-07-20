const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  },
  { timestamps: true }
);

// A buyer can only wishlist a given listing once.
wishlistSchema.index({ user: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
