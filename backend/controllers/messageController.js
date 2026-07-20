const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const { Conversation, Message } = require('../models/Message');

// ---------- Module: Buyer-Seller Messaging (6 APIs) ----------

// @desc    Start (or fetch existing) conversation with another user, optionally about a listing
// @route   POST /api/messages/conversations
// @access  Private
const startConversation = asyncHandler(async (req, res) => {
  const { recipientId, listingId } = req.body;
  if (!recipientId) throw new ApiError(400, 'recipientId is required');
  if (recipientId === String(req.user._id)) throw new ApiError(400, 'Cannot message yourself');

  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, recipientId], $size: 2 },
    ...(listingId ? { listing: listingId } : {}),
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, recipientId],
      listing: listingId || undefined,
    });
  }

  res.status(201).json({ success: true, data: conversation });
});

// @desc    List conversations for the logged-in user
// @route   GET /api/messages/conversations
// @access  Private
const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'name avatarUrl role')
    .populate('listing', 'title images')
    .sort('-lastMessageAt');

  res.json({ success: true, count: conversations.length, data: conversations });
});

// @desc    Get messages within a conversation
// @route   GET /api/messages/conversations/:id/messages
// @access  Private (participant)
const getMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  if (!conversation.participants.some((p) => String(p) === String(req.user._id))) {
    throw new ApiError(403, 'Not a participant in this conversation');
  }

  const messages = await Message.find({ conversation: req.params.id }).sort('createdAt');
  res.json({ success: true, count: messages.length, data: messages });
});

// @desc    Send a message within a conversation
// @route   POST /api/messages/conversations/:id/messages
// @access  Private (participant)
const sendMessage = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  if (!conversation.participants.some((p) => String(p) === String(req.user._id))) {
    throw new ApiError(403, 'Not a participant in this conversation');
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    text,
    readBy: [req.user._id],
  });

  conversation.lastMessage = text;
  conversation.lastMessageAt = new Date();
  await conversation.save();

  res.status(201).json({ success: true, data: message });
});

// @desc    Mark all messages in a conversation as read by the logged-in user
// @route   PATCH /api/messages/conversations/:id/read
// @access  Private (participant)
const markConversationRead = asyncHandler(async (req, res) => {
  await Message.updateMany(
    { conversation: req.params.id, readBy: { $ne: req.user._id } },
    { $addToSet: { readBy: req.user._id } }
  );
  res.json({ success: true, message: 'Conversation marked as read' });
});

// @desc    Report a conversation for admin review (spam/abuse/fraud)
// @route   POST /api/messages/conversations/:id/report
// @access  Private (participant)
const reportConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  if (!conversation.participants.some((p) => String(p) === String(req.user._id))) {
    throw new ApiError(403, 'Not a participant in this conversation');
  }

  conversation.isReported = true;
  conversation.reportReason = req.body.reason || 'Reported by user';
  await conversation.save();

  res.json({ success: true, message: 'Conversation reported to admin' });
});

module.exports = {
  startConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  markConversationRead,
  reportConversation,
};
