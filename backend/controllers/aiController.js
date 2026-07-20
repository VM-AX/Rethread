const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const Listing = require('../models/Listing');
const AIReport = require('../models/AIReport');
const { gradeListingImages } = require('../utils/aiMock');

// ---------- Module: AI Condition / Authenticity Grading (5 APIs) ----------
// NOTE: `utils/aiMock.js` is the single seam to replace with a real model.

// @desc    Run AI grading on a listing's images
// @route   POST /api/ai/listings/:id/grade
// @access  Private (seller - owner)
const gradeListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found');
  if (String(listing.seller) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not own this listing');
  }

  const result = gradeListingImages({
    imageUrls: listing.images.map((i) => i.url),
    category: listing.category,
    brand: listing.brand,
    originalPrice: listing.originalPrice || listing.price,
  });

  const report = await AIReport.create({
    listing: listing._id,
    requestedBy: req.user._id,
    ...result,
  });

  listing.aiConditionScore = result.conditionScore;
  listing.aiAuthenticityScore = result.authenticityScore;
  listing.conditionLabel = result.conditionLabel;
  listing.aiGraded = true;
  listing.latestAIReport = report._id;
  listing.isFlagged = result.flaggedForReview || listing.isFlagged;
  if (result.suggestedRepair) listing.repairAvailable = true;
  await listing.save();

  res.status(201).json({ success: true, data: report });
});

// @desc    Get grading history for a listing
// @route   GET /api/ai/listings/:id/reports
// @access  Public
const getListingReports = asyncHandler(async (req, res) => {
  const reports = await AIReport.find({ listing: req.params.id }).sort('-createdAt');
  res.json({ success: true, count: reports.length, data: reports });
});

// @desc    Get a single AI report
// @route   GET /api/ai/reports/:reportId
// @access  Private
const getReportById = asyncHandler(async (req, res) => {
  const report = await AIReport.findById(req.params.reportId).populate('listing', 'title seller');
  if (!report) throw new ApiError(404, 'Report not found');
  res.json({ success: true, data: report });
});

// @desc    List all AI reports (optionally flagged only) — moderation feed
// @route   GET /api/ai/reports
// @access  Private (admin)
const listReports = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.flagged === 'true') filter.flaggedForReview = true;

  const reports = await AIReport.find(filter)
    .populate('listing', 'title status')
    .sort('-createdAt')
    .limit(200);

  res.json({ success: true, count: reports.length, data: reports });
});

// @desc    Admin overrides/reviews an AI report's scores
// @route   PUT /api/ai/reports/:reportId/override
// @access  Private (admin)
const overrideReport = asyncHandler(async (req, res) => {
  const { conditionScore, authenticityScore, comment } = req.body;
  const report = await AIReport.findById(req.params.reportId);
  if (!report) throw new ApiError(404, 'Report not found');

  report.adminReviewed = true;
  report.adminOverride = {
    conditionScore,
    authenticityScore,
    reviewedBy: req.user._id,
    reviewedAt: new Date(),
    comment,
  };
  await report.save();

  if (conditionScore !== undefined || authenticityScore !== undefined) {
    await Listing.findByIdAndUpdate(report.listing, {
      ...(conditionScore !== undefined && { aiConditionScore: conditionScore }),
      ...(authenticityScore !== undefined && { aiAuthenticityScore: authenticityScore }),
    });
  }

  res.json({ success: true, data: report });
});

module.exports = { gradeListing, getListingReports, getReportById, listReports, overrideReport };
