// One-off script to create the Admin account.
// The Admin is intentionally NEVER created via the public /api/auth/register
// route — it must be provisioned directly against the database.
//
// Usage: npm run seed:admin   (reads ADMIN_* vars from .env)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

async function seedAdmin() {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || 'admin@rethread.com').toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`Admin already exists: ${email}`);
  } else {
    await User.create({
      name: process.env.ADMIN_NAME || 'Platform Admin',
      email,
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
    });
    console.log(`Admin created: ${email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Failed to seed admin:', err);
  process.exit(1);
});
