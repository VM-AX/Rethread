const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  gradeListing, getListingReports, getReportById, listReports, overrideReport,
} = require('../controllers/aiController');

const router = express.Router();

router.post('/listings/:id/grade', protect, authorize('seller', 'admin'), gradeListing);
router.get('/listings/:id/reports', getListingReports);
router.get('/reports', protect, authorize('admin'), listReports);
router.get('/reports/:reportId', protect, getReportById);
router.put('/reports/:reportId/override', protect, authorize('admin'), overrideReport);

module.exports = router;
