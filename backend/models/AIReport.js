const mongoose = require('mongoose');

// Stores every AI grading run for full auditability/history.
// Implementation is a rule-based mock today; swap `utils/aiMock.js` for a
// real model call later without touching this schema or the controller flow.
const aiReportSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    conditionScore: { type: Number, min: 0, max: 100, required: true },
    authenticityScore: { type: Number, min: 0, max: 100, required: true },
    conditionLabel: {
      type: String,
      enum: ['like-new', 'gently-used', 'visible-wear', 'needs-repair'],
      required: true,
    },
    authenticityConfidence: {
      type: String,
      enum: ['high', 'medium', 'low'],
      required: true,
    },

    flaggedForReview: { type: Boolean, default: false },
    notes: [{ type: String }],

    // Richer breakdown surfaced on the product page (see utils/aiMock.js)
    detectedDefects: [{ type: String }],
    suggestedRepair: { type: String, default: null },
    estimatedResalePrice: { type: Number, default: null },

    modelVersion: { type: String, default: 'mock-grading-v1' },
    imagesAnalyzed: { type: Number, default: 0 },

    // Admin can review/override AI output
    adminReviewed: { type: Boolean, default: false },
    adminOverride: {
      conditionScore: { type: Number },
      authenticityScore: { type: Number },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reviewedAt: { type: Date },
      comment: { type: String },
    },
  },
  { timestamps: true }
);

aiReportSchema.index({ listing: 1, createdAt: -1 });

module.exports = mongoose.model('AIReport', aiReportSchema);
