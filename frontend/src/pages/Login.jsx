import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const DASHBOARD_PATH = {
  buyer: '/buyer',
  seller: '/seller',
  repair_partner: '/repair',
  admin: '/admin',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(location.state?.from || DASHBOARD_PATH[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="card p-8">
        <h1 className="font-display text-2xl text-forest-900">Log in</h1>
        <p className="mt-1 text-sm text-forest-500">Welcome back to ReThread.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
            <label className="label">Password</label>
            <input
              type="password"
              required
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-forest-500">
          New here?{' '}
          <Link to="/register" className="font-medium text-forest-700 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
