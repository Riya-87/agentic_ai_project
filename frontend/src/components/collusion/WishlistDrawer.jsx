import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const WishlistDrawer = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    toggleWishlist,
    addToCart,
    formatPrice,
  } = useShop();

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsWishlistOpen(false)}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
      />

      {/* Slide-over Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-800 text-white flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <h3 className="text-base font-black uppercase tracking-tight font-mono">
                YOUR SAVED DROPS ({wishlist.length})
              </h3>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Wishlist Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {wishlist.length > 0 ? (
              wishlist.map((product) => (
                <div
                  key={product.id}
                  className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex gap-3 items-center group hover:border-zinc-700 transition-all"
                >
                  <img
                    src={product.colors[0].images[0]}
                    alt={product.name}
                    className="w-18 h-22 rounded-xl object-cover bg-zinc-950"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[9px] font-black text-lime-400 uppercase">
                      {product.category}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate">{product.name}</h4>
                    <p className="text-xs font-black text-white font-mono">
                      {formatPrice(product.price)}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          addToCart(product, product.colors[0].name, product.sizes[0], 1);
                          toggleWishlist(product);
                        }}
                        className="px-3 py-1 rounded-lg bg-lime-400 hover:bg-lime-300 text-black font-black text-[10px] uppercase tracking-wider flex items-center gap-1 transition-colors"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Move to Bag</span>
                      </button>

                      <button
                        onClick={() => toggleWishlist(product)}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                        title="Remove"
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
                  <Heart className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Your wishlist is empty</h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                    Click the heart icon on any drop to save items for later.
                  </p>
                </div>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-lime-400 text-black font-black text-xs uppercase"
                >
                  Explore Drops
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
