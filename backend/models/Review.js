const mongoose = require('mongoose');

// A single Review model handles both:
//  - product reviews (target = 'listing')
//  - seller/repair-partner reviews (target = 'user')
const reviewSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['listing', 'user'], required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // denormalized from listing.seller when targetType === 'listing'
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // proof of purchase

    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 120, trim: true },
    comment: { type: String, maxlength: 1000 },
    images: [{ url: String, publicId: String }],
    isVerifiedPurchase: { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0 },

    isFlagged: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ listing: 1 });
reviewSchema.index({ targetUser: 1 });
reviewSchema.index({ author: 1, listing: 1 }, { unique: false });

module.exports = mongoose.model('Review', reviewSchema);
