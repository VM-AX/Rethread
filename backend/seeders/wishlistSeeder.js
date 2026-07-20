const Wishlist = require('../models/Wishlist');
const { randomInt, pickMany } = require('../utils/seedHelpers');

async function seedWishlists(buyers, listings) {
  const docs = [];
  buyers.forEach((buyer) => {
    const count = randomInt(5, 20);
    const picks = pickMany(listings, count);
    picks.forEach((listing) => {
      docs.push({ user: buyer._id, listing: listing._id });
    });
  });

  await Wishlist.deleteMany({});
  return Wishlist.insertMany(docs, { ordered: false });
}

module.exports = { seedWishlists };
