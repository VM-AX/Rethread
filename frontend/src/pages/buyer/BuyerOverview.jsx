import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
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

export default function BuyerOverview() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([orderApi.mine(), dashboardApi.buyer()])
      .then(([oRes, sRes]) => {
        setOrders(oRes.data.data);
        setStats(sRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Orders" value={stats.orders} />
          <StatCard label="Wishlist" value={stats.wishlistCount} />
          <StatCard label="Repairs booked" value={stats.repairsBooked} />
          <StatCard label="Reviews given" value={stats.reviewsGiven} />
          <StatCard label="Money spent" value={`₹${stats.moneySpent.toLocaleString()}`} />
          <StatCard label="Water saved" value={`${stats.waterSavedLiters.toLocaleString()}L`} />
          <StatCard label="CO₂ saved" value={`${stats.co2SavedKg.toLocaleString()}kg`} />
          <StatCard label="Sustainability rating" value={stats.sustainabilityRating} />
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-medium text-forest-800">Recent orders</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-forest-500">
            No orders yet.{' '}
            <Link to="/browse" className="text-forest-700 underline">
              Start browsing
            </Link>
          </p>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 5).map((o) => (
              <div key={o._id} className="card flex items-center justify-between p-3 text-sm">
                <span className="text-forest-700">#{o._id.slice(-6)} · {o.items.length} item(s)</span>
                <span className="badge bg-forest-100 text-forest-700">{o.status}</span>
                <span className="font-medium text-forest-900">₹{o.total}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
