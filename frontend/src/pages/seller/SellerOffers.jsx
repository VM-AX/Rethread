import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { offerApi } from '../../api/offerApi';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

const STATUS_STYLE = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-forest-100 text-forest-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-forest-50 text-forest-400',
  expired: 'bg-forest-50 text-forest-400',
  completed: 'bg-clay-100 text-clay-600',
};

export default function SellerOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    offerApi
      .list({ as: 'seller' })
      .then(({ data }) => setOffers(data.data))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const respond = async (id, action) => {
    try {
      if (action === 'accept') await offerApi.accept(id);
      else await offerApi.reject(id);
      toast.success(`Offer ${action}ed`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update offer');
    }
  };

  if (loading) return <Loader />;
  if (offers.length === 0) {
    return <EmptyState title="No offers yet" subtitle="Offers buyers send on your listings will show up here." />;
  }

  return (
    <div className="space-y-3">
      {offers.map((o) => (
        <div key={o._id} className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link to={`/listings/${o.listing?._id}`} className="text-sm font-medium text-forest-800 hover:underline">
              {o.listing?.title || 'Listing removed'}
            </Link>
            <span className={`badge ${STATUS_STYLE[o.status] || ''}`}>{o.status}</span>
          </div>
          <p className="mt-1 text-sm text-forest-600">
            Offer from {o.buyer?.name}: <b>₹{o.offerPrice}</b> (listed at ₹{o.listingPrice})
          </p>
          {o.message && <p className="mt-1 text-xs text-forest-500">"{o.message}"</p>}

          {o.status === 'pending' && (
            <div className="mt-3 flex gap-2">
              <button className="btn btn-primary text-xs" onClick={() => respond(o._id, 'accept')}>
                Accept
              </button>
              <button className="btn btn-danger text-xs" onClick={() => respond(o._id, 'reject')}>
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
