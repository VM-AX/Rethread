require('dotenv').config();
const mongoose = require('mongoose');

const { seedUsers, DEMO_PASSWORD } = require('./userSeeder');
const { seedListings } = require('./listingSeeder');
const { seedOrders } = require('./orderSeeder');
const { seedReviews } = require('./reviewSeeder');
const { seedRepairs } = require('./repairSeeder');
const { seedWishlists } = require('./wishlistSeeder');
const { seedOffers } = require('./offerSeeder');
const { seedMessages } = require('./messageSeeder');
const { seedNotifications } = require('./notificationSeeder');

async function run() {
  const startedAt = Date.now();
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`   Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

  try {
    console.log('\n👤 Seeding ~100 users (buyers, sellers, repair partners, admins)...');
    const { buyers, sellers, repairPartners, admins } = await seedUsers();
    console.log(
      `   ✔ ${buyers.length} buyers, ${sellers.length} sellers, ${repairPartners.length} repair partners, ${admins.length} admins`
    );

    console.log('\n👕 Seeding ~300 clothing listings...');
    const listings = await seedListings(sellers);
    console.log(`   ✔ ${listings.length} listings`);

    console.log('\n📦 Seeding ~200 orders...');
    const orders = await seedOrders(buyers, listings);
    console.log(`   ✔ ${orders.length} orders`);

    console.log('\n🤝 Seeding ~60 offers...');
    const offers = await seedOffers(buyers, listings);
    console.log(`   ✔ ${offers.length} offers`);

    console.log('\n⭐ Seeding ~1000 reviews + recalculating ratings...');
    const reviews = await seedReviews(buyers, listings, sellers, orders);
    console.log(`   ✔ ${reviews.length} reviews (listing + seller ratings recalculated from real data)`);

    console.log('\n🧵 Seeding ~80 repair bookings...');
    const repairs = await seedRepairs(buyers, repairPartners, listings);
    console.log(`   ✔ ${repairs.length} repair bookings`);

    console.log('\n❤️  Seeding wishlists (5-20 items per buyer)...');
    const wishlists = await seedWishlists(buyers, listings);
    console.log(`   ✔ ${wishlists.length} wishlist entries`);

    console.log('\n💬 Seeding ~50 buyer-seller chat conversations...');
    const { conversations, messages } = await seedMessages(buyers, sellers, listings);
    console.log(`   ✔ ${conversations.length} conversations, ${messages.length} messages`);

    console.log('\n🔔 Seeding notifications derived from orders/repairs/reviews/offers...');
    const notifications = await seedNotifications({ orders, repairs, reviews, offers, sellers, buyers });
    console.log(`   ✔ ${notifications.length} notifications`);

    const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(`\n✅ Seed complete in ${seconds}s\n`);
    console.log('Log in with any seeded account using:');
    console.log(`  Password: ${DEMO_PASSWORD}`);
    console.log(`  Example buyer:          ${buyers[0].email}`);
    console.log(`  Example seller:         ${sellers[0].email}`);
    console.log(`  Example repair partner: ${repairPartners[0].email}`);
    console.log(`  Example admin:          ${admins[0].email}`);
    console.log('\n(Run "npm run seed:admin" separately if you want a fixed, memorable admin login.)');
  } catch (err) {
    console.error('\n❌ Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
