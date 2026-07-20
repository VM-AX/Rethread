import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { listingApi } from '../../api/listingApi';
import { aiApi } from '../../api/aiApi';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

export default function SellerListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(null);

  const load = () => listingApi.mine().then(({ data }) => setListings(data.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleGrade = async (id) => {
    setGrading(id);
    try {
      await aiApi.grade(id);
      toast.success('AI grading complete');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Grading failed');
    } finally {
      setGrading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this listing?')) return;
    await listingApi.remove(id);
    toast.success('Listing removed');
    load();
  };

  const handleStatus = async (id, status) => {
    await listingApi.updateStatus(id, status);
    load();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h2 className="text-sm font-medium text-forest-800">Your listings</h2>
        <Link to="/seller/listings/new" className="btn btn-primary text-xs">+ New listing</Link>
      </div>

      {listings.length === 0 ? (
        <EmptyState title="No listings yet" subtitle="Create your first listing to start selling." />
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l._id} className="card flex flex-wrap items-center gap-4 p-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-forest-100">
                {l.images?.[0]?.url && <img src={l.images[0].url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-[10rem] flex-1">
                <p className="text-sm font-medium text-forest-800">{l.title}</p>
                <p className="text-xs text-forest-500">₹{l.price} · {l.status}</p>
                {l.aiGraded && (
                  <p className="text-xs text-clay-600">AI: {l.aiConditionScore}/100 condition · {l.aiAuthenticityScore}/100 authenticity</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-secondary text-xs" disabled={grading === l._id} onClick={() => handleGrade(l._id)}>
                  {grading === l._id ? 'Grading...' : l.aiGraded ? 'Re-grade with AI' : 'Run AI grading'}
                </button>
                {l.status === 'active' && (
                  <button className="btn btn-secondary text-xs" onClick={() => handleStatus(l._id, 'draft')}>Unpublish</button>
                )}
                {l.status === 'draft' && (
                  <button className="btn btn-secondary text-xs" onClick={() => handleStatus(l._id, 'active')}>Publish</button>
                )}
                <button className="btn btn-danger text-xs" onClick={() => handleDelete(l._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
