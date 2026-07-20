const { faker } = require('@faker-js/faker');
const { pickRandom } = require('../utils/seedHelpers');

const REVIEW_TEMPLATES = {
  5: [
    'Exactly as described — {item} looks even better in person. Fast shipping too!',
    'Absolutely love this {item}. Condition was spot on with the listing photos.',
    "Couldn't be happier. The {item} feels brand new and the seller was super responsive.",
    'Great find! {item} fits perfectly and the fabric quality is excellent for a resale piece.',
    'This {item} exceeded my expectations. Will definitely buy from this seller again.',
  ],
  4: [
    'Really happy with this {item}. Minor wear but nothing that bothered me.',
    'Good quality {item}, shipping took a couple extra days but worth the wait.',
    'Solid purchase. The {item} matches the description, just a tiny bit smaller than expected.',
    'Nice {item} overall — would have given 5 stars if packaging was a bit better.',
  ],
  3: [
    'The {item} is okay. Condition was a little more worn than the photos suggested.',
    'Average experience. {item} works fine but not as fresh as I hoped.',
    "It's a decent {item} for the price, just wish the color matched better.",
  ],
  2: [
    'The {item} had more visible wear than expected. Disappointed but usable.',
    'Not quite what I expected from the listing — {item} needed a wash before wearing.',
  ],
  1: [
    'The {item} arrived with damage that wasn\'t mentioned in the listing.',
    'Not satisfied — {item} condition was significantly worse than described.',
  ],
};

const REVIEW_TITLES = {
  5: ['Perfect find!', 'Exceeded expectations', 'Love it!', 'Great condition', 'Would buy again'],
  4: ['Really good', 'Happy with this', 'Solid buy', 'Good value'],
  3: ['It\'s okay', 'Decent for the price', 'Mixed feelings'],
  2: ['A bit disappointed', 'Not quite as described'],
  1: ['Not happy', 'Needs better description'],
};

function generateReviewText(rating, itemName) {
  const templates = REVIEW_TEMPLATES[rating] || REVIEW_TEMPLATES[3];
  const template = pickRandom(templates);
  return template.replace('{item}', itemName || 'item');
}

function generateReviewTitle(rating) {
  return pickRandom(REVIEW_TITLES[rating] || REVIEW_TITLES[3]);
}

const BIO_TEMPLATES = [
  'Sustainable fashion enthusiast decluttering my closet, one gently-loved piece at a time.',
  'Thrift lover passing on pieces I no longer wear — good for your wardrobe and the planet.',
  'Minimalist wardrobe, maximalist love for secondhand fashion.',
  'Buying and selling pre-loved clothes since I realized fast fashion just isn\'t it.',
  'Here for the eco-friendly wins and the occasional vintage steal.',
];

function generateBio() {
  return pickRandom(BIO_TEMPLATES);
}

const SHOP_ABOUT_TEMPLATES = [
  'Curated secondhand fashion, handpicked and quality-checked before every listing goes live.',
  'Small resale shop specializing in gently-used streetwear and everyday essentials.',
  'We believe great style shouldn\'t cost the earth — every piece here gets a second life.',
  'Family-run resale storefront focused on honest condition grading and fast shipping.',
  'Sourcing quality pre-owned fashion so you can shop sustainably without compromising on style.',
];

function generateShopAbout() {
  return pickRandom(SHOP_ABOUT_TEMPLATES);
}

const CHAT_OPENERS = [
  'Hi! Is this still available?',
  'Hey, does this run true to size?',
  'Hi there, would you take {offer} for this?',
  'Hello! Can you share more photos of the fabric condition?',
  'Hi, how soon can this ship?',
];

const CHAT_REPLIES = [
  'Yes, it\'s still available!',
  'It runs slightly small, I\'d size up if you\'re in between.',
  'I could do {offer} if you\'re ready to buy today.',
  'Sure, sending a couple more photos now.',
  'I usually ship within 1-2 business days.',
  'Thanks for your interest! Let me know if you have more questions.',
  'Sounds good, I\'ll get it packed up right away.',
  'It\'s from a smoke-free home and freshly washed.',
];

function generateChatMessage(isOpener, offerPrice) {
  const pool = isOpener ? CHAT_OPENERS : CHAT_REPLIES;
  const text = pickRandom(pool);
  if (text.includes('{offer}') && offerPrice) return text.replace('{offer}', `₹${offerPrice}`);
  if (text.includes('{offer}')) return text.replace('{offer}', 'a bit less');
  return text;
}

function generateRepairIssueDescription(issueType) {
  const map = {
    stitching: 'Seam is coming apart along the side, needs to be re-stitched securely.',
    zipper: 'Zipper is stuck and won\'t glide smoothly — could use a replacement or lubrication.',
    button: 'Lost a button near the collar and need a matching replacement sewn on.',
    'stain-removal': 'There\'s a stubborn stain that didn\'t come out in a regular wash.',
    alteration: 'Needs to be taken in at the waist for a better fit.',
    patch: 'Small tear that could use a discreet patch or reinforcement.',
    other: faker.lorem.sentence(),
  };
  return map[issueType] || faker.lorem.sentence();
}

module.exports = {
  generateReviewText,
  generateReviewTitle,
  generateBio,
  generateShopAbout,
  generateChatMessage,
  generateRepairIssueDescription,
};
