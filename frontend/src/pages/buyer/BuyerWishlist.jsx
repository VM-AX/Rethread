import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { wishlistApi } from '../../api/wishlistApi';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

export default function BuyerWishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    wishlistApi
      .list()
      .then(({ data }) => setItems(data.data))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (listingId) => {
    try {
      await wishlistApi.remove(listingId);
      toast.success('Removed from wishlist');
      setItems((prev) => prev.filter((i) => i.listing._id !== listingId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove item');
    }
  };

  if (loading) return <Loader />;
  if (items.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        subtitle="Save listings you love to find them again later."
        action={
          <Link to="/browse" className="btn btn-primary">
            Browse listings
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map(({ listing }) => (
        <div key={listing._id} className="card flex flex-col overflow-hidden">
          <Link to={`/listings/${listing._id}`} className="aspect-[4/5] w-full overflow-hidden bg-forest-100">
            {listing.images?.[0]?.url && (
              <img src={listing.images[0].url} alt={listing.title} className="h-full w-full object-cover" />
            )}
          </Link>
          <div className="flex flex-1 flex-col gap-1 p-3">
            <h3 className="line-clamp-1 text-sm font-medium text-forest-900">{listing.title}</h3>
            <span className="text-base font-semibold text-forest-900">₹{listing.price}</span>
            <button
              className="btn btn-secondary mt-2 text-xs"
              onClick={() => handleRemove(listing._id)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
