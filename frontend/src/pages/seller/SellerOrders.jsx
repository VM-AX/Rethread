import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { orderApi } from '../../api/orderApi';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

const NEXT_STATUS = { confirmed: 'shipped', shipped: 'delivered' };

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => orderApi.sellerOrders().then(({ data }) => setOrders(data.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const advance = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    try {
      await orderApi.updateStatus(order._id, next);
      toast.success(`Order marked as ${next}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update order');
    }
  };

  if (loading) return <Loader />;
  if (orders.length === 0) return <EmptyState title="No orders yet" subtitle="Orders for your listings will appear here." />;

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o._id} className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-forest-800">Order #{o._id.slice(-6)}</span>
            <span className="badge bg-forest-100 text-forest-700">{o.status}</span>
          </div>
          <div className="mt-2 space-y-1">
            {o.items.map((item) => (
              <div key={item.listing} className="flex justify-between text-sm text-forest-600">
                <span>{item.title}</span>
                <span>₹{item.price}</span>
              </div>
            ))}
          </div>
          {NEXT_STATUS[o.status] && (
            <button className="btn btn-secondary mt-3 text-xs" onClick={() => advance(o)}>
              Mark as {NEXT_STATUS[o.status]}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
