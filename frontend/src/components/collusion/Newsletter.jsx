import React, { useState } from 'react';
import { Mail, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const Newsletter = () => {
  const { applyPromoCode, showToast } = useShop();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      applyPromoCode('COLLUSION20');
      showToast('🎉 Subscribed! Code COLLUSION20 applied for 20% off', 'success');
    }
  };

  return (
    <section className="py-20 bg-lime-400 text-black overflow-hidden relative select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black text-lime-400 text-xs font-black uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>VIP DROP ACCESS</span>
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter font-mono leading-none">
          NEVER MISS A LIMITED DROP. UNLOCK 20% OFF.
        </h2>

        <p className="text-xs sm:text-sm font-bold text-zinc-900 max-w-xl mx-auto">
          Get secret early access passwords to our Thursday drops, private warehouse archive sales, and an instant 20% discount on your first order.
        </p>

        {!isSubscribed ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
            <input
              type="email"
              required
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-5 py-4 rounded-full bg-black text-white text-xs sm:text-sm font-bold placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              className="px-8 py-4 rounded-full bg-zinc-900 hover:bg-black text-lime-400 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2"
            >
              <span>CLAIM 20%</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="p-5 rounded-3xl bg-black text-white max-w-md mx-auto space-y-2 animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-8 h-8 text-lime-400 mx-auto" />
            <h4 className="text-sm font-black uppercase font-mono text-lime-400">
              YOU'RE ON THE VIP DROP LIST!
            </h4>
            <p className="text-xs text-zinc-300 font-mono">
              Coupon <strong className="text-lime-400">COLLUSION20</strong> has been automatically added to your Bag.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
