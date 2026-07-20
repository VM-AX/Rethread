import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import Loader from '../../components/Loader';

function StatCard({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-2xl font-semibold text-forest-900">{value}</p>
      <p className="text-xs text-forest-500">{label}</p>
    </div>
  );
}

export default function SellerDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    dashboardApi.seller().then(({ data }) => setStats(data.data));
  }, []);

  if (!stats) return <Loader />;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="Total listings" value={stats.totalListings} />
      <StatCard label="Active listings" value={stats.activeListings} />
      <StatCard label="Sold items" value={stats.soldItems} />
      <StatCard label="Pending orders" value={stats.pendingOrders} />
      <StatCard label="Total revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} />
      <StatCard label="Average rating" value={stats.averageRating || 'New'} />
      <StatCard label="Listing views" value={stats.listingViews} />
    </div>
  );
}
