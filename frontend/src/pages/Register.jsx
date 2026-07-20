import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const DASHBOARD_PATH = {
  buyer: '/buyer',
  seller: '/seller',
  repair_partner: '/repair',
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'buyer', phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to ReThread, ${user.name.split(' ')[0]}!`);
      navigate(DASHBOARD_PATH[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="card p-8">
        <h1 className="font-display text-2xl text-forest-900">Create your account</h1>
        <p className="mt-1 text-sm text-forest-500">Join the circular fashion movement.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label">I want to join as</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['buyer', 'Buyer'],
                ['seller', 'Seller'],
                ['repair_partner', 'Repair Partner'],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setForm({ ...form, role: value })}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium ${
                    form.role === value
                      ? 'border-forest-600 bg-forest-600 text-white'
                      : 'border-forest-200 bg-white text-forest-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Full name</label>
            <input
              required
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-forest-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-forest-700 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
