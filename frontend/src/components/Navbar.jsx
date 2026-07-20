import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const DASHBOARD_PATH = {
  buyer: '/buyer',
  seller: '/seller',
  repair_partner: '/repair',
  admin: '/admin',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-forest-100 bg-forest-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-display text-xl font-semibold text-forest-800">
          Re<span className="text-clay-600">Thread</span>
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <Link to="/browse" className="hidden text-forest-700 hover:text-forest-900 sm:block">
            Browse
          </Link>

          {user ? (
            <>
              {user.role === 'buyer' && (
                <Link to="/buyer/wishlist" className="hidden text-forest-700 hover:text-forest-900 sm:block">
                  Wishlist
                </Link>
              )}
              {user.role === 'buyer' && (
                <Link to="/cart" className="relative text-forest-700 hover:text-forest-900">
                  Cart
                  {items.length > 0 && (
                    <span className="ml-1 rounded-full bg-clay-500 px-1.5 py-0.5 text-xs text-white">
                      {items.length}
                    </span>
                  )}
                </Link>
              )}
              <Link to={DASHBOARD_PATH[user.role] || '/'} className="btn btn-secondary">
                {user.name.split(' ')[0]}'s Dashboard
              </Link>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Join ReThread
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
