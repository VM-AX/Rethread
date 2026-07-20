import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import EmptyState from '../components/EmptyState';

export default function Cart() {
  const { items, removeItem, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Your cart is empty"
          subtitle="Browse the marketplace to find your next favorite piece."
          action={
            <Link to="/browse" className="btn btn-primary mt-2">
              Browse listings
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-2xl text-forest-900">Your cart</h1>
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item.listingId} className="card flex items-center gap-4 p-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-forest-100">
              {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-forest-800">{item.title}</p>
              <p className="text-sm text-forest-500">₹{item.price}</p>
            </div>
            <button className="text-sm text-red-600 hover:underline" onClick={() => removeItem(item.listingId)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="card mt-6 flex items-center justify-between p-4">
        <span className="text-sm text-forest-600">Subtotal</span>
        <span className="text-lg font-semibold text-forest-900">₹{total}</span>
      </div>

      <button className="btn btn-primary mt-4 w-full" onClick={() => navigate('/checkout')}>
        Proceed to checkout
      </button>
    </div>
  );
}
