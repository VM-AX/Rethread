const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  { url: { type: String, required: true }, publicId: { type: String } },
  { _id: false }
);

const listingSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
    slug: { type: String, unique: true, sparse: true, index: true },
    description: { type: String, required: [true, 'Description is required'], maxlength: 3000 },

    category: {
      type: String,
      required: true,
      enum: ['tops', 'bottoms', 'dresses', 'outerwear', 'footwear', 'accessories', 'denim', 'ethnic-wear'],
    },
    size: { type: String, required: true },
    brand: { type: String, trim: true },
    color: { type: String, trim: true },
    gender: { type: String, enum: ['men', 'women', 'unisex', 'kids'], default: 'unisex' },

    originalPrice: { type: Number, min: 0 },
    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, min: 0, max: 100, default: 0 },

    images: { type: [imageSchema], validate: (v) => v.length > 0 },

    conditionLabel: {
      type: String,
      enum: ['like-new', 'gently-used', 'visible-wear', 'needs-repair'],
      default: 'gently-used',
    },

    // Denormalized AI grading snapshot (full history lives in AIReport)
    aiConditionScore: { type: Number, min: 0, max: 100, default: null },
    aiAuthenticityScore: { type: Number, min: 0, max: 100, default: null },
    aiGraded: { type: Boolean, default: false },
    latestAIReport: { type: mongoose.Schema.Types.ObjectId, ref: 'AIReport' },

    listingType: { type: String, enum: ['fixed', 'auction'], default: 'fixed' },

    status: {
      type: String,
      enum: ['draft', 'active', 'sold', 'removed', 'flagged'],
      default: 'active',
    },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String, default: '' },

    quantity: { type: Number, default: 1, min: 0 },
    tags: [{ type: String, trim: true, lowercase: true }],

    // Offer / negotiation & repair-availability flags surfaced on listing cards
    offersEnabled: { type: Boolean, default: true },
    repairAvailable: { type: Boolean, default: false },

    // Sustainability snapshot for this specific item (defaults can be
    // overridden per-listing by the AI report / seller input)
    sustainabilityRating: { type: String, enum: ['A', 'B', 'C', 'D', 'E'], default: null },

    // Sustainability snapshot copied at purchase time onto Order, but we keep
    // category-level defaults here for display before purchase.
    viewCount: { type: Number, default: 0 },

    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

listingSchema.index({ title: 'text', description: 'text', brand: 'text', tags: 'text' });
listingSchema.index({ category: 1, price: 1, status: 1 });
listingSchema.index({ seller: 1 });

listingSchema.pre('validate', function generateSlug(next) {
  if (!this.title) return next();
  const base = this.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  this.slug = `${base}-${Math.random().toString(36).slice(2, 8)}`;
  next();
});

module.exports = mongoose.model('Listing', listingSchema);
