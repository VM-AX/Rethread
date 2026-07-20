import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { orderApi } from '../../api/orderApi';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

const STATUS_STYLE = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-forest-100 text-forest-700',
  shipped: 'bg-clay-100 text-clay-600',
  delivered: 'bg-forest-200 text-forest-800',
  cancelled: 'bg-red-100 text-red-700',
  returned: 'bg-red-100 text-red-700',
};

export default function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => orderApi.mine().then(({ data }) => setOrders(data.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    try {
      await orderApi.cancel(id);
      toast.success('Order cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel order');
    }
  };

  if (loading) return <Loader />;
  if (orders.length === 0) return <EmptyState title="No orders yet" />;

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o._id} className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-forest-800">Order #{o._id.slice(-6)}</span>
            <span className={`badge ${STATUS_STYLE[o.status] || ''}`}>{o.status}</span>
          </div>
          <div className="mt-2 space-y-1">
            {o.items.map((item) => (
              <div key={item.listing} className="flex justify-between text-sm text-forest-600">
                <span>{item.title}</span>
                <span>₹{item.price}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-forest-100 pt-3">
            <span className="text-sm text-forest-500">
              💧 {o.totalWaterSavedLiters}L · 🌱 {o.totalCo2SavedKg}kg CO₂ saved
            </span>
            <span className="font-semibold text-forest-900">₹{o.total}</span>
          </div>
          <div className="mt-3 flex gap-2">
            {['pending', 'confirmed'].includes(o.status) && (
              <button className="btn btn-danger text-xs" onClick={() => handleCancel(o._id)}>
                Cancel order
              </button>
            )}
            {o.status === 'delivered' && (
              <Link to="/buyer/repairs" className="btn btn-secondary text-xs">
                Book a repair
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
