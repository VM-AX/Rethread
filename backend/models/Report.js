const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },

    reason: {
      type: String,
      enum: ['counterfeit', 'inappropriate', 'misleading', 'other'],
      required: true,
    },
    description: { type: String, maxlength: 1000, trim: true },

    status: {
      type: String,
      enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
      default: 'pending',
    },

    resolutionNote: { type: String, maxlength: 1000 },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ listing: 1 });

module.exports = mongoose.model('Report', reportSchema);
