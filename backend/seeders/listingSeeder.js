const Listing = require('../models/Listing');
const { DISPLAY_CATEGORIES, BRANDS, COLORS, GENDERS, buildProductTitle, buildProductDescription } = require('./constants');
const { productImages } = require('../services/imageService');
const { randomInt, pickRandom, weightedPick, randomPastDate } = require('../utils/seedHelpers');

const TOTAL_LISTINGS = 300;

// Skew condition distribution toward better-condition items, like a real marketplace.
const CONDITION_WEIGHTS = [
  { value: 'like-new', weight: 35 },
  { value: 'gently-used', weight: 40 },
  { value: 'visible-wear', weight: 18 },
  { value: 'needs-repair', weight: 7 },
];

function scoreForCondition(condition) {
  const ranges = {
    'like-new': [85, 99],
    'gently-used': [65, 88],
    'visible-wear': [45, 68],
    'needs-repair': [20, 48],
  };
  const [min, max] = ranges[condition];
  return randomInt(min, max);
}

function ratingForScores(conditionScore, authenticityScore) {
  const avg = (conditionScore + authenticityScore) / 2;
  if (avg >= 85) return 'A';
  if (avg >= 70) return 'B';
  if (avg >= 55) return 'C';
  if (avg >= 40) return 'D';
  return 'E';
}

async function seedListings(sellers) {
  if (!sellers.length) throw new Error('seedListings requires at least one seller');

  const docs = Array.from({ length: TOTAL_LISTINGS }, () => {
    const displayCategory = pickRandom(DISPLAY_CATEGORIES);
    const brand = pickRandom(BRANDS);
    const color = pickRandom(COLORS);
    const gender = pickRandom(GENDERS);
    const seller = pickRandom(sellers);
    const condition = weightedPick(CONDITION_WEIGHTS);

    const conditionScore = scoreForCondition(condition);
    const authenticityScore = randomInt(55, 99);
    const sustainabilityRating = ratingForScores(conditionScore, authenticityScore);

    const originalPrice = randomInt(800, 8000);
    const discountPercent = randomInt(10, 60);
    const price = Math.round(originalPrice * (1 - discountPercent / 100));

    const title = buildProductTitle(displayCategory.label, brand, color);
    const seedKey = `${title}-${randomInt(1, 999999)}`.toLowerCase().replace(/\s+/g, '-');
    const slug = `${seedKey}-${Math.random().toString(36).slice(2, 8)}`;

    return {
      seller: seller._id,
      title,
      slug,
      description: buildProductDescription(displayCategory.label, brand, condition),
      category: displayCategory.enumCategory,
      size: pickRandom(displayCategory.sizes),
      brand,
      color,
      gender,
      originalPrice,
      price,
      discountPercent,
      images: productImages(seedKey, displayCategory.enumCategory, title),
      conditionLabel: condition,
      aiConditionScore: conditionScore,
      aiAuthenticityScore: authenticityScore,
      aiGraded: true,
      sustainabilityRating,
      status: 'active',
      quantity: randomInt(1, 3),
      tags: [displayCategory.label.toLowerCase(), brand.toLowerCase(), color.toLowerCase(), gender],
      offersEnabled: Math.random() < 0.85,
      repairAvailable: condition === 'needs-repair' || Math.random() < 0.15,
      viewCount: randomInt(0, 4000),
      ratingAverage: 0, // recalculated once reviews are seeded
      ratingCount: 0,
      createdAt: randomPastDate(365, 1),
    };
  });

  await Listing.deleteMany({});
  const inserted = await Listing.insertMany(docs, { ordered: false });
  return inserted;
}

module.exports = { seedListings };
