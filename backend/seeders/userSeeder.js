const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const User = require('../models/User');
const { fetchRealisticPeople } = require('../services/randomUserService');
const { dicebearAvatar, shopBanner } = require('../services/imageService');
const { generateBio, generateShopAbout } = require('../services/textService');
const { randomInt, randomPastDate } = require('../utils/seedHelpers');

const TOTAL_USERS = 100;
const SELLER_COUNT = 40;
const REPAIR_PARTNER_COUNT = 8;
const ADMIN_COUNT = 2;
const BUYER_COUNT = TOTAL_USERS - SELLER_COUNT - REPAIR_PARTNER_COUNT - ADMIN_COUNT;

const DEMO_PASSWORD = 'Password@123';
const REPAIR_SPECIALTIES = ['denim', 'leather', 'stitching', 'zippers', 'alterations', 'embroidery'];

async function seedUsers() {
  const people = await fetchRealisticPeople(TOTAL_USERS, 'rethread-users');
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  const roleAssignments = [
    ...Array(SELLER_COUNT).fill('seller'),
    ...Array(BUYER_COUNT).fill('buyer'),
    ...Array(REPAIR_PARTNER_COUNT).fill('repair_partner'),
    ...Array(ADMIN_COUNT).fill('admin'),
  ];

  const seenEmails = new Set();
  const docs = people.map((person, i) => {
    const role = roleAssignments[i];
    const usernameBase = (person.username || faker.internet.userName()).toLowerCase();
    let email = (person.email.includes('@') ? person.email : `${usernameBase}@example.com`).toLowerCase();
    if (seenEmails.has(email)) {
      const [local, domain] = email.split('@');
      email = `${local}.${i}@${domain}`;
    }
    seenEmails.add(email);

    const base = {
      name: person.name,
      username: `${usernameBase}${i}`, // guarantee uniqueness across 100 docs
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      phone: person.phone,
      avatarUrl: person.avatarUrl || dicebearAvatar(usernameBase),
      bio: generateBio(),
      sustainabilityPoints: randomInt(0, 500),
      address: {
        line1: faker.location.streetAddress(),
        city: person.city || faker.location.city(),
        state: person.state || faker.location.state(),
        postalCode: person.postalCode || faker.location.zipCode(),
        country: person.country || 'India',
      },
      isBlocked: false,
      isDeleted: false,
      createdAt: randomPastDate(540, 5), // "joined date", up to ~18 months ago
    };

    if (role === 'seller') {
      const shopName = `${faker.company.name().split(' ')[0]} Thrift Co.`;
      base.sellerProfile = {
        shopName,
        logoUrl: dicebearAvatar(`${usernameBase}-shop`, 'identicon'),
        bannerUrl: shopBanner(usernameBase),
        about: generateShopAbout(),
        followers: randomInt(5, 2500),
        completedSales: 0, // filled in from real Order data by orderSeeder
        responseRate: randomInt(70, 100),
        isVerified: Math.random() < 0.35,
        socialLinks: {
          instagram: `https://instagram.com/${usernameBase}`,
          facebook: `https://facebook.com/${usernameBase}`,
          website: '',
        },
      };
    }

    if (role === 'repair_partner') {
      base.specialties = faker.helpers.arrayElements(REPAIR_SPECIALTIES, randomInt(2, 4));
      base.experienceYears = randomInt(1, 15);
    }

    return base;
  });

  await User.deleteMany({});
  const inserted = await User.insertMany(docs, { ordered: false });

  return {
    all: inserted,
    buyers: inserted.filter((u) => u.role === 'buyer'),
    sellers: inserted.filter((u) => u.role === 'seller'),
    repairPartners: inserted.filter((u) => u.role === 'repair_partner'),
    admins: inserted.filter((u) => u.role === 'admin'),
    demoPassword: DEMO_PASSWORD,
  };
}

module.exports = { seedUsers, DEMO_PASSWORD };
