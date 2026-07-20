const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const Repair = require('../models/Repair');
const { normalizeUploadedFiles } = require('../middleware/upload');

// ---------- Module: Repair Partner Booking (6 APIs) ----------

// @desc    Book a repair request (typically after a purchase)
// @route   POST /api/repairs
// @access  Private (buyer)
const createRepairRequest = asyncHandler(async (req, res) => {
  const { order, listing, issueType, description, preferredDate, estimatedCost } = req.body;
  const images = normalizeUploadedFiles(req.files, req);

  const repair = await Repair.create({
    buyer: req.user._id,
    order,
    listing,
    issueType,
    description,
    preferredDate,
    estimatedCost,
    images,
  });

  res.status(201).json({ success: true, data: repair });
});

// @desc    Get logged-in buyer's repair requests
// @route   GET /api/repairs/mine
// @access  Private (buyer)
const getMyRepairRequests = asyncHandler(async (req, res) => {
  const repairs = await Repair.find({ buyer: req.user._id })
    .populate('repairPartner', 'name ratingAverage')
    .sort('-createdAt');
  res.json({ success: true, count: repairs.length, data: repairs });
});

// @desc    Repair partner view: unassigned + their own assigned requests
// @route   GET /api/repairs/partner/requests
// @access  Private (repair_partner)
const getPartnerRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status
    ? { status, $or: [{ repairPartner: req.user._id }, { repairPartner: null }] }
    : { $or: [{ repairPartner: req.user._id }, { repairPartner: null, status: 'requested' }] };

  const repairs = await Repair.find(filter)
    .populate('buyer', 'name phone')
    .populate('listing', 'title images')
    .sort('-createdAt');
  res.json({ success: true, count: repairs.length, data: repairs });
});

// @desc    Repair partner accepts a request (optionally sets an ETA)
// @route   PATCH /api/repairs/:id/accept
// @access  Private (repair_partner)
const acceptRepair = asyncHandler(async (req, res) => {
  const repair = await Repair.findById(req.params.id);
  if (!repair) throw new ApiError(404, 'Repair request not found');
  if (repair.status !== 'requested') {
    throw new ApiError(400, 'This request has already been handled');
  }

  repair.status = 'accepted';
  repair.repairPartner = req.user._id;
  if (req.body.estimatedCompletionDate) {
    repair.estimatedCompletionDate = req.body.estimatedCompletionDate;
  }
  if (req.body.estimatedCost !== undefined) {
    repair.estimatedCost = req.body.estimatedCost;
  }
  repair.progressUpdates.push({ note: 'Request accepted', status: 'accepted' });
  await repair.save();

  res.json({ success: true, data: repair });
});

// @desc    Repair partner rejects a request
// @route   PATCH /api/repairs/:id/reject
// @access  Private (repair_partner)
const rejectRepair = asyncHandler(async (req, res) => {
  const repair = await Repair.findById(req.params.id);
  if (!repair) throw new ApiError(404, 'Repair request not found');
  if (repair.status !== 'requested') {
    throw new ApiError(400, 'This request has already been handled');
  }

  repair.status = 'rejected';
  repair.rejectionReason = req.body.reason || 'Not available';
  await repair.save();

  res.json({ success: true, data: repair });
});

// @desc    Update repair progress / status (in_progress, completed, delivered)
// @route   PATCH /api/repairs/:id/progress
// @access  Private (repair_partner - assigned)
const updateRepairProgress = asyncHandler(async (req, res) => {
  const { status, note, estimatedCompletionDate } = req.body;
  const allowed = ['in_progress', 'completed', 'delivered'];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${allowed.join(', ')}`);
  }

  const repair = await Repair.findById(req.params.id);
  if (!repair) throw new ApiError(404, 'Repair request not found');
  if (String(repair.repairPartner) !== String(req.user._id)) {
    throw new ApiError(403, 'Not authorized to update this repair');
  }
  if (status === 'delivered' && repair.status !== 'completed') {
    throw new ApiError(400, 'Repair must be marked completed before it can be delivered');
  }

  repair.status = status;
  if (estimatedCompletionDate) repair.estimatedCompletionDate = estimatedCompletionDate;
  repair.progressUpdates.push({ note: note || status, status });
  if (status === 'completed') repair.completedAt = new Date();
  await repair.save();

  res.json({ success: true, data: repair });
});

// @desc    Upload "before" images for a repair (taken on intake)
// @route   POST /api/repairs/:id/before-images
// @access  Private (repair_partner - assigned)
const uploadBeforeImages = asyncHandler(async (req, res) => {
  const repair = await Repair.findById(req.params.id);
  if (!repair) throw new ApiError(404, 'Repair request not found');
  if (String(repair.repairPartner) !== String(req.user._id)) {
    throw new ApiError(403, 'Not authorized to update this repair');
  }

  const images = normalizeUploadedFiles(req.files, req);
  repair.beforeImages.push(...images);
  await repair.save();

  res.json({ success: true, data: repair });
});

// @desc    Upload "after" images for a repair (taken once work is done)
// @route   POST /api/repairs/:id/after-images
// @access  Private (repair_partner - assigned)
const uploadAfterImages = asyncHandler(async (req, res) => {
  const repair = await Repair.findById(req.params.id);
  if (!repair) throw new ApiError(404, 'Repair request not found');
  if (String(repair.repairPartner) !== String(req.user._id)) {
    throw new ApiError(403, 'Not authorized to update this repair');
  }

  const images = normalizeUploadedFiles(req.files, req);
  repair.afterImages.push(...images);
  await repair.save();

  res.json({ success: true, data: repair });
});

module.exports = {
  createRepairRequest,
  getMyRepairRequests,
  getPartnerRequests,
  acceptRepair,
  rejectRepair,
  updateRepairProgress,
  uploadBeforeImages,
  uploadAfterImages,
};
