const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  createOrder, getMyOrders, getOrderById, getSellerOrders,
  updateOrderStatus, payOrder, cancelOrder,
} = require('../controllers/orderController');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('buyer'),
  [body('items').isArray({ min: 1 }).withMessage('Order must include at least one item')],
  validate,
  createOrder
);

router.get('/mine', protect, authorize('buyer'), getMyOrders);
router.get('/seller/mine', protect, authorize('seller'), getSellerOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/status', protect, authorize('seller', 'admin'), updateOrderStatus);
router.post('/:id/pay', protect, authorize('buyer'), payOrder);
router.post('/:id/cancel', protect, authorize('buyer', 'admin'), cancelOrder);

module.exports = router;
