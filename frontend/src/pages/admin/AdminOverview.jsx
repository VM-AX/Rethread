import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import Loader from '../../components/Loader';

function StatCard({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-2xl font-semibold text-forest-900">{value}</p>
      <p className="text-xs text-forest-500">{label}</p>
    </div>
  );
}

function MiniBarChart({ title, rows, valueKey, formatLabel }) {
  const max = Math.max(1, ...rows.map((r) => r[valueKey] || 0));
  return (
    <div className="card p-4">
      <p className="mb-3 text-sm font-medium text-forest-800">{title}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-forest-400">No data yet.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-xs text-forest-500">{formatLabel(r)}</span>
              <div className="h-2 flex-1 rounded-full bg-forest-100">
                <div
                  className="h-2 rounded-full bg-forest-600"
                  style={{ width: `${Math.max(4, ((r[valueKey] || 0) / max) * 100)}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-xs text-forest-500">{r[valueKey] || 0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminApi.dashboard().then(({ data }) => setStats(data.data));
  }, []);

  if (!stats) return <Loader />;

  const monthLabel = (row) => `${row._id.m}/${row._id.y}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total users" value={stats.users.total} />
        <StatCard label="Buyers" value={stats.users.buyers} />
        <StatCard label="Sellers" value={stats.users.sellers} />
        <StatCard label="Repair partners" value={stats.users.repairPartners} />
        <StatCard label="Listings" value={stats.listings.total} />
        <StatCard label="Orders" value={stats.orders.total} />
        <StatCard label="Revenue" value={`₹${stats.revenue.toLocaleString()}`} />
        <StatCard label="Reports pending" value={stats.moderation.reportsPending} />
        <StatCard label="Repairs" value={stats.repairs.total} />
        <StatCard label="Reviews" value={stats.reviews.total} />
        <StatCard label="Offers (pending)" value={`${stats.offers.total} (${stats.offers.pending})`} />
        <StatCard label="Active listings" value={stats.listings.active} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MiniBarChart
          title="Monthly sales revenue"
          rows={stats.charts.monthlySales}
          valueKey="revenue"
          formatLabel={monthLabel}
        />
        <MiniBarChart
          title="New users by month"
          rows={stats.charts.newUsersByMonth}
          valueKey="count"
          formatLabel={monthLabel}
        />
        <MiniBarChart
          title="Listings by category"
          rows={stats.charts.listingsByCategory}
          valueKey="count"
          formatLabel={(r) => r._id || 'other'}
        />
        <MiniBarChart
          title="Repair requests by status"
          rows={stats.charts.repairsByStatus}
          valueKey="count"
          formatLabel={(r) => r._id}
        />
      </div>

      <div className="card p-4">
        <p className="mb-2 text-sm font-medium text-forest-800">Environmental impact</p>
        <p className="text-sm text-forest-600">
          💧 {stats.environmentalImpact.totalWaterSavedLiters.toLocaleString()}L water saved · 🌱{' '}
          {stats.environmentalImpact.totalCo2SavedKg.toLocaleString()}kg CO₂ avoided
        </p>
      </div>

      <div className="card flex items-center justify-between p-4">
        <div>
          <p className="mb-1 text-sm font-medium text-forest-800">Moderation queue</p>
          <p className="text-sm text-forest-600">
            {stats.moderation.reportsPending} listing report(s) pending · {stats.moderation.reportedConversations}{' '}
            reported conversation(s) · {stats.moderation.flaggedAIReports} flagged AI report(s)
          </p>
        </div>
        <Link to="/admin/reports" className="btn btn-secondary shrink-0">
          Review reports
        </Link>
      </div>
    </div>
  );
}
