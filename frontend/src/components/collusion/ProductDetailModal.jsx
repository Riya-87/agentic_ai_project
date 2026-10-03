import React, { useState } from 'react';
import {
  X,
  Heart,
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Ruler,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const ProductDetailModal = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    formatPrice,
  } = useShop();

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isWishlisted = isInWishlist(product.id);

  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showFitCalculator, setShowFitCalculator] = useState(false);
  const [calcHeight, setCalcHeight] = useState(175);
  const [calcWeight, setCalcWeight] = useState(70);

  const activeColor = product.colors[selectedColorIdx] || product.colors[0];
  const images = activeColor.images || [];
  const currentImage = images[selectedImageIdx] || images[0];

  // Calculated recommended size based on user height & weight
  const getRecommendedSize = () => {
    const bmi = calcWeight / ((calcHeight / 100) * (calcHeight / 100));
    if (bmi < 20) return 'S';
    if (bmi < 24) return 'M';
    if (bmi < 28) return 'L';
    return 'XL';
  };

  const handleAddToCart = () => {
    addToCart(product, activeColor.name, selectedSize, quantity);
    setQuickViewProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden my-auto">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 text-zinc-400 hover:text-white hover:bg-black/90 border border-zinc-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Multi-Angle High-Res Gallery */}
          <div className="lg:col-span-7 p-4 sm:p-6 bg-zinc-900/50 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnail Selector */}
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIdx === idx ? 'border-lime-400 scale-105' : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Stage Image */}
            <div className="flex-1 relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-950">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {product.badge && (
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-lime-400 text-black text-[10px] font-black uppercase tracking-wider shadow-lg">
                  {product.badge}
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Specifications & Interactive Purchase Form */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 text-white overflow-y-auto max-h-[85vh]">
            <div className="space-y-4">
              {/* Category & Ratings */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-lime-400 tracking-wider uppercase">
                  {product.category} • {product.gender}
                </span>
                <div className="flex items-center gap-1 text-zinc-300 font-bold">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-zinc-500">({product.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Title & Tagline */}
              <div>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight font-mono">
                  {product.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">{product.tagline}</p>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 py-2 border-y border-zinc-800/80 font-mono">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-zinc-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {product.originalPrice > product.price && (
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-xs font-bold font-sans">
                    SAVE {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-400 uppercase tracking-wider">Colorway:</span>
                  <span className="text-lime-400">{activeColor.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {product.colors.map((c, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => {
                        setSelectedColorIdx(cIdx);
                        setSelectedImageIdx(0);
                      }}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        selectedColorIdx === cIdx
                          ? 'ring-2 ring-lime-400 ring-offset-2 ring-offset-zinc-950 scale-110 border-white'
                          : 'border-zinc-700 opacity-60 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection & Fit Calculator Trigger */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-400 uppercase tracking-wider">Select Size ({product.fit}):</span>
                  <button
                    onClick={() => setShowFitCalculator(!showFitCalculator)}
                    className="text-lime-400 hover:text-lime-300 flex items-center gap-1 text-[11px] underline"
                  >
                    <Ruler className="w-3 h-3" />
                    <span>AI Size & Fit Finder</span>
                  </button>
                </div>

                {/* Fit Calculator Drawer */}
                {showFitCalculator && (
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-lime-400/30 space-y-3 animate-in fade-in duration-150 text-xs">
                    <div className="flex items-center justify-between font-bold text-lime-400">
                      <span>Smart Fit Guide</span>
                      <span>Recommended: Size {getRecommendedSize()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-zinc-400 text-[10px] block mb-1">Height: {calcHeight} cm</label>
                        <input
                          type="range"
                          min="150"
                          max="205"
                          value={calcHeight}
                          onChange={(e) => setCalcHeight(Number(e.target.value))}
                          className="w-full accent-lime-400"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 text-[10px] block mb-1">Weight: {calcWeight} kg</label>
                        <input
                          type="range"
                          min="45"
                          max="120"
                          value={calcWeight}
                          onChange={(e) => setCalcWeight(Number(e.target.value))}
                          className="w-full accent-lime-400"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSize(getRecommendedSize());
                        setShowFitCalculator(false);
                      }}
                      className="w-full py-1.5 rounded-lg bg-lime-400 text-black font-black text-[11px] uppercase tracking-wider"
                    >
                      Apply Size {getRecommendedSize()}
                    </button>
                  </div>
                )}

                {/* Size Pills */}
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                        selectedSize === sz
                          ? 'bg-lime-400 text-black shadow-md shadow-lime-400/20 scale-105'
                          : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Garment Highlights List */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Garment Construction
                </span>
                <ul className="space-y-1 text-xs text-zinc-300">
                  {product.details?.map((d, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-lime-400 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Actions: Quantity + Add to Bag + Wishlist */}
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center rounded-2xl bg-zinc-900 border border-zinc-800 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold font-mono text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag CTA */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-lime-400/20 flex items-center justify-center gap-2 active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ADD TO BAG ({formatPrice(product.price * quantity)})</span>
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isWishlisted
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Guarantees Strip */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-zinc-400 font-bold uppercase text-center">
                <div className="p-2 rounded-xl bg-zinc-900/60 flex flex-col items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-lime-400" />
                  <span>Free Global $75+</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-900/60 flex flex-col items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-lime-400" />
                  <span>30-Day Free Return</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-900/60 flex flex-col items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
                  <span>100% Animal Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
