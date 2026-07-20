const mongoose = require('mongoose');

// Lightweight, read-only-by-recipient notification feed. Added specifically
// to support realistic seed data / an activity feed — kept intentionally
// minimal (no push delivery, no preferences) so it doesn't become a full
// notification subsystem.
const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'product_sold',
        'new_order',
        'order_delivered',
        'repair_completed',
        'offer_received',
        'review_added',
        'new_follower',
      ],
      required: true,
    },
    message: { type: String, required: true, maxlength: 300 },

    // Loosely-typed pointer to whatever triggered the notification
    // (an order, listing, repair, offer, or review id).
    relatedType: { type: String, enum: ['order', 'listing', 'repair', 'offer', 'review', 'user'] },
    relatedId: { type: mongoose.Schema.Types.ObjectId },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
