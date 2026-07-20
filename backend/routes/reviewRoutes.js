const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
  createReview, getListingReviews, getUserReviews, deleteReview,
} = require('../controllers/reviewController');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('buyer'),
  upload.array('images', 4),
  [body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')],
  validate,
  createReview
);

router.get('/listing/:listingId', getListingReviews);
router.get('/user/:userId', getUserReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
