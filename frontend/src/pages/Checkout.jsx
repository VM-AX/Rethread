import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { orderApi } from '../api/orderApi';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ line1: '', city: '', state: '', postalCode: '', country: 'India' });
  const [method, setMethod] = useState('mock_card');
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const { data } = await orderApi.create({
        items: items.map((i) => ({ listingId: i.listingId, quantity: i.quantity, offerId: i.offerId })),
        shippingAddress: address,
        payment: { method },
      });
      const order = data.data;
      await orderApi.pay(order._id);
      clearCart();
      toast.success('Order placed and paid successfully!');
      navigate('/buyer/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-2xl text-forest-900">Checkout</h1>

      <form className="mt-6 grid gap-8 sm:grid-cols-2" onSubmit={handlePlaceOrder}>
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-forest-800">Shipping address</h2>
          {['line1', 'city', 'state', 'postalCode', 'country'].map((field) => (
            <input
              key={field}
              required
              className="input"
              placeholder={field}
              value={address[field]}
              onChange={(e) => setAddress({ ...address, [field]: e.target.value })}
            />
          ))}

          <h2 className="pt-3 text-sm font-medium text-forest-800">Payment method (mock)</h2>
          <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="mock_card">Card</option>
            <option value="mock_upi">UPI</option>
            <option value="cod">Cash on delivery</option>
          </select>
        </div>

        <div>
          <div className="card p-4">
            <h2 className="mb-3 text-sm font-medium text-forest-800">Order summary</h2>
            {items.map((i) => (
              <div key={i.listingId} className="flex justify-between py-1 text-sm text-forest-600">
                <span>{i.title}</span>
                <span>₹{i.price}</span>
              </div>
            ))}
            <div className="mt-3 flex justify-between border-t border-forest-100 pt-3 text-base font-semibold text-forest-900">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
          <button className="btn btn-primary mt-4 w-full" disabled={placing}>
            {placing ? 'Placing order...' : 'Place order & pay'}
          </button>
        </div>
      </form>
    </div>
  );
}
