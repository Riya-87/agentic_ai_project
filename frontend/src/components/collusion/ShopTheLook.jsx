import React, { useState } from 'react';
import { Plus, Check, ShoppingBag, Sparkles, ArrowRight, Eye, Layers } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { LOOKBOOK_HOTSPOTS, PRODUCTS } from '../../data/products';

export const ShopTheLook = () => {
  const { addToCart, setQuickViewProduct, formatPrice, addOutfitBundle } = useShop();
  const [activeSpot, setActiveSpot] = useState(LOOKBOOK_HOTSPOTS[0]);
  const [selectedSize, setSelectedSize] = useState({}); // spotId -> size

  const outfitProducts = LOOKBOOK_HOTSPOTS.map((spot) =>
    PRODUCTS.find((p) => p.id === spot.productId)
  ).filter(Boolean);

  const outfitTotalPrice = outfitProducts.reduce((sum, p) => sum + p.price, 0);
  const bundleDiscountPrice = outfitTotalPrice * 0.85;

  const handleSpotAdd = (spot, e) => {
    e.stopPropagation();
    const product = PRODUCTS.find((p) => p.id === spot.productId);
    if (product) {
      const size = selectedSize[spot.id] || product.sizes[0];
      addToCart(product, product.colors[0].name, size, 1);
    }
  };

  const handleBundleAdd = () => {
    addOutfitBundle({
      title: 'Full Cyber-Street Look',
      productIds: outfitProducts.map((p) => p.id),
      discountPct: 15,
    });
  };

  return (
    <section className="py-20 bg-zinc-950 text-white relative overflow-hidden border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 text-xs font-black uppercase tracking-widest mb-3 border border-lime-400/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>INTERACTIVE EDITORIAL LOOKBOOK</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight font-mono">
              SHOP THE COMPLETE LOOK
            </h2>
            <p className="text-zinc-400 text-sm mt-2 max-w-lg">
              Click the pulsating pins on the lookbook model to explore garment specifications or purchase the coordinated 3-piece bundle with an instant 15% discount.
            </p>
          </div>

          <button
            onClick={handleBundleAdd}
            className="px-6 py-3.5 rounded-full bg-lime-400 hover:bg-lime-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-lime-400/20 flex items-center gap-2 active:scale-95 self-start md:self-auto"
          >
            <Layers className="w-4 h-4" />
            <span>ADD COMPLETE LOOK ({formatPrice(bundleDiscountPrice)})</span>
          </button>
        </div>

        {/* Main Interactive Lookbook Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Full Editorial Photo with Pulsating Hotspot Pins */}
          <div className="lg:col-span-7 relative rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl group min-h-[560px] sm:min-h-[640px] flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=85"
              alt="Collusion Editorial Lookbook Model"
              className="w-full h-full object-cover object-center absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

            {/* Interactive Pins */}
            {LOOKBOOK_HOTSPOTS.map((spot) => {
              const isSelected = activeSpot?.id === spot.id;
              const product = PRODUCTS.find((p) => p.id === spot.productId);

              return (
                <div
                  key={spot.id}
                  style={{ top: spot.top, left: spot.left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  {/* Pulsating Pin Trigger */}
                  <button
                    onClick={() => setActiveSpot(spot)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 relative shadow-2xl ${
                      isSelected
                        ? 'bg-lime-400 text-black scale-125 ring-4 ring-lime-400/40'
                        : 'bg-black/80 backdrop-blur-md text-white hover:scale-110 border border-white/30'
                    }`}
                    aria-label={`View ${spot.name}`}
                  >
                    <span className="absolute inset-0 rounded-full bg-lime-400 animate-ping opacity-30" />
                    <Plus className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-45' : ''}`} />
                  </button>

                  {/* Floating Mini Product Card on Pin */}
                  {isSelected && product && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-12 w-64 p-3.5 rounded-2xl bg-black/90 backdrop-blur-xl border border-lime-400/50 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-30">
                      <div className="flex gap-3">
                        <img
                          src={product.colors[0].images[0]}
                          alt={product.name}
                          className="w-14 h-18 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-black text-lime-400 uppercase">
                            {product.category}
                          </span>
                          <h4 className="text-xs font-bold text-white truncate">{product.name}</h4>
                          <p className="text-xs font-black text-zinc-200 mt-1">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </div>

                      {/* Size Selector */}
                      <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-zinc-800">
                        <span className="text-[10px] font-bold text-zinc-400">Size:</span>
                        <div className="flex gap-1 overflow-x-auto">
                          {product.sizes.slice(0, 4).map((sz) => (
                            <button
                              key={sz}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSize((prev) => ({ ...prev, [spot.id]: sz }));
                              }}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                (selectedSize[spot.id] || product.sizes[0]) === sz
                                  ? 'bg-lime-400 text-black'
                                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-1.5 mt-2.5">
                        <button
                          onClick={(e) => handleSpotAdd(spot, e)}
                          className="flex-1 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-[11px] font-black flex items-center justify-center gap-1 transition-colors"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Add to Bag</span>
                        </button>
                        <button
                          onClick={() => setQuickViewProduct(product)}
                          className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                          title="Quick View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Breakdown of Outfits Cards */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">
              GARMENTS IN THIS LOOK (3 ITEMS)
            </h3>

            <div className="space-y-3">
              {outfitProducts.map((product) => {
                const isCurrentActive = activeSpot?.productId === product.id;

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      const spot = LOOKBOOK_HOTSPOTS.find((s) => s.productId === product.id);
                      if (spot) setActiveSpot(spot);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isCurrentActive
                        ? 'bg-zinc-900 border-lime-400 shadow-lg shadow-lime-400/10 ring-1 ring-lime-400'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={product.colors[0].images[0]}
                        alt={product.name}
                        className="w-16 h-20 rounded-xl object-cover bg-zinc-950"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-lime-400 uppercase">
                          {product.category}
                        </span>
                        <h4 className="text-sm font-bold text-white leading-snug">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-black text-zinc-200">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">
                            {product.fit}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product, product.colors[0].name, product.sizes[0], 1);
                      }}
                      className="p-2.5 rounded-xl bg-zinc-800 hover:bg-lime-400 text-zinc-300 hover:text-black transition-all"
                      title="Add to Bag"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bundle Savings Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-tr from-zinc-900 to-zinc-900/90 border border-lime-400/30 space-y-3 mt-4">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                <span>Individual Total:</span>
                <span className="line-through">{formatPrice(outfitTotalPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-black text-white">
                <span className="flex items-center gap-1.5 text-lime-400">
                  <Sparkles className="w-4 h-4" /> Bundle Special (15% OFF):
                </span>
                <span className="text-xl font-black text-lime-400 font-mono">
                  {formatPrice(bundleDiscountPrice)}
                </span>
              </div>
              <button
                onClick={handleBundleAdd}
                className="w-full py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20 active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>BUY FULL OUTFIT LOOK</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
