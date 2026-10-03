import React, { useState } from 'react';
import {
  SlidersHorizontal,
  LayoutGrid,
  Grid2X2,
  X,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  Flame,
  Check
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from './ProductCard';
import { PRODUCTS, CATEGORIES, FITS, GENDERS } from '../../data/products';

export const ProductGrid = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedGender,
    setSelectedGender,
    selectedFit,
    setSelectedFit,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    viewCols,
    setViewCols,
    formatPrice,
  } = useShop();

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [ecoOnly, setEcoOnly] = useState(false);

  // Filter Products
  const filteredProducts = PRODUCTS.filter((product) => {
    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchCat = product.category.toLowerCase().includes(q);
      const matchTag = product.tagline.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchTag) return false;
    }

    // Category
    if (selectedCategory !== 'All' && product.category !== selectedCategory) {
      return false;
    }

    // Gender
    if (selectedGender !== 'All' && product.gender !== selectedGender && product.gender !== 'Unisex') {
      return false;
    }

    // Fit
    if (selectedFit !== 'All Fits' && product.fit !== selectedFit) {
      return false;
    }

    // Price Range
    if (product.price > priceRange) {
      return false;
    }

    // Eco Only
    if (ecoOnly && !product.isEco) {
      return false;
    }

    return true;
  });

  // Sort Products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // 'featured'
  });

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedGender('All');
    setSelectedFit('All Fits');
    setPriceRange(200);
    setEcoOnly(false);
    setSortBy('featured');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'All' ||
    selectedGender !== 'All' ||
    selectedFit !== 'All Fits' ||
    priceRange < 200 ||
    ecoOnly;

  return (
    <section id="catalog-section" className="py-16 bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Catalog Header & View Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight font-mono flex items-center gap-3">
              <span>ALL STREETWEAR DROPS</span>
              <span className="px-2.5 py-0.5 rounded-full bg-lime-400/10 text-lime-400 text-xs font-bold border border-lime-400/20 font-sans">
                {sortedProducts.length} Items
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Curated luxury oversized silhouettes, liquid coatings, and modular ripstop garments
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                isFilterPanelOpen || hasActiveFilters
                  ? 'bg-lime-400 text-black border-lime-400 shadow-md shadow-lime-400/20'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>FILTERS</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-black" />
              )}
            </button>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 focus:outline-none focus:border-lime-400"
            >
              <option value="featured">Sort: Featured Drops</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Customer Rating</option>
            </select>

            {/* Grid Column Layout Switcher */}
            <div className="hidden sm:flex items-center rounded-xl bg-zinc-900 p-1 border border-zinc-800">
              <button
                onClick={() => setViewCols(2)}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewCols === 2 ? 'bg-lime-400 text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="2-Column Editorial Grid"
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewCols(4)}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewCols === 4 ? 'bg-lime-400 text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="4-Column Compact Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-black shadow-md shadow-white/10'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Expandable Filter Matrix Drawer */}
        {isFilterPanelOpen && (
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
              {/* Gender Filter */}
              <div className="space-y-2">
                <span className="font-bold uppercase tracking-wider text-zinc-400">Gender / Fit</span>
                <div className="flex flex-wrap gap-1.5">
                  {GENDERS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGender(g)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                        selectedGender === g
                          ? 'bg-lime-400 text-black'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Silhouette Fit */}
              <div className="space-y-2">
                <span className="font-bold uppercase tracking-wider text-zinc-400">Silhouette Proportion</span>
                <div className="flex flex-wrap gap-1.5">
                  {FITS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFit(f)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                        selectedFit === f
                          ? 'bg-lime-400 text-black'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span className="uppercase tracking-wider text-zinc-400">Max Price</span>
                  <span className="text-lime-400 font-mono">{formatPrice(priceRange)}</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="200"
                  step="5"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-lime-400 cursor-pointer"
                />
              </div>

              {/* Eco Friendly Toggle */}
              <div className="space-y-2 flex flex-col justify-end">
                <label className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={ecoOnly}
                    onChange={(e) => setEcoOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-lime-400 focus:ring-lime-400 bg-zinc-900 border-zinc-700"
                  />
                  <div>
                    <p className="font-bold text-white text-xs">🌱 Eco-Organic Only</p>
                    <p className="text-[10px] text-zinc-400">100% GOTS Organic / Vegan</p>
                  </div>
                </label>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800 text-xs">
                <span className="text-zinc-400">
                  Showing {sortedProducts.length} filtered drops
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Product Cards Grid */}
        {sortedProducts.length > 0 ? (
          <div
            className={`grid gap-4 sm:gap-6 ${
              viewCols === 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            }`}
          >
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-16 rounded-3xl bg-zinc-900/60 border border-zinc-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No products found</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                No streetwear pieces match your active filter criteria. Try adjusting your filters or price slider.
              </p>
            </div>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2.5 rounded-full bg-lime-400 text-black font-black text-xs uppercase shadow-lg shadow-lime-400/20"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
