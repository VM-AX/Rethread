import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { listingApi } from '../api/listingApi';
import { reviewApi } from '../api/reviewApi';
import { messageApi } from '../api/messageApi';
import { impactApi } from '../api/impactApi';
import { searchApi } from '../api/searchApi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';
import ListingCard from '../components/ListingCard';
import WishlistButton from '../components/WishlistButton';
import OfferButton from '../components/OfferButton';
import ReportButton from '../components/ReportButton';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [impactPreview, setImpactPreview] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  const load = () => {
    setLoading(true);
    Promise.all([listingApi.getById(id), reviewApi.forListing(id), impactApi.categories()])
      .then(([lRes, rRes, iRes]) => {
        const data = lRes.data.data;
        setListing(data);
        setReviews(rRes.data.data);
        setImpactPreview(iRes.data.data[data.category]);
        searchApi
          .search({ category: data.category, limit: 4 })
          .then(({ data: sData }) => setSimilar(sData.data.filter((l) => l._id !== data._id)))
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !listing) return <Loader label="Loading listing" />;

  const handleAddToCart = () => {
    addItem(listing);
    toast.success('Added to cart');
  };

  const handleMessageSeller = async () => {
    if (!user) return navigate('/login');
    const sellerId = listing.seller?._id || listing.seller;
    if (!sellerId) return toast.error('Seller details unavailable');
    if (String(user._id) === String(sellerId)) {
      return toast.error('You cannot message yourself on your own listing');
    }
    try {
      const { data } = await messageApi.startConversation(sellerId, listing._id);
      const targetRoute = user.role === 'seller' ? '/seller/messages' : '/buyer/messages';
      navigate(`${targetRoute}?conversation=${data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start conversation');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await reviewApi.create({ targetType: 'listing', listing: listing._id, ...reviewForm });
      toast.success('Review submitted');
      setReviewForm({ rating: 5, comment: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    }
  };

  const report = listing.latestAIReport;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="grid grid-cols-4 gap-2">
          <div className="relative col-span-4 aspect-square overflow-hidden rounded-2xl bg-forest-100">
            {listing.images[0] && (
              <img
                src={listing.images[0].url}
                alt={listing.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80';
                }}
                className="h-full w-full object-cover"
              />
            )}
            <WishlistButton listingId={listing._id} className="absolute right-3 top-3 shadow" />
          </div>
          {listing.images.slice(1).map((img) => (
            <div key={img.url} className="aspect-square overflow-hidden rounded-lg bg-forest-100">
              <img
                src={img.url}
                alt=""
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80';
                }}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        <div>
          <h1 className="font-display text-2xl text-forest-900">{listing.title}</h1>
          <p className="mt-1 text-sm text-forest-500">
            {listing.brand} · Size {listing.size} · {listing.color}
          </p>
          <p className="mt-4 text-3xl font-semibold text-forest-900">₹{listing.price}</p>
          {listing.originalPrice && (
            <p className="text-sm text-forest-400 line-through">MRP ₹{listing.originalPrice}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="badge bg-forest-100 text-forest-700">{listing.conditionLabel.replace('-', ' ')}</span>
            {listing.repairAvailable && <span className="badge bg-clay-100 text-clay-700">🧵 Repair available</span>}
            {listing.sustainabilityRating && (
              <span className="badge bg-forest-100 text-forest-700">Eco rating {listing.sustainabilityRating}</span>
            )}
          </div>

          {/* AI Analysis */}
          {listing.aiGraded && (
            <div className="mt-4 space-y-1 rounded-xl border border-forest-100 p-3 text-sm">
              <p className="font-medium text-forest-800">AI Condition &amp; Authenticity Analysis</p>
              <p className="text-forest-600">
                Overall condition: <b>{listing.conditionLabel.replace('-', ' ')}</b> · Authenticity:{' '}
                <b>{listing.aiAuthenticityScore}%</b>
                {report?.authenticityConfidence && ` (${report.authenticityConfidence} confidence)`}
              </p>
              {report?.detectedDefects?.length > 0 && (
                <p className="text-forest-600">Detected: {report.detectedDefects.join(', ')}</p>
              )}
              {report?.suggestedRepair && (
                <p className="text-forest-600">Suggested repair: {report.suggestedRepair}</p>
              )}
              {report?.estimatedResalePrice != null && (
                <p className="text-forest-600">Estimated resale value: ₹{report.estimatedResalePrice}</p>
              )}
            </div>
          )}

          {impactPreview && (
            <div className="mt-4 rounded-xl bg-forest-100 p-3 text-sm text-forest-700">
              🌍 Buying this saves an estimated <b>{impactPreview.waterSavedLiters}L</b> of water,{' '}
              <b>{impactPreview.co2SavedKg}kg</b> of CO₂, and <b>{impactPreview.textileWasteDivertedKg}kg</b> of
              textile waste vs. new.
            </div>
          )}

          <p className="mt-5 whitespace-pre-line text-sm text-forest-700">{listing.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {listing.status === 'active' && (
              <>
                {user?.role === 'buyer' && (
                  <>
                    <button className="btn btn-primary" onClick={handleAddToCart}>
                      Add to cart
                    </button>
                    <OfferButton listing={listing} />
                  </>
                )}
                {(!user || String(user._id) !== String(listing.seller?._id || listing.seller)) && (
                  <button className="btn btn-secondary" onClick={handleMessageSeller}>
                    Message seller
                  </button>
                )}
              </>
            )}
            {!user && (
              <button className="btn btn-primary" onClick={() => navigate('/login')}>
                Log in to buy
              </button>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-forest-100 p-3 text-sm">
            <p className="font-medium text-forest-800">Sold by {listing.seller?.name}</p>
            <p className="text-forest-500">
              ⭐ {listing.seller?.ratingAverage?.toFixed(1) || 'New'} ({listing.seller?.ratingCount || 0} reviews)
            </p>
          </div>

          <div className="mt-3">
            <ReportButton listingId={listing._id} />
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-medium text-forest-800">Similar listings</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {similar.map((l) => (
              <ListingCard key={l._id} listing={l} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-12">
        <h2 className="mb-4 text-lg font-medium text-forest-800">Reviews ({reviews.length})</h2>
        {user?.role === 'buyer' && (
          <form onSubmit={submitReview} className="card mb-6 flex flex-col gap-2 p-4">
            <div className="flex items-center gap-2">
              <label className="label mb-0">Rating</label>
              <select
                className="input w-24"
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} ★
                  </option>
                ))}
              </select>
            </div>
            <textarea
              className="input"
              placeholder="Share your experience with this item..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            />
            <button className="btn btn-primary self-start">Submit review</button>
          </form>
        )}
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="card p-4">
              <p className="text-sm font-medium text-forest-800">
                {r.author?.name} · {'★'.repeat(r.rating)}
                {r.isVerifiedPurchase && (
                  <span className="badge ml-2 bg-forest-100 text-forest-700">Verified purchase</span>
                )}
              </p>
              <p className="mt-1 text-sm text-forest-600">{r.comment}</p>
              {r.images?.length > 0 && (
                <div className="mt-2 flex gap-2">
                  {r.images.map((img) => (
                    <img key={img.url} src={img.url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
