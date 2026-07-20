const express = require('express');
const {
  searchListings, getCategories, getBrands, getSuggestions, getTrending,
} = require('../controllers/searchController');

const router = express.Router();

router.get('/listings', searchListings);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/suggestions', getSuggestions);
router.get('/trending', getTrending);

module.exports = router;
