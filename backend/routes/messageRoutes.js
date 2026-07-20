const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  startConversation, getMyConversations, getMessages,
  sendMessage, markConversationRead, reportConversation,
} = require('../controllers/messageController');

const router = express.Router();

router.post('/conversations', protect, startConversation);
router.get('/conversations', protect, getMyConversations);
router.get('/conversations/:id/messages', protect, getMessages);
router.post(
  '/conversations/:id/messages',
  protect,
  [body('text').trim().notEmpty().withMessage('Message text is required')],
  validate,
  sendMessage
);
router.patch('/conversations/:id/read', protect, markConversationRead);
router.post('/conversations/:id/report', protect, reportConversation);

module.exports = router;
