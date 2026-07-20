const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (buyer, seller, or repair_partner — never admin)
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, specialties, experienceYears } = req.body;

  if (role === 'admin') {
    throw new ApiError(403, 'Admin accounts cannot be created through registration');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'buyer',
    phone,
    specialties: role === 'repair_partner' ? specialties : undefined,
    experienceYears: role === 'repair_partner' ? experienceYears : undefined,
  });

  const token = generateToken(user);
  res.status(201).json({ success: true, data: { user: user.toSafeObject(), token } });
});

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (user.isDeleted) {
    throw new ApiError(401, 'This account no longer exists');
  }
  if (user.isBlocked) {
    throw new ApiError(403, 'Your account has been blocked. Contact support.');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user);
  res.json({ success: true, data: { user: user.toSafeObject(), token } });
});

// @desc    Get current logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.toSafeObject() });
});

// @desc    Update own profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'address', 'avatarUrl', 'specialties', 'experienceYears'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, data: user.toSafeObject() });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = { register, login, getMe, updateMe, changePassword };
