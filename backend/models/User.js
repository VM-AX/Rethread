const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema(
  {
    line1: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    username: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['buyer', 'seller', 'repair_partner', 'admin'],
      default: 'buyer',
    },
    phone: { type: String, trim: true },
    address: addressSchema,
    avatarUrl: { type: String, default: '' },
    bio: { type: String, maxlength: 500, default: '' },

    // Sustainability gamification — earned via purchases/repairs, shown on profile
    sustainabilityPoints: { type: Number, default: 0 },

    // Lightweight browsing history used for "recently viewed" rails
    recentlyViewed: [
      {
        listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
        viewedAt: { type: Date, default: Date.now },
      },
    ],

    // Repair partner specific
    specialties: [{ type: String }], // e.g. ['denim', 'leather', 'stitching']
    experienceYears: { type: Number, default: 0 },

    // Seller storefront profile (only populated when role === 'seller')
    sellerProfile: {
      shopName: { type: String, trim: true },
      logoUrl: { type: String },
      bannerUrl: { type: String },
      about: { type: String, maxlength: 1000 },
      followers: { type: Number, default: 0 },
      completedSales: { type: Number, default: 0 },
      responseRate: { type: Number, min: 0, max: 100, default: 0 },
      isVerified: { type: Boolean, default: false },
      socialLinks: {
        instagram: String,
        facebook: String,
        website: String,
      },
    },

    // Moderation
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    blockReason: { type: String, default: '' },

    // Aggregated rating (denormalized for fast reads)
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
