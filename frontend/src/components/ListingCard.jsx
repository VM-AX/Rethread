import React from 'react';
import { Link } from 'react-router-dom';
import WishlistButton from './WishlistButton';

const CONDITION_STYLES = {
  'like-new': 'bg-forest-100 text-forest-700',
  'gently-used': 'bg-clay-100 text-clay-600',
  'visible-wear': 'bg-amber-100 text-amber-700',
  'needs-repair': 'bg-red-100 text-red-700',
};

const SUSTAINABILITY_STYLES = {
  A: 'bg-forest-100 text-forest-700',
  B: 'bg-forest-100 text-forest-600',
  C: 'bg-amber-100 text-amber-700',
  D: 'bg-amber-100 text-amber-800',
  E: 'bg-red-100 text-red-700',
};

export default function ListingCard({ listing }) {
  return (
    <div className="card group relative flex flex-col overflow-hidden transition-transform hover:-translate-y-0.5">
      <Link to={`/listings/${listing._id}`} className="contents">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-forest-100">
          {listing.images?.[0]?.url ? (
            <img
              src={listing.images[0].url}
              alt={listing.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80';
              }}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-forest-300">No image</div>
          )}

          {listing.conditionLabel && (
            <span
              className={`badge absolute left-2 top-2 shrink-0 ${CONDITION_STYLES[listing.conditionLabel] || ''}`}
            >
              {listing.conditionLabel.replace('-', ' ')}
            </span>
          )}
          {listing.repairAvailable && (
            <span className="badge absolute left-2 bottom-2 bg-white/90 text-forest-700">
              🧵 Repair available
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3">
          <h3 className="line-clamp-1 text-sm font-medium text-forest-900">{listing.title}</h3>
          <p className="text-xs text-forest-500">
            {listing.brand ? `${listing.brand} · ` : ''}
            {listing.size ? `Size ${listing.size}` : ''}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {listing.aiAuthenticityScore != null && (
              <span className="badge bg-forest-50 text-forest-600">
                AI verified {listing.aiAuthenticityScore}%
              </span>
            )}
            {listing.sustainabilityRating && (
              <span className={`badge ${SUSTAINABILITY_STYLES[listing.sustainabilityRating] || ''}`}>
                Eco {listing.sustainabilityRating}
              </span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="text-base font-semibold text-forest-900">₹{listing.price}</span>
            <span className="text-xs text-forest-400">
              ⭐ {listing.seller?.ratingAverage ? listing.seller.ratingAverage.toFixed(1) : 'New'}
              {listing.ratingCount ? ` · ${listing.ratingCount} reviews` : ''}
            </span>
          </div>
        </div>
      </Link>

      <WishlistButton listingId={listing._id} className="absolute right-2 top-2 shadow-sm" />
    </div>
  );
}
