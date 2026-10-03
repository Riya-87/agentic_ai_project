import React, { useState } from 'react';
import { Sparkles, Layers, ShoppingBag, ArrowRight, Check, Flame } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { OUTFIT_VIBES, PRODUCTS } from '../../data/products';

export const OutfitBuilder = () => {
  const { addOutfitBundle, formatPrice } = useShop();
  const [selectedVibeId, setSelectedVibeId] = useState(OUTFIT_VIBES[0].id);

  const activeVibe = OUTFIT_VIBES.find((v) => v.id === selectedVibeId) || OUTFIT_VIBES[0];
  const bundleProducts = activeVibe.productIds.map((pid) =>
    PRODUCTS.find((p) => p.id === pid)
  ).filter(Boolean);

  const totalRawPrice = bundleProducts.reduce((sum, p) => sum + p.price, 0);
  const bundleDiscountedPrice = totalRawPrice * (1 - activeVibe.discountPct / 100);

  const handleAddBundle = () => {
    addOutfitBundle(activeVibe);
  };

  return (
    <section id="outfit-builder-section" className="py-20 bg-zinc-950 text-white border-t border-zinc-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-black uppercase tracking-widest border border-purple-500/20">
            <Flame className="w-3.5 h-3.5 text-purple-400" />
            <span>INTERACTIVE OUTFIT BUNDLE BUILDER</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight font-mono">
            DISCOVER YOUR STREETWEAR VIBE
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Select an aesthetic below to generate a coordinated 3-piece street look and unlock an instant 15% bundle discount.
          </p>
        </div>

        {/* Aesthetic Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {OUTFIT_VIBES.map((vibe) => {
            const isSelected = selectedVibeId === vibe.id;
            return (
              <button
                key={vibe.id}
                onClick={() => setSelectedVibeId(vibe.id)}
                className={`p-5 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-zinc-900 border-lime-400 shadow-xl shadow-lime-400/10 ring-1 ring-lime-400'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="space-y-1.5 z-10">
                  <span className="text-[10px] font-black text-lime-400 uppercase tracking-widest">
                    15% BUNDLE SAVINGS
                  </span>
                  <h3 className="text-lg font-black uppercase font-mono text-white">{vibe.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{vibe.desc}</p>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs font-bold text-zinc-300 z-10">
                  <span className="text-[11px] text-lime-400">3 Coordinated Drops</span>
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-lime-400 text-black flex items-center justify-center font-black">
                      ✓
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Curated 3-Piece Product Grid */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <span className="text-xs font-bold text-lime-400 uppercase tracking-wider font-mono">
                CURATED BUNDLE SPECIFICATION
              </span>
              <h3 className="text-xl font-black text-white uppercase font-mono">
                {activeVibe.title} (3 Items)
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-zinc-500 line-through mr-2 font-mono">
                  {formatPrice(totalRawPrice)}
                </span>
                <span className="text-2xl font-black text-lime-400 font-mono">
                  {formatPrice(bundleDiscountedPrice)}
                </span>
              </div>
              <button
                onClick={handleAddBundle}
                className="px-6 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-lime-400/20 flex items-center gap-2 active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD BUNDLE TO BAG</span>
              </button>
            </div>
          </div>

          {/* 3 Garments Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bundleProducts.map((prod, idx) => (
              <div
                key={prod.id}
                className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex gap-4 items-center group"
              >
                <img
                  src={prod.colors[0].images[0]}
                  alt={prod.name}
                  className="w-20 h-24 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[9px] font-black text-lime-400 uppercase">
                    ITEM 0{idx + 1} • {prod.category}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate">{prod.name}</h4>
                  <p className="text-[11px] text-zinc-400">{prod.fit} Fit</p>
                  <p className="text-xs font-black text-zinc-200 font-mono">
                    {formatPrice(prod.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
