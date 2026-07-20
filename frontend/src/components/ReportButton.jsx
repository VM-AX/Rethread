import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { reportApi } from '../api/reportApi';
import { useAuth } from '../context/AuthContext';

const REASONS = [
  { value: 'counterfeit', label: 'Fake / counterfeit item' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'misleading', label: 'Misleading listing' },
  { value: 'other', label: 'Other' },
];

export default function ReportButton({ listingId }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('counterfeit');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user || user.role !== 'buyer') return null;

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await reportApi.create(listingId, reason, description);
      toast.success('Thanks — our team will review this listing.');
      setOpen(false);
      setDescription('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="text-xs font-medium text-forest-400 underline-offset-2 hover:text-red-600 hover:underline"
        onClick={() => setOpen(true)}
      >
        Report this listing
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-900/40 px-4">
          <form onSubmit={submit} className="card w-full max-w-sm p-5">
            <h3 className="font-display text-lg text-forest-900">Report listing</h3>
            <p className="mt-1 text-sm text-forest-500">
              Let us know what's wrong. Our admin team reviews every report.
            </p>

            <label className="label mt-4">Reason</label>
            <select className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>

            <label className="label mt-3">Details (optional)</label>
            <textarea
              className="input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any extra context that helps us review this faster..."
            />

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit report'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
