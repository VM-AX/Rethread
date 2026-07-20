const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { addToWishlist, getWishlist, removeFromWishlist } = require('../controllers/wishlistController');

const router = express.Router();

router.use(protect, authorize('buyer'));

router.get('/', getWishlist);
router.post('/:listingId', addToWishlist);
router.delete('/:listingId', removeFromWishlist);

module.exports = router;
