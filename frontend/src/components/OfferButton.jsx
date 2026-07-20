import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { offerApi } from '../api/offerApi';
import { useAuth } from '../context/AuthContext';

export default function OfferButton({ listing }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (listing.offersEnabled === false) return null;
  if (user?.role === 'seller' && String(listing.seller?._id) === String(user._id)) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmitting(true);
    try {
      await offerApi.create(listing._id, Number(offerPrice), message);
      toast.success('Offer sent to seller');
      setOpen(false);
      setOfferPrice('');
      setMessage('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send offer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button type="button" className="btn btn-secondary" onClick={() => (user ? setOpen(true) : navigate('/login'))}>
        Make an offer
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-900/40 px-4">
          <form onSubmit={submit} className="card w-full max-w-sm p-5">
            <h3 className="font-display text-lg text-forest-900">Make an offer</h3>
            <p className="mt-1 text-sm text-forest-500">Listed at ₹{listing.price}. Propose your price below.</p>

            <label className="label mt-4">Your offer (₹)</label>
            <input
              type="number"
              className="input"
              min="1"
              max={listing.price - 1}
              required
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              placeholder={`Less than ₹${listing.price}`}
            />

            <label className="label mt-3">Message (optional)</label>
            <textarea
              className="input"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the seller why this price works for you..."
            />

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send offer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
