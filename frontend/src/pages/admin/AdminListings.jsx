import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi';
import Loader from '../../components/Loader';

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () =>
    adminApi.listings(flaggedOnly ? { flagged: 'true' } : {}).then(({ data }) => setListings(data.data)).finally(() => setLoading(false));
  useEffect(() => { setLoading(true); load(); }, [flaggedOnly]);

  const moderate = async (id, action) => {
    try {
      await adminApi.moderateListing(id, action, action === 'flag' ? 'Reported as suspicious' : undefined);
      toast.success(`Listing ${action}d`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div>
      <label className="mb-4 flex items-center gap-2 text-sm text-forest-700">
        <input type="checkbox" checked={flaggedOnly} onChange={(e) => setFlaggedOnly(e.target.checked)} />
        Show flagged only
      </label>

      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-2">
          {listings.map((l) => (
            <div key={l._id} className="card flex flex-wrap items-center justify-between gap-2 p-3">
              <div>
                <p className="text-sm font-medium text-forest-800">{l.title}</p>
                <p className="text-xs text-forest-500">by {l.seller?.name} · ₹{l.price} · {l.status}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-secondary text-xs" onClick={() => moderate(l._id, 'flag')}>Flag</button>
                <button className="btn btn-secondary text-xs" onClick={() => moderate(l._id, 'restore')}>Restore</button>
                <button className="btn btn-danger text-xs" onClick={() => moderate(l._id, 'remove')}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
