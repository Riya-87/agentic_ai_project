import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  Sparkles,
  Lock,
  ShoppingBag
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const CheckoutModal = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartTotal,
    clearCart,
    formatPrice,
    appliedPromo,
  } = useShop();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const [formData, setFormData] = useState({
    name: 'Alex Mercer',
    email: 'alex.mercer@collusion.studio',
    address: '742 Evergreen Terrace',
    city: 'New York',
    zip: '10001',
    country: 'United States',
    cardNumber: '•••• •••• •••• 4242',
    cardExp: '12/28',
    cardCvc: '888',
  });

  const [orderNumber, setOrderNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isCheckoutOpen) return null;

  const handleNextToPayment = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      const generatedOrder = 'CLS-' + Math.floor(100000 + Math.random() * 900000);
      setOrderNumber(generatedOrder);
      setIsProcessing(false);
      setStep(3);
      clearCart();
    }, 1200);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 sm:p-8 text-white space-y-6 my-auto">
        {/* Header with Step Progress */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <span className="text-[10px] font-mono font-bold text-lime-400 uppercase tracking-widest">
              SECURE CHECKOUT
            </span>
            <h3 className="text-xl font-black uppercase tracking-tight font-mono">
              {step === 1 && '1. Shipping & Contact'}
              {step === 2 && '2. Payment Method'}
              {step === 3 && 'Order Confirmed!'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        {step < 3 && (
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-lime-400' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Shipping</span>
            </div>
            <div className="flex-1 h-0.5 bg-zinc-800 mx-3" />
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-lime-400' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Payment</span>
            </div>
            <div className="flex-1 h-0.5 bg-zinc-800 mx-3" />
            <div className="flex items-center gap-1.5 text-zinc-600">
              <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Confirmation</span>
            </div>
          </div>
        )}

        {/* Step 1: Shipping Form */}
        {step === 1 && (
          <form onSubmit={handleNextToPayment} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-medium focus:outline-none focus:border-lime-400"
                />
              </div>
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Email for Tracking</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-medium focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-400 font-bold block mb-1">Street Address</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-medium focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-medium focus:outline-none focus:border-lime-400"
                />
              </div>
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Postal Code</label>
                <input
                  type="text"
                  required
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-medium focus:outline-none focus:border-lime-400"
                />
              </div>
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Country</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-medium focus:outline-none focus:border-lime-400"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Germany">Germany</option>
                  <option value="Japan">Japan</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <span className="text-xs text-zinc-400 font-mono">
                Order Total: <strong className="text-lime-400">{formatPrice(cartTotal)}</strong>
              </span>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Payment Method */}
        {step === 2 && (
          <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-lime-400" />
                  <span>Credit / Debit Card</span>
                </span>
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
              </div>

              <div>
                <label className="text-zinc-400 text-[11px] block mb-1">Card Number</label>
                <input
                  type="text"
                  required
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 text-[11px] block mb-1">Expiry Date</label>
                  <input
                    type="text"
                    required
                    value={formData.cardExp}
                    onChange={(e) => setFormData({ ...formData, cardExp: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono focus:outline-none focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 text-[11px] block mb-1">CVC / CVV</label>
                  <input
                    type="text"
                    required
                    value={formData.cardCvc}
                    onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>
            </div>

            {/* Simulated 1-Click Pay Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="py-3 rounded-xl bg-white text-black font-black text-xs uppercase flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition-colors"
              >
                <span> Pay</span>
              </button>
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="py-3 rounded-xl bg-amber-400 text-blue-950 font-black text-xs uppercase flex items-center justify-center gap-1.5 hover:bg-amber-300 transition-colors font-mono"
              >
                <span>PayPal</span>
              </button>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-zinc-400 hover:text-white font-bold"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-8 py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-lime-400/20 disabled:opacity-50"
              >
                {isProcessing ? 'Authorizing Payment...' : `PAY ${formatPrice(cartTotal)}`}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Order Confirmation Success Screen */}
        {step === 3 && (
          <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-lime-400/10 border border-lime-400/40 text-lime-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black text-lime-400 uppercase tracking-widest">
                ORDER DISPATCHED
              </span>
              <h4 className="text-2xl font-black font-mono text-white uppercase">
                THANK YOU FOR YOUR DROP ORDER!
              </h4>
              <p className="text-xs text-zinc-400">
                Tracking confirmation has been dispatched to{' '}
                <strong className="text-white">{formData.email}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-mono space-y-2 max-w-sm mx-auto text-left">
              <div className="flex justify-between">
                <span className="text-zinc-400">Order Reference:</span>
                <span className="text-lime-400 font-black">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Estimated Delivery:</span>
                <span className="text-white font-bold">3-5 Business Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Shipping To:</span>
                <span className="text-white font-bold">{formData.city}, {formData.country}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="px-8 py-3.5 rounded-full bg-lime-400 hover:bg-lime-300 text-black font-black text-xs uppercase tracking-wider shadow-xl shadow-lime-400/20"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
