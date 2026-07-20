const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const Report = require('../models/Report');
const Listing = require('../models/Listing');

// ---------- Module: Report Listing (buyer flagging + admin moderation) ----------

// @desc    Report a listing as fake, counterfeit, inappropriate, or misleading
// @route   POST /api/reports
// @access  Private (buyer)
const createReport = asyncHandler(async (req, res) => {
  const { listingId, reason, description } = req.body;
  if (!listingId || !reason) {
    throw new ApiError(400, 'listingId and reason are required');
  }

  const listing = await Listing.findById(listingId);
  if (!listing) throw new ApiError(404, 'Listing not found');

  const report = await Report.create({
    reporter: req.user._id,
    listing: listing._id,
    reason,
    description,
  });

  res.status(201).json({ success: true, data: report });
});

// @desc    List all reports for moderation, optionally filtered by status
// @route   GET /api/admin/reports
// @access  Private (admin)
const getAllReports = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const reports = await Report.find(filter)
    .populate('reporter', 'name email')
    .populate('listing', 'title status seller')
    .populate('reviewedBy', 'name')
    .sort('-createdAt');

  res.json({ success: true, count: reports.length, data: reports });
});

// @desc    Resolve, dismiss, or move a report to reviewing
// @route   PATCH /api/admin/reports/:id
// @access  Private (admin)
const updateReport = asyncHandler(async (req, res) => {
  const { status, resolutionNote, moderateListing } = req.body;
  const allowed = ['reviewing', 'resolved', 'dismissed'];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `status must be one of: ${allowed.join(', ')}`);
  }

  const report = await Report.findById(req.params.id);
  if (!report) throw new ApiError(404, 'Report not found');

  report.status = status;
  report.resolutionNote = resolutionNote || report.resolutionNote;
  report.reviewedBy = req.user._id;
  report.reviewedAt = new Date();
  await report.save();

  // Optional convenience: admin can flag/remove the underlying listing in
  // the same action instead of a separate call to the admin listings API.
  if (status === 'resolved' && moderateListing) {
    const listing = await Listing.findById(report.listing);
    if (listing) {
      if (moderateListing === 'remove') listing.status = 'removed';
      if (moderateListing === 'flag') {
        listing.isFlagged = true;
        listing.flagReason = resolutionNote || 'Flagged via user report';
        listing.status = 'flagged';
      }
      await listing.save();
    }
  }

  res.json({ success: true, data: report });
});

module.exports = { createReport, getAllReports, updateReport };
