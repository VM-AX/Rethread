const Offer = require('../models/Offer');
const { randomInt, pickRandom, weightedPick, randomPastDate } = require('../utils/seedHelpers');

const TOTAL_OFFERS = 60;
const STATUS_WEIGHTS = [
  { value: 'pending', weight: 35 },
  { value: 'accepted', weight: 30 },
  { value: 'rejected', weight: 30 },
  { value: 'withdrawn', weight: 5 },
];

async function seedOffers(buyers, listings) {
  const docs = Array.from({ length: TOTAL_OFFERS }, () => {
    const listing = pickRandom(listings);
    const buyer = pickRandom(buyers);
    const status = weightedPick(STATUS_WEIGHTS);
    const discountPct = randomInt(10, 35);
    const offerPrice = Math.max(1, Math.round(listing.price * (1 - discountPct / 100)));
    const createdAt = randomPastDate(90, 1);

    return {
      listing: listing._id,
      buyer: buyer._id,
      seller: listing.seller,
      listingPrice: listing.price,
      offerPrice,
      message: 'Would you consider this price?',
      status,
      sellerResponseMessage: status !== 'pending' ? 'Thanks for your offer!' : undefined,
      respondedAt: status !== 'pending' ? createdAt : undefined,
      createdAt,
    };
  });

  await Offer.deleteMany({});
  return Offer.insertMany(docs, { ordered: false });
}

module.exports = { seedOffers };
