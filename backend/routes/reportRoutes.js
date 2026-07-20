const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { createReport } = require('../controllers/reportController');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('buyer'),
  [
    body('listingId').notEmpty().withMessage('listingId is required'),
    body('reason')
      .isIn(['counterfeit', 'inappropriate', 'misleading', 'other'])
      .withMessage('reason must be one of: counterfeit, inappropriate, misleading, other'),
  ],
  validate,
  createReport
);

module.exports = router;
