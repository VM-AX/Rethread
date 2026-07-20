const { faker } = require('@faker-js/faker');
const Order = require('../models/Order');
const { getImpactForCategory } = require('../utils/impactData');
const { randomInt, pickRandom, weightedPick, randomPastDate, addDays } = require('../utils/seedHelpers');

const TOTAL_ORDERS = 200;

const STATUS_WEIGHTS = [
  { value: 'delivered', weight: 65 },
  { value: 'shipped', weight: 10 },
  { value: 'confirmed', weight: 8 },
  { value: 'pending', weight: 7 },
  { value: 'cancelled', weight: 6 },
  { value: 'returned', weight: 4 },
];

async function seedOrders(buyers, listings) {
  const docs = [];

  for (let i = 0; i < TOTAL_ORDERS; i += 1) {
    const buyer = pickRandom(buyers);
    const itemCount = randomInt(1, 3);
    const chosenListings = faker.helpers.arrayElements(listings, itemCount);

    let subtotal = 0;
    let totalWater = 0;
    let totalCo2 = 0;
    let totalTextile = 0;

    const items = chosenListings.map((listing) => {
      const quantity = 1; // resale items are effectively single-unit
      const impact = getImpactForCategory(listing.category);
      subtotal += listing.price * quantity;
      totalWater += impact.waterSavedLiters * quantity;
      totalCo2 += impact.co2SavedKg * quantity;
      totalTextile += impact.textileWasteDivertedKg * quantity;

      return {
        listing: listing._id,
        seller: listing.seller,
        title: listing.title,
        price: listing.price,
        quantity,
        category: listing.category,
        waterSavedLiters: impact.waterSavedLiters * quantity,
        co2SavedKg: impact.co2SavedKg * quantity,
        textileWasteDivertedKg: impact.textileWasteDivertedKg * quantity,
        negotiated: false,
      };
    });

    const discount = Math.round(subtotal * randomInt(0, 10) / 100);
    const taxable = subtotal - discount;
    const tax = Math.round(taxable * 0.05);
    const shippingFee = subtotal > 2000 ? 0 : 99;
    const total = taxable + tax + shippingFee;

    const status = weightedPick(STATUS_WEIGHTS);
    const isPaid = ['confirmed', 'shipped', 'delivered', 'returned'].includes(status);
    const createdAt = randomPastDate(300, 2);
    const deliveredAt = status === 'delivered' || status === 'returned' ? addDays(createdAt, randomInt(2, 9)) : undefined;

    docs.push({
      buyer: buyer._id,
      items,
      subtotal,
      discount,
      tax,
      shippingFee,
      total,
      shippingAddress: {
        line1: faker.location.streetAddress(),
        city: buyer.address?.city || faker.location.city(),
        state: buyer.address?.state || faker.location.state(),
        postalCode: buyer.address?.postalCode || faker.location.zipCode(),
        country: buyer.address?.country || 'India',
      },
      payment: {
        method: pickRandom(['mock_card', 'mock_upi', 'cod']),
        status: isPaid ? 'paid' : status === 'cancelled' ? 'failed' : 'pending',
        transactionId: isPaid ? faker.string.alphanumeric(12).toUpperCase() : undefined,
        paidAt: isPaid ? createdAt : undefined,
      },
      status,
      totalWaterSavedLiters: totalWater,
      totalCo2SavedKg: totalCo2,
      totalTextileWasteDivertedKg: totalTextile,
      cancelReason: status === 'cancelled' ? pickRandom(['Changed my mind', 'Found it cheaper elsewhere', 'Ordered by mistake']) : undefined,
      deliveredAt,
      createdAt,
    });
  }

  await Order.deleteMany({});
  const inserted = await Order.insertMany(docs, { ordered: false });

  // Recompute each seller's completedSales from real generated orders instead
  // of leaving it as a random placeholder.
  const User = require('../models/User');
  const salesAgg = await Order.aggregate([
    { $unwind: '$items' },
    { $match: { status: { $in: ['delivered', 'shipped', 'confirmed'] } } },
    { $group: { _id: '$items.seller', completedSales: { $sum: '$items.quantity' } } },
  ]);
  await Promise.all(
    salesAgg.map((s) =>
      User.updateOne({ _id: s._id }, { $set: { 'sellerProfile.completedSales': s.completedSales } })
    )
  );

  // Note: intentionally NOT marking listings as 'sold' based on seed orders —
  // keeping the full 300-listing catalog 'active' so Browse/Search/filters
  // have plenty to show, which matters more for a demo than order/listing
  // status being perfectly consistent.

  return inserted;
}

module.exports = { seedOrders };
