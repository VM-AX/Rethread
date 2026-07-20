import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { wishlistApi } from '../api/wishlistApi';
import { useAuth } from '../context/AuthContext';

// A heart-toggle button that adds/removes a listing from the buyer's wishlist.
// `initialSaved` lets parent screens (e.g. the wishlist page itself) seed the
// starting state without an extra round-trip.
export default function WishlistButton({ listingId, initialSaved = false, className = '', onChange }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  if (!user || user.role !== 'buyer') return null;

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const next = !saved;
    try {
      if (next) {
        await wishlistApi.add(listingId);
        toast.success('Saved to wishlist');
      } else {
        await wishlistApi.remove(listingId);
        toast.success('Removed from wishlist');
      }
      setSaved(next);
      onChange?.(next);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update wishlist');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      aria-pressed={saved}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
        saved
          ? 'border-clay-500 bg-clay-500 text-white'
          : 'border-forest-200 bg-white/90 text-forest-500 hover:border-clay-400 hover:text-clay-500'
      } ${busy ? 'opacity-60' : ''} ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
      >
        <path d="M12 21s-7.5-4.6-10-9.1C.5 8.1 2.4 4.5 6 4.5c2 0 3.4 1.1 4 2.2.6-1.1 2-2.2 4-2.2 3.6 0 5.5 3.6 4 7.4-2.5 4.5-10 9.1-10 9.1z" />
      </svg>
    </button>
  );
}
