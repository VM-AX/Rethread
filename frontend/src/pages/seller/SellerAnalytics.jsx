import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import Loader from '../../components/Loader';

export default function SellerAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    dashboardApi.sellerAnalytics().then(({ data: res }) => setData(res.data));
  }, []);

  if (!data) return <Loader />;

  const maxRevenue = Math.max(1, ...data.monthlySales.map((m) => m.revenue));

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <p className="mb-3 text-sm font-medium text-forest-800">Monthly sales</p>
        {data.monthlySales.length === 0 ? (
          <p className="text-sm text-forest-400">No sales yet.</p>
        ) : (
          <div className="space-y-2">
            {data.monthlySales.map((m) => (
              <div key={`${m._id.y}-${m._id.m}`} className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-xs text-forest-500">
                  {m._id.m}/{m._id.y}
                </span>
                <div className="h-2 flex-1 rounded-full bg-forest-100">
                  <div
                    className="h-2 rounded-full bg-clay-500"
                    style={{ width: `${Math.max(4, (m.revenue / maxRevenue) * 100)}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right text-xs text-forest-500">₹{m.revenue}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-4">
          <p className="mb-1 text-sm font-medium text-forest-800">Best selling category</p>
          <p className="text-lg text-forest-900">{data.bestSellingCategory || '—'}</p>
        </div>
        <div className="card p-4">
          <p className="mb-1 text-sm font-medium text-forest-800">Average rating</p>
          <p className="text-lg text-forest-900">{data.averageRating || 'New'}</p>
        </div>
      </div>

      <div className="card p-4">
        <p className="mb-3 text-sm font-medium text-forest-800">Most viewed listings</p>
        {data.mostViewedListings.length === 0 ? (
          <p className="text-sm text-forest-400">No listings yet.</p>
        ) : (
          <div className="divide-y divide-forest-50">
            {data.mostViewedListings.map((l) => (
              <div key={l._id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-forest-700">{l.title}</span>
                <span className="text-forest-500">{l.viewCount} views</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
