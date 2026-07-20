const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
  createListing, getMyListings, getListingById, updateListing,
  deleteListing, addListingImages, updateListingStatus,
} = require('../controllers/listingController');

const router = express.Router();

const listingValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('size').notEmpty().withMessage('Size is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

router.post(
  '/',
  protect,
  authorize('seller'),
  upload.array('images', 8),
  listingValidation,
  validate,
  createListing
);

router.get('/mine', protect, authorize('seller'), getMyListings);
router.get('/:id', getListingById);
router.put('/:id', protect, authorize('seller'), updateListing);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteListing);
router.post('/:id/images', protect, authorize('seller'), upload.array('images', 8), addListingImages);
router.patch('/:id/status', protect, authorize('seller'), updateListingStatus);

module.exports = router;
