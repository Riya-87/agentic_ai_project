import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Tag,
  Truck,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const CartDrawer = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartItemsCount,
    cartSubtotal,
    discountAmount,
    shippingFee,
    isFreeShipping,
    freeShippingThreshold,
    estimatedTax,
    cartTotal,
    updateCartQuantity,
    removeFromCart,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    setIsCheckoutOpen,
    formatPrice,
  } = useShop();

  const [couponInput, setCouponInput] = useState('');

  if (!isCartOpen) return null;

  const freeShippingProgress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      const ok = applyPromoCode(couponInput);
      if (ok) setCouponInput('');
    }
  };

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
      />

      {/* Slide-over Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-800 text-white flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-lime-400" />
              <h3 className="text-base font-black uppercase tracking-tight font-mono">
                YOUR SHOPPING BAG ({cartItemsCount})
              </h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="p-4 bg-zinc-900/60 border-b border-zinc-800 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Truck className="w-4 h-4 text-lime-400" />
                {isFreeShipping ? (
                  <span className="text-lime-400 font-black">🎉 You've unlocked FREE Worldwide Delivery!</span>
                ) : (
                  <span>Add {formatPrice(amountToFreeShipping)} more for FREE Delivery</span>
                )}
              </span>
              <span className="text-lime-400 font-mono font-bold">
                {Math.round(freeShippingProgress)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-lime-400 rounded-full transition-all duration-500 shadow-sm shadow-lime-400/50"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div
                  key={item.key}
                  className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex gap-3 items-center group hover:border-zinc-700 transition-all"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-18 h-22 rounded-xl object-cover bg-zinc-950"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {item.color} • <span className="font-bold text-lime-400">Size {item.size}</span>
                    </p>
                    <p className="text-xs font-black text-white font-mono">
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex items-center rounded-lg bg-zinc-800 border border-zinc-700 p-0.5">
                        <button
                          onClick={() => updateCartQuantity(item.key, -1)}
                          className="w-6 h-6 rounded-md hover:bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.key, 1)}
                          className="w-6 h-6 rounded-md hover:bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.key)}
                        className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center space-y-4 my-auto">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 mx-auto flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Your bag is empty</h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                    Explore the new season streetwear drops and add your favorite pieces.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-lime-400 text-black font-black text-xs uppercase"
                >
                  Start Browsing
                </button>
              </div>
            )}
          </div>

          {/* Footer Checkout Calculation & Coupon Input */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-zinc-800 bg-zinc-900/90 space-y-4">
              {/* Promo Code Input */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code (e.g. COLLUSION20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 uppercase font-mono focus:outline-none focus:border-lime-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white uppercase transition-colors"
                >
                  Apply
                </button>
              </form>

              {/* Applied Promo Code Badge */}
              {appliedPromo && (
                <div className="p-2.5 rounded-xl bg-lime-400/10 border border-lime-400/30 text-xs flex items-center justify-between text-lime-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{appliedPromo.title || appliedPromo.code}</span>
                  </span>
                  <button onClick={removePromoCode} className="text-zinc-400 hover:text-rose-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Price Calculation Lines */}
              <div className="space-y-1.5 text-xs text-zinc-400 font-mono">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">{formatPrice(cartSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-lime-400 font-bold">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className={isFreeShipping ? 'text-lime-400 font-bold font-sans' : 'text-white'}>
                    {isFreeShipping ? 'FREE' : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>{formatPrice(estimatedTax)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-zinc-800">
                  <span className="font-sans uppercase">Total</span>
                  <span className="text-lime-400 font-mono">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleProceedCheckout}
                className="w-full py-4 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-lime-400/20 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>CHECKOUT ({formatPrice(cartTotal)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
