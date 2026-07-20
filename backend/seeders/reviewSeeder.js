const Review = require('../models/Review');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { generateReviewText, generateReviewTitle } = require('../services/textService');
const { randomInt, pickRandom, weightedPick, randomPastDate } = require('../utils/seedHelpers');

const TOTAL_REVIEWS = 1000;
const PRODUCT_REVIEW_SHARE = 0.7; // ~700 product reviews, ~300 seller reviews

const RATING_WEIGHTS = [
  { value: 5, weight: 45 },
  { value: 4, weight: 30 },
  { value: 3, weight: 15 },
  { value: 2, weight: 6 },
  { value: 1, weight: 4 },
];

function buildOrderPools(orders) {
  // Flatten delivered/returned order items into {buyer, listing, seller, order, createdAt}
  const pool = [];
  orders
    .filter((o) => ['delivered', 'returned'].includes(o.status))
    .forEach((o) => {
      o.items.forEach((item) => {
        pool.push({ buyer: o.buyer, listing: item.listing, seller: item.seller, order: o._id, createdAt: o.deliveredAt || o.createdAt });
      });
    });
  return pool;
}

async function seedReviews(buyers, listings, sellers, orders) {
  const productReviewCount = Math.round(TOTAL_REVIEWS * PRODUCT_REVIEW_SHARE);
  const sellerReviewCount = TOTAL_REVIEWS - productReviewCount;
  const verifiedPool = buildOrderPools(orders);

  const listingById = new Map(listings.map((l) => [String(l._id), l]));
  const docs = [];

  // --- Product (listing) reviews ---
  for (let i = 0; i < productReviewCount; i += 1) {
    const rating = weightedPick(RATING_WEIGHTS);
    let buyer;
    let listing;
    let seller;
    let order;
    let createdAt;

    if (i < verifiedPool.length && Math.random() < 0.7) {
      const entry = verifiedPool[i % verifiedPool.length];
      buyer = entry.buyer;
      listing = listingById.get(String(entry.listing));
      seller = entry.seller;
      order = entry.order;
      createdAt = entry.createdAt;
    }
    if (!listing) {
      buyer = pickRandom(buyers)._id;
      listing = pickRandom(listings);
      seller = listing.seller;
      order = undefined;
      createdAt = randomPastDate(300, 1);
    }

    docs.push({
      author: buyer,
      targetType: 'listing',
      listing: listing._id,
      seller,
      rating,
      title: generateReviewTitle(rating),
      comment: generateReviewText(rating, listing.title),
      isVerifiedPurchase: Boolean(order),
      order,
      helpfulCount: randomInt(0, 120),
      isFlagged: false,
      isHidden: false,
      createdAt,
    });
  }

  // --- Seller reviews ---
  for (let i = 0; i < sellerReviewCount; i += 1) {
    const rating = weightedPick(RATING_WEIGHTS);
    const seller = pickRandom(sellers);
    let buyer;
    let order;
    let createdAt;

    const sellerOrders = verifiedPool.filter((e) => String(e.seller) === String(seller._id));
    if (sellerOrders.length && Math.random() < 0.6) {
      const entry = pickRandom(sellerOrders);
      buyer = entry.buyer;
      order = entry.order;
      createdAt = entry.createdAt;
    } else {
      buyer = pickRandom(buyers)._id;
      createdAt = randomPastDate(300, 1);
    }

    docs.push({
      author: buyer,
      targetType: 'user',
      targetUser: seller._id,
      rating,
      title: generateReviewTitle(rating),
      comment: generateReviewText(rating, seller.sellerProfile?.shopName || 'this seller'),
      isVerifiedPurchase: Boolean(order),
      order,
      helpfulCount: randomInt(0, 80),
      isFlagged: false,
      isHidden: false,
      createdAt,
    });
  }

  await Review.deleteMany({});
  const inserted = await Review.insertMany(docs, { ordered: false });

  await recalculateRatings();
  return inserted;
}

// "Do NOT hardcode ratings" — recompute Listing.ratingAverage/ratingCount and
// User.ratingAverage/ratingCount straight from the Review collection.
async function recalculateRatings() {
  const [listingStats, userStats] = await Promise.all([
    Review.aggregate([
      { $match: { targetType: 'listing', isHidden: false } },
      { $group: { _id: '$listing', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
    Review.aggregate([
      { $match: { targetType: 'user', isHidden: false } },
      { $group: { _id: '$targetUser', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
  ]);

  await Promise.all([
    ...listingStats.map((s) =>
      Listing.updateOne({ _id: s._id }, { $set: { ratingAverage: Number(s.avg.toFixed(2)), ratingCount: s.count } })
    ),
    ...userStats.map((s) =>
      User.updateOne({ _id: s._id }, { $set: { ratingAverage: Number(s.avg.toFixed(2)), ratingCount: s.count } })
    ),
  ]);
}

module.exports = { seedReviews };
