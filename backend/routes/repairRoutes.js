const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
  createRepairRequest, getMyRepairRequests, getPartnerRequests,
  acceptRepair, rejectRepair, updateRepairProgress,
  uploadBeforeImages, uploadAfterImages,
} = require('../controllers/repairController');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('buyer'),
  upload.array('images', 4),
  [
    body('issueType').notEmpty().withMessage('issueType is required'),
    body('description').trim().notEmpty().withMessage('description is required'),
  ],
  validate,
  createRepairRequest
);

router.get('/mine', protect, authorize('buyer'), getMyRepairRequests);
router.get('/partner/requests', protect, authorize('repair_partner'), getPartnerRequests);
router.patch('/:id/accept', protect, authorize('repair_partner'), acceptRepair);
router.patch('/:id/reject', protect, authorize('repair_partner'), rejectRepair);
router.patch('/:id/progress', protect, authorize('repair_partner'), updateRepairProgress);
router.post(
  '/:id/before-images',
  protect,
  authorize('repair_partner'),
  upload.array('images', 4),
  uploadBeforeImages
);
router.post(
  '/:id/after-images',
  protect,
  authorize('repair_partner'),
  upload.array('images', 4),
  uploadAfterImages
);

module.exports = router;
