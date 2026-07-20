import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { listingApi } from '../../api/listingApi';

const CATEGORIES = ['tops', 'bottoms', 'dresses', 'outerwear', 'footwear', 'accessories', 'denim', 'ethnic-wear'];
const CONDITIONS = ['like-new', 'gently-used', 'visible-wear', 'needs-repair'];

export default function CreateListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'tops', size: '', brand: '', color: '',
    gender: 'unisex', originalPrice: '', price: '', conditionLabel: 'gently-used', tags: '',
  });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) return toast.error('Please add at least one image');
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append('images', img));
      const { data } = await listingApi.create(fd);
      toast.success('Listing created');
      navigate(`/seller/listings`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <h2 className="text-sm font-medium text-forest-800">Create a new listing</h2>

      <div>
        <label className="label">Title</label>
        <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea required className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Condition</label>
          <select className="input" value={form.conditionLabel} onChange={(e) => setForm({ ...form, conditionLabel: e.target.value })}>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Size</label>
          <input required className="input" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
        </div>
        <div>
          <label className="label">Brand</label>
          <input className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        </div>
        <div>
          <label className="label">Color</label>
          <input className="input" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
        </div>
        <div>
          <label className="label">Gender</label>
          <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            {['men', 'women', 'unisex', 'kids'].map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Original price (₹)</label>
          <input type="number" className="input" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
        </div>
        <div>
          <label className="label">Selling price (₹)</label>
          <input type="number" required className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="label">Tags (comma-separated)</label>
        <input className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
      </div>

      <div>
        <label className="label">Photos</label>
        <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))} />
      </div>

      <button className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create listing'}
      </button>
    </form>
  );
}
