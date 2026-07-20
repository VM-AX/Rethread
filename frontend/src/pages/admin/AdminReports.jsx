import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { reportApi } from '../../api/reportApi';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

const STATUS_STYLE = {
  pending: 'bg-amber-100 text-amber-700',
  reviewing: 'bg-clay-100 text-clay-600',
  resolved: 'bg-forest-100 text-forest-700',
  dismissed: 'bg-forest-50 text-forest-400',
};

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const load = () => {
    setLoading(true);
    reportApi
      .adminList(filter ? { status: filter } : {})
      .then(({ data }) => setReports(data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const act = async (id, status, moderateListing) => {
    try {
      await reportApi.adminUpdate(id, { status, moderateListing });
      toast.success(`Report marked as ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update report');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['pending', 'reviewing', 'resolved', 'dismissed', ''].map((s) => (
          <button
            key={s || 'all'}
            className={`btn text-xs ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(s)}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : reports.length === 0 ? (
        <EmptyState title="No reports here" subtitle="You're all caught up." />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r._id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-forest-800">{r.listing?.title || 'Listing removed'}</span>
                <span className={`badge ${STATUS_STYLE[r.status] || ''}`}>{r.status}</span>
              </div>
              <p className="mt-1 text-sm text-forest-600">
                Reason: <b>{r.reason}</b> · Reported by {r.reporter?.name}
              </p>
              {r.description && <p className="mt-1 text-sm text-forest-500">"{r.description}"</p>}

              {r.status === 'pending' || r.status === 'reviewing' ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn btn-secondary text-xs" onClick={() => act(r._id, 'reviewing')}>
                    Mark reviewing
                  </button>
                  <button
                    className="btn btn-danger text-xs"
                    onClick={() => act(r._id, 'resolved', 'remove')}
                  >
                    Remove listing &amp; resolve
                  </button>
                  <button className="btn btn-secondary text-xs" onClick={() => act(r._id, 'resolved', 'flag')}>
                    Flag listing &amp; resolve
                  </button>
                  <button className="btn btn-secondary text-xs" onClick={() => act(r._id, 'dismissed')}>
                    Dismiss
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-xs text-forest-400">
                  Reviewed by {r.reviewedBy?.name || 'admin'} {r.resolutionNote ? `— ${r.resolutionNote}` : ''}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
