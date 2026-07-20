const { Conversation, Message } = require('../models/Message');
const { generateChatMessage } = require('../services/textService');
const { randomInt, pickRandom, randomPastDate, addDays } = require('../utils/seedHelpers');

const TOTAL_CONVERSATIONS = 50;

async function seedMessages(buyers, sellers, listings) {
  await Conversation.deleteMany({});
  await Message.deleteMany({});

  const conversationDocs = [];
  const messagesByConversation = [];

  for (let i = 0; i < TOTAL_CONVERSATIONS; i += 1) {
    const buyer = pickRandom(buyers);
    const seller = pickRandom(sellers);
    const listing = Math.random() < 0.8 ? pickRandom(listings) : undefined;
    const startDate = randomPastDate(120, 2);
    const messageCount = randomInt(10, 30);

    const messages = [];
    let currentDate = startDate;
    for (let m = 0; m < messageCount; m += 1) {
      const isBuyerTurn = m % 2 === 0;
      currentDate = addDays(currentDate, 0);
      currentDate = new Date(currentDate.getTime() + randomInt(2, 240) * 60 * 1000); // 2min-4hr gaps
      messages.push({
        sender: isBuyerTurn ? buyer._id : seller._id,
        text: generateChatMessage(m === 0, listing ? Math.round(listing.price * 0.85) : undefined),
        createdAt: currentDate,
      });
    }

    conversationDocs.push({
      participants: [buyer._id, seller._id],
      listing: listing?._id,
      lastMessage: messages[messages.length - 1].text,
      lastMessageAt: messages[messages.length - 1].createdAt,
      createdAt: startDate,
    });
    messagesByConversation.push(messages);
  }

  const insertedConversations = await Conversation.insertMany(conversationDocs, { ordered: false });

  const messageDocs = insertedConversations.flatMap((conv, i) =>
    messagesByConversation[i].map((m) => ({
      conversation: conv._id,
      sender: m.sender,
      text: m.text,
      readBy: [m.sender],
      createdAt: m.createdAt,
    }))
  );

  const insertedMessages = await Message.insertMany(messageDocs, { ordered: false });
  return { conversations: insertedConversations, messages: insertedMessages };
}

module.exports = { seedMessages };
