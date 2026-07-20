import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { offerApi } from '../../api/offerApi';
import { useCart } from '../../context/CartContext';
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

export default function BuyerOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const navigate = useNavigate();

  const load = () =>
    offerApi
      .list({ as: 'buyer' })
      .then(({ data }) => setOffers(data.data))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const withdraw = async (id) => {
    try {
      await offerApi.remove(id);
      toast.success('Offer withdrawn');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not withdraw offer');
    }
  };

  const checkoutAtOfferPrice = (offer) => {
    addItem(
      {
        _id: offer.listing._id,
        title: offer.listing.title,
        price: offer.offerPrice,
        images: offer.listing.images,
        category: offer.listing.category,
      },
      offer._id
    );
    toast.success('Added to cart at negotiated price');
    navigate('/cart');
  };

  if (loading) return <Loader />;
  if (offers.length === 0) {
    return (
      <EmptyState
        title="No offers yet"
        subtitle="Send an offer from any listing's product page to start negotiating."
        action={
          <Link to="/browse" className="btn btn-primary">
            Browse listings
          </Link>
        }
      />
    );
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
            Your offer: <b>₹{o.offerPrice}</b> (listed at ₹{o.listingPrice})
          </p>
          {o.message && <p className="mt-1 text-xs text-forest-500">"{o.message}"</p>}
          {o.sellerResponseMessage && (
            <p className="mt-1 text-xs text-forest-500">Seller: "{o.sellerResponseMessage}"</p>
          )}

          <div className="mt-3 flex gap-2">
            {o.status === 'pending' && (
              <button className="btn btn-danger text-xs" onClick={() => withdraw(o._id)}>
                Withdraw offer
              </button>
            )}
            {o.status === 'accepted' && (
              <button className="btn btn-primary text-xs" onClick={() => checkoutAtOfferPrice(o)}>
                Checkout at ₹{o.offerPrice}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
