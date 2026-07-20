require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const aiRoutes = require('./routes/aiRoutes');
const searchRoutes = require('./routes/searchRoutes');
const orderRoutes = require('./routes/orderRoutes');
const repairRoutes = require('./routes/repairRoutes');
const impactRoutes = require('./routes/impactRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const messageRoutes = require('./routes/messageRoutes');
const offerRoutes = require('./routes/offerRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reportRoutes = require('./routes/reportRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardStatsRoutes = require('./routes/dashboardStatsRoutes');

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Local image fallback (used only when Cloudinary env vars aren't set)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'ReThread API is running' }));

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
// Offer/Price Negotiation System replaces the old Auction module.
app.use('/api/offers', offerRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardStatsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ReThread API listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
