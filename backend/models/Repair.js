const mongoose = require('mongoose');

const repairSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
    repairPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null until accepted

    issueType: {
      type: String,
      enum: ['stitching', 'zipper', 'button', 'stain-removal', 'alteration', 'patch', 'other'],
      required: true,
    },
    description: { type: String, required: true, maxlength: 1000 },
    images: [{ url: String, publicId: String }],
    beforeImages: [{ url: String, publicId: String }],
    afterImages: [{ url: String, publicId: String }],

    preferredDate: { type: Date },
    estimatedCost: { type: Number },
    estimatedCompletionDate: { type: Date },

    status: {
      type: String,
      enum: ['requested', 'accepted', 'rejected', 'in_progress', 'completed', 'delivered', 'cancelled'],
      default: 'requested',
    },
    rejectionReason: { type: String },

    progressUpdates: [
      {
        note: { type: String },
        status: { type: String },
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    completedAt: { type: Date },
  },
  { timestamps: true }
);

repairSchema.index({ repairPartner: 1, status: 1 });
repairSchema.index({ buyer: 1 });

module.exports = mongoose.model('Repair', repairSchema);
