import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { repairApi } from '../../api/repairApi';
import { orderApi } from '../../api/orderApi';
import Loader from '../../components/Loader';

const ISSUE_TYPES = ['stitching', 'zipper', 'button', 'stain-removal', 'alteration', 'patch', 'other'];

export default function BuyerRepairs() {
  const [repairs, setRepairs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ order: '', listing: '', issueType: 'stitching', description: '' });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const load = () =>
    Promise.all([repairApi.mine(), orderApi.mine()])
      .then(([rRes, oRes]) => {
        setRepairs(rRes.data.data);
        setOrders(oRes.data.data.filter((o) => o.status === 'delivered'));
      })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleOrderSelect = (orderId) => {
    const order = orders.find((o) => o._id === orderId);
    setForm({ ...form, order: orderId, listing: order?.items[0]?.listing || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      images.forEach((img) => fd.append('images', img));
      await repairApi.create(fd);
      toast.success('Repair request submitted');
      setShowForm(false);
      setForm({ order: '', listing: '', issueType: 'stitching', description: '' });
      setImages([]);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit repair request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h2 className="text-sm font-medium text-forest-800">Your repair requests</h2>
        <button className="btn btn-primary text-xs" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : 'Book a repair'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-3 p-4">
          <div>
            <label className="label">Which delivered order?</label>
            <select required className="input" value={form.order} onChange={(e) => handleOrderSelect(e.target.value)}>
              <option value="">Select order</option>
              {orders.map((o) => (
                <option key={o._id} value={o._id}>
                  #{o._id.slice(-6)} — {o.items[0]?.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Issue type</label>
            <select className="input" value={form.issueType} onChange={(e) => setForm({ ...form, issueType: e.target.value })}>
              {ISSUE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Describe the issue</label>
            <textarea
              required
              className="input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Photos (optional)</label>
            <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))} />
          </div>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit request'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {repairs.map((r) => (
          <div key={r._id} className="card p-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-forest-800">{r.issueType}</span>
              <span className="badge bg-forest-100 text-forest-700">{r.status}</span>
            </div>
            <p className="mt-1 text-sm text-forest-600">{r.description}</p>
            {r.repairPartner && (
              <p className="mt-1 text-xs text-forest-500">Assigned to {r.repairPartner.name}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
