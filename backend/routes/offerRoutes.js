const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  createOffer, getOffers, getOfferById, acceptOffer, rejectOffer, deleteOffer,
} = require('../controllers/offerController');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('buyer'),
  [
    body('listingId').notEmpty().withMessage('listingId is required'),
    body('offerPrice').isFloat({ min: 0.01 }).withMessage('offerPrice must be a positive number'),
  ],
  validate,
  createOffer
);

router.get('/', protect, getOffers);
router.get('/:id', protect, getOfferById);
router.patch('/:id/accept', protect, authorize('seller'), acceptOffer);
router.patch('/:id/reject', protect, authorize('seller'), rejectOffer);
router.delete('/:id', protect, authorize('buyer', 'admin'), deleteOffer);

module.exports = router;
