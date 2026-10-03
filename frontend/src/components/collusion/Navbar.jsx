import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  X,
  Menu,
  Sparkles,
  ChevronDown,
  Globe,
  SlidersHorizontal,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { PRODUCTS, CURRENCIES } from '../../data/products';

export const Navbar = ({ onNavigateSection }) => {
  const {
    currency,
    setCurrency,
    cartItemsCount,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    setQuickViewProduct,
    formatPrice,
  } = useShop();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Live search suggestions
  const searchResults = searchQuery.trim()
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tagline.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const navLinks = [
    { label: 'NEW IN', category: 'All', badge: 'SS26' },
    { label: 'UNISEX', category: 'All', gender: 'Unisex' },
    { label: 'HOODIES', category: 'Hoodies & Sweats' },
    { label: 'CARGO', category: 'Cargo & Trousers' },
    { label: 'OUTERWEAR', category: 'Jackets & Outerwear' },
    { label: 'SHOP THE LOOK', action: 'lookbook', highlight: true },
    { label: 'VIBE QUIZ', action: 'outfit-builder', highlight: true },
  ];

  const handleNavClick = (link) => {
    if (link.action === 'lookbook') {
      onNavigateSection?.('lookbook');
    } else if (link.action === 'outfit-builder') {
      onNavigateSection?.('outfit-builder');
    } else {
      setSelectedCategory(link.category);
      onNavigateSection?.('catalog');
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-black/90 backdrop-blur-md border-b border-white/10 shadow-2xl py-3.5'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-white hover:text-lime-400 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-2xl sm:text-3xl font-black tracking-tighter text-white hover:text-lime-400 transition-colors uppercase font-mono group flex items-center gap-1.5"
            >
              <span>COLLUSION</span>
              <span className="w-2 h-2 rounded-full bg-lime-400 group-hover:scale-150 transition-transform" />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-black tracking-widest text-zinc-300">
            {navLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={() => handleNavClick(link)}
                className={`relative py-1 hover:text-white transition-colors uppercase flex items-center gap-1.5 group ${
                  link.highlight ? 'text-lime-400 hover:text-lime-300 font-extrabold' : ''
                }`}
              >
                {link.highlight && <Sparkles className="w-3 h-3 text-lime-400 animate-pulse" />}
                <span>{link.label}</span>
                {link.badge && (
                  <span className="px-1.5 py-0.2 rounded bg-lime-400 text-black text-[9px] font-black tracking-normal">
                    {link.badge}
                  </span>
                )}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-lime-400 group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Currency Selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-lime-400" />
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {isCurrencyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95">
                  {Object.keys(CURRENCIES).map((currKey) => (
                    <button
                      key={currKey}
                      onClick={() => {
                        setCurrency(currKey);
                        setIsCurrencyDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition-colors flex items-center justify-between ${
                        currency === currKey
                          ? 'bg-lime-400 text-black'
                          : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{CURRENCIES[currKey].label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-lime-400 transition-all group"
              title="Search Catalog"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist Trigger */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-rose-400 transition-all"
              title="View Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-lime-400 hover:bg-lime-300 text-black font-black text-xs transition-all shadow-lg shadow-lime-400/20 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden md:inline">BAG</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black text-lime-400 text-[11px] font-black">
                {cartItemsCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Predictive Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="max-w-4xl w-full mx-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <span className="text-xs font-black tracking-widest text-lime-400 uppercase">
                SEARCH THE STREETWEAR DROP
              </span>
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-lime-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hoodies, tactical cargo, puffer jackets, tees..."
                className="w-full pl-14 pr-4 py-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-lg sm:text-xl font-bold text-white placeholder:text-zinc-500 focus:outline-none focus:border-lime-400 transition-all"
              />
            </div>

            {/* Quick Keyword Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-zinc-500 font-bold uppercase">Trending:</span>
              {['Oversized Hoodie', 'Tactical Cargo', 'Vinyl Puffer', 'Acid Wash', 'Lug-Sole Boots'].map(
                (term, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSearchQuery(term)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-lime-400 border border-zinc-800 transition-colors font-semibold"
                  >
                    {term}
                  </button>
                )
              )}
            </div>

            {/* Live Predictive Results */}
            {searchQuery.trim() && (
              <div className="space-y-3 pt-4">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Matching Drops ({searchResults.length})
                </p>

                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          setQuickViewProduct(product);
                          setIsSearchOpen(false);
                        }}
                        className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-lime-400/60 flex items-center gap-4 cursor-pointer transition-all group"
                      >
                        <img
                          src={product.colors[0].images[0]}
                          alt={product.name}
                          className="w-16 h-20 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-lime-400 uppercase">
                            {product.category}
                          </span>
                          <h4 className="text-sm font-bold text-white group-hover:text-lime-400 truncate transition-colors">
                            {product.name}
                          </h4>
                          <p className="text-xs font-black text-zinc-200 mt-1">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-lime-400 transition-colors mr-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm">
                    No products found matching "{searchQuery}". Try browsing by category.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/95 backdrop-blur-2xl flex flex-col p-6 animate-in slide-in-from-left duration-300">
          <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
            <span className="text-2xl font-black text-white tracking-tighter">COLLUSION</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col gap-4 py-8 text-lg font-black tracking-wider text-zinc-200">
            {navLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={() => handleNavClick(link)}
                className="text-left py-2 hover:text-lime-400 transition-colors uppercase flex items-center justify-between"
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="px-2 py-0.5 rounded bg-lime-400 text-black text-xs font-black">
                    {link.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-zinc-800 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
              <span>Currency:</span>
              <div className="flex gap-2">
                {Object.keys(CURRENCIES).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`px-2.5 py-1 rounded-lg ${
                      currency === c ? 'bg-lime-400 text-black' : 'bg-zinc-900 text-zinc-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
