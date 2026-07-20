const asyncHandler = require('../middleware/asyncHandler');
const Notification = require('../models/Notification');

// @desc    Get the logged-in user's notification feed
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort('-createdAt')
    .limit(50);
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
  res.json({ success: true, count: notifications.length, unreadCount, data: notifications });
});

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );
  res.json({ success: true, data: notification });
});

module.exports = { getMyNotifications, markNotificationRead };
