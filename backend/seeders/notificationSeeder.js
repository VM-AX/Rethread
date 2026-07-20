const Notification = require('../models/Notification');
const { randomInt, pickRandom } = require('../utils/seedHelpers');

async function seedNotifications({ orders, repairs, reviews, offers, sellers, buyers }) {
  const docs = [];

  // New order / product sold -> notify the seller
  orders.forEach((order) => {
    order.items.forEach((item) => {
      docs.push({
        recipient: item.seller,
        type: 'new_order',
        message: `You have a new order for "${item.title}".`,
        relatedType: 'order',
        relatedId: order._id,
        isRead: Math.random() < 0.6,
        createdAt: order.createdAt,
      });
      if (['delivered', 'shipped', 'confirmed'].includes(order.status)) {
        docs.push({
          recipient: item.seller,
          type: 'product_sold',
          message: `"${item.title}" just sold for ₹${item.price}.`,
          relatedType: 'listing',
          relatedId: item.listing,
          isRead: Math.random() < 0.6,
          createdAt: order.createdAt,
        });
      }
    });

    // Order delivered -> notify the buyer
    if (order.status === 'delivered' && order.deliveredAt) {
      docs.push({
        recipient: order.buyer,
        type: 'order_delivered',
        message: 'Your order has been delivered. Enjoy your new-to-you find!',
        relatedType: 'order',
        relatedId: order._id,
        isRead: Math.random() < 0.5,
        createdAt: order.deliveredAt,
      });
    }
  });

  // Repair completed -> notify the buyer
  repairs
    .filter((r) => ['completed', 'delivered'].includes(r.status))
    .forEach((r) => {
      docs.push({
        recipient: r.buyer,
        type: 'repair_completed',
        message: 'Great news — your repair request has been completed.',
        relatedType: 'repair',
        relatedId: r._id,
        isRead: Math.random() < 0.5,
        createdAt: r.completedAt || r.createdAt,
      });
    });

  // Offer received -> notify the seller
  offers.forEach((offer) => {
    docs.push({
      recipient: offer.seller,
      type: 'offer_received',
      message: `You received an offer of ₹${offer.offerPrice} on your listing.`,
      relatedType: 'offer',
      relatedId: offer._id,
      isRead: Math.random() < 0.4,
      createdAt: offer.createdAt,
    });
  });

  // Review added -> notify whoever was reviewed (seller for both listing & user reviews)
  reviews.forEach((review) => {
    const recipient = review.seller || review.targetUser;
    if (!recipient) return;
    docs.push({
      recipient,
      type: 'review_added',
      message: `You received a new ${review.rating}-star review.`,
      relatedType: 'review',
      relatedId: review._id,
      isRead: Math.random() < 0.5,
      createdAt: review.createdAt,
    });
  });

  // New follower -> a handful of synthetic notifications per seller (no backing "follow" model exists yet)
  sellers.forEach((seller) => {
    const followerCount = randomInt(0, 3);
    for (let i = 0; i < followerCount; i += 1) {
      const follower = pickRandom(buyers);
      docs.push({
        recipient: seller._id,
        type: 'new_follower',
        message: `${follower.name} started following your shop.`,
        relatedType: 'user',
        relatedId: follower._id,
        isRead: Math.random() < 0.7,
        createdAt: seller.createdAt,
      });
    }
  });

  await Notification.deleteMany({});
  return Notification.insertMany(docs, { ordered: false });
}

module.exports = { seedNotifications };
