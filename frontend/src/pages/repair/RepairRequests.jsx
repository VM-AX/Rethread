import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { repairApi } from '../../api/repairApi';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

const TABS = [
  { key: 'requested', label: 'New requests' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
];

export default function RepairRequests() {
  const [tab, setTab] = useState('requested');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    repairApi.partnerRequests({ status: tab }).then(({ data }) => setRequests(data.data)).finally(() => setLoading(false));

  useEffect(() => { setLoading(true); load(); }, [tab]);

  const handleAccept = async (id) => {
    try { await repairApi.accept(id); toast.success('Request accepted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Could not accept'); }
  };

  const handleReject = async (id) => {
    try { await repairApi.reject(id, 'Not available right now'); toast.success('Request rejected'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Could not reject'); }
  };

  const handleProgress = async (id, status) => {
    try {
      await repairApi.updateProgress(id, status, status === 'completed' ? 'Repair completed' : 'Work started');
      toast.success(`Marked as ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-2xl text-forest-900">Repair requests</h1>

      <div className="mt-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-3 py-1.5 text-sm ${tab === t.key ? 'bg-forest-700 text-white' : 'bg-forest-100 text-forest-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <Loader />
        ) : requests.length === 0 ? (
          <EmptyState title="Nothing here yet" />
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r._id} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-forest-800">{r.issueType} — {r.listing?.title}</span>
                  <span className="badge bg-forest-100 text-forest-700">{r.status}</span>
                </div>
                <p className="mt-1 text-sm text-forest-600">{r.description}</p>
                <p className="mt-1 text-xs text-forest-500">Requested by {r.buyer?.name} · {r.buyer?.phone}</p>

                <div className="mt-3 flex gap-2">
                  {r.status === 'requested' && (
                    <>
                      <button className="btn btn-primary text-xs" onClick={() => handleAccept(r._id)}>Accept</button>
                      <button className="btn btn-danger text-xs" onClick={() => handleReject(r._id)}>Reject</button>
                    </>
                  )}
                  {r.status === 'accepted' && (
                    <button className="btn btn-secondary text-xs" onClick={() => handleProgress(r._id, 'in_progress')}>
                      Start work
                    </button>
                  )}
                  {r.status === 'in_progress' && (
                    <button className="btn btn-primary text-xs" onClick={() => handleProgress(r._id, 'completed')}>
                      Mark completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
