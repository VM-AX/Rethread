import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import ListingDetail from './pages/ListingDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

import BuyerOverview from './pages/buyer/BuyerOverview';
import BuyerOrders from './pages/buyer/BuyerOrders';
import BuyerRepairs from './pages/buyer/BuyerRepairs';
import BuyerMessages from './pages/buyer/BuyerMessages';
import BuyerImpact from './pages/buyer/BuyerImpact';
import BuyerWishlist from './pages/buyer/BuyerWishlist';
import BuyerOffers from './pages/buyer/BuyerOffers';

import SellerListings from './pages/seller/SellerListings';
import CreateListing from './pages/seller/CreateListing';
import SellerOrders from './pages/seller/SellerOrders';
import SellerOffers from './pages/seller/SellerOffers';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerAnalytics from './pages/seller/SellerAnalytics';

import RepairRequests from './pages/repair/RepairRequests';

import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminListings from './pages/admin/AdminListings';
import AdminReports from './pages/admin/AdminReports';

const buyerLinks = [
  { to: '/buyer', label: 'Overview', end: true },
  { to: '/buyer/orders', label: 'Orders' },
  { to: '/buyer/offers', label: 'Offers' },
  { to: '/buyer/wishlist', label: 'Wishlist' },
  { to: '/buyer/repairs', label: 'Repairs' },
  { to: '/buyer/messages', label: 'Messages' },
  { to: '/buyer/impact', label: 'My Impact' },
];

const sellerLinks = [
  { to: '/seller', label: 'Dashboard', end: true },
  { to: '/seller/listings', label: 'Listings' },
  { to: '/seller/orders', label: 'Orders' },
  { to: '/seller/offers', label: 'Offers' },
  { to: '/seller/analytics', label: 'Analytics' },
  { to: '/seller/messages', label: 'Messages' },
];

const adminLinks = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/listings', label: 'Listings' },
  { to: '/admin/reports', label: 'Reports' },
];

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/listings/:id" element={<ListingDetail />} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute roles={['buyer']}>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute roles={['buyer']}>
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* Buyer dashboard */}
        <Route
          path="/buyer"
          element={
            <ProtectedRoute roles={['buyer']}>
              <DashboardLayout title="Buyer Dashboard" links={buyerLinks} />
            </ProtectedRoute>
          }
        >
          <Route index element={<BuyerOverview />} />
          <Route path="orders" element={<BuyerOrders />} />
          <Route path="offers" element={<BuyerOffers />} />
          <Route path="wishlist" element={<BuyerWishlist />} />
          <Route path="repairs" element={<BuyerRepairs />} />
          <Route path="messages" element={<BuyerMessages />} />
          <Route path="impact" element={<BuyerImpact />} />
        </Route>

        {/* Seller dashboard */}
        <Route
          path="/seller"
          element={
            <ProtectedRoute roles={['seller']}>
              <DashboardLayout title="Seller Dashboard" links={sellerLinks} />
            </ProtectedRoute>
          }
        >
          <Route index element={<SellerDashboard />} />
          <Route path="listings" element={<SellerListings />} />
          <Route path="listings/new" element={<CreateListing />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="offers" element={<SellerOffers />} />
          <Route path="analytics" element={<SellerAnalytics />} />
          <Route path="messages" element={<BuyerMessages />} />
        </Route>

        {/* Repair partner dashboard */}
        <Route
          path="/repair"
          element={
            <ProtectedRoute roles={['repair_partner']}>
              <RepairRequests />
            </ProtectedRoute>
          }
        />

        {/* Admin dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <DashboardLayout title="Admin Dashboard" links={adminLinks} />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="listings" element={<AdminListings />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        <Route path="*" element={<Landing />} />
      </Routes>
    </div>
  );
}
