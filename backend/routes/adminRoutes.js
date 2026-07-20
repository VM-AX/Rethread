const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getAllUsers, toggleBlockUser, toggleDeleteUser,
  getAllListingsAdmin, moderateListing, getDashboardStats,
} = require('../controllers/adminController');
const { getAllReports, updateReport } = require('../controllers/reportController');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.patch('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', toggleDeleteUser);
router.get('/listings', getAllListingsAdmin);
router.patch('/listings/:id/moderate', moderateListing);
router.get('/dashboard', getDashboardStats);
router.get('/reports', getAllReports);
router.patch('/reports/:id', updateReport);

module.exports = router;
