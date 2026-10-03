import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Star, Sparkles, Check } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const ProductCard = ({ product }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    setQuickViewProduct,
    formatPrice,
  } = useShop();

  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const activeColor = product.colors[selectedColorIdx] || product.colors[0];
  const isWishlisted = isInWishlist(product.id);

  // Hover image logic
  const primaryImage = activeColor.images[0];
  const hoverImage = activeColor.images[1] || activeColor.images[0];
  const displayImage = isHovered ? hoverImage : primaryImage;

  const handleQuickAdd = (e, size) => {
    e.stopPropagation();
    addToCart(product, activeColor.name, size, 1);
  };

  const getBadgeColor = (badge) => {
    if (!badge) return '';
    if (badge.includes('OFF')) return 'bg-rose-500 text-white';
    if (badge.includes('NEW')) return 'bg-blue-600 text-white';
    if (badge.includes('ECO')) return 'bg-emerald-500 text-black font-extrabold';
    return 'bg-lime-400 text-black font-extrabold';
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowQuickAdd(false);
      }}
      className="group relative flex flex-col justify-between rounded-3xl bg-zinc-900/70 border border-zinc-800/80 hover:border-lime-400/80 p-3 sm:p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-lime-400/5"
    >
      {/* Product Image Container */}
      <div
        onClick={() => setQuickViewProduct(product)}
        className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-950 cursor-pointer"
      >
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase shadow-md ${getBadgeColor(
                product.badge
              )}`}
            >
              {product.badge}
            </span>
          )}
          {product.isEco && (
            <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[9px] font-bold uppercase">
              🌱 ECO-ORGANIC
            </span>
          )}
        </div>

        {/* Top Right Wishlist & QuickView Action Pills */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-lg ${
              isWishlisted
                ? 'bg-rose-500 text-white'
                : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/90'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md text-zinc-300 hover:text-lime-400 hover:bg-black/90 transition-all shadow-lg opacity-0 group-hover:opacity-100"
            title="Quick View"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Hover Quick-Add Size Overlay Bar */}
        <div className="absolute inset-x-2 bottom-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
          <div className="p-2 rounded-xl bg-black/90 backdrop-blur-md border border-zinc-700 shadow-2xl flex items-center justify-between gap-1">
            <span className="text-[9px] font-black uppercase text-zinc-400 pl-1">Size:</span>
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {product.sizes.slice(0, 5).map((size) => (
                <button
                  key={size}
                  onClick={(e) => handleQuickAdd(e, size)}
                  className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-lime-400 hover:text-black text-[10px] font-black text-white transition-colors"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Metadata Details */}
      <div className="pt-3 space-y-2">
        {/* Category & Rating */}
        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase">
          <span className="text-lime-400 font-mono tracking-wider">{product.category}</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{product.rating}</span>
            <span className="text-zinc-500">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Product Title */}
        <h4
          onClick={() => setQuickViewProduct(product)}
          className="text-xs sm:text-sm font-bold text-white hover:text-lime-400 transition-colors line-clamp-1 cursor-pointer leading-snug"
        >
          {product.name}
        </h4>

        {/* Tagline / Subtitle */}
        <p className="text-[11px] text-zinc-400 line-clamp-1">{product.tagline}</p>

        {/* Color Swatch Selector & Price Row */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
          {/* Swatches */}
          <div className="flex items-center gap-1.5">
            {product.colors.map((color, cIdx) => (
              <button
                key={cIdx}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColorIdx(cIdx);
                }}
                className={`w-4 h-4 rounded-full border transition-all ${
                  selectedColorIdx === cIdx
                    ? 'ring-2 ring-lime-400 ring-offset-2 ring-offset-zinc-900 scale-110 border-white'
                    : 'border-zinc-700 opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-sm sm:text-base font-black text-white">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[11px] text-zinc-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
