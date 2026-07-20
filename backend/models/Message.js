const mongoose = require('mongoose');

// Conversation groups two participants around an optional listing context.
const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
    lastMessage: { type: String },
    lastMessageAt: { type: Date, default: Date.now },
    isReported: { type: Boolean, default: false },
    reportReason: { type: String },
  },
  { timestamps: true }
);
conversationSchema.index({ participants: 1 });

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 2000 },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);
messageSchema.index({ conversation: 1, createdAt: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
const Message = mongoose.model('Message', messageSchema);

module.exports = { Conversation, Message };
