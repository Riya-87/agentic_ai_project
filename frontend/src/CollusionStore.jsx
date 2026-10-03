import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Navbar } from './components/collusion/Navbar';
import { HeroSection } from './components/collusion/HeroSection';
import { CategoryBar } from './components/collusion/CategoryBar';
import { ShopTheLook } from './components/collusion/ShopTheLook';
import { ProductGrid } from './components/collusion/ProductGrid';
import { OutfitBuilder } from './components/collusion/OutfitBuilder';
import { Newsletter } from './components/collusion/Newsletter';
import { Footer } from './components/collusion/Footer';
import { CartDrawer } from './components/collusion/CartDrawer';
import { WishlistDrawer } from './components/collusion/WishlistDrawer';
import { ProductDetailModal } from './components/collusion/ProductDetailModal';
import { CheckoutModal } from './components/collusion/CheckoutModal';
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react';

function ToastContainer() {
  const { toast } = useShop();

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <div
        className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all animate-in slide-in-from-bottom-5 duration-300 ${
          toast.type === 'success'
            ? 'bg-neutral-900/95 border-lime-400/40 text-neutral-100 shadow-lime-950/20'
            : toast.type === 'error'
            ? 'bg-neutral-900/95 border-rose-500/40 text-neutral-100 shadow-rose-950/20'
            : 'bg-neutral-900/95 border-neutral-700/60 text-neutral-100'
        }`}
      >
        <div className="flex items-center gap-3">
          {toast.type === 'success' && (
            <div className="w-8 h-8 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          {toast.type === 'error' && (
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          {toast.type === 'info' && (
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5" />
            </div>
          )}
          <div>
            <p className="text-xs font-bold font-mono uppercase tracking-wider text-lime-400">
              COLLUSION NOTIFICATION
            </p>
            <p className="text-xs text-neutral-200 mt-0.5">{toast.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CollusionStoreContent({ onSwitchToAcademic }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-lime-400 selection:text-black font-sans relative">
      {/* Top Experience Switch Banner */}
      {onSwitchToAcademic && (
        <div className="bg-neutral-900/90 backdrop-blur border-b border-neutral-800 text-xs py-1.5 px-4 text-center text-neutral-400 flex items-center justify-between z-50 relative">
          <div className="flex items-center gap-2 text-lime-400 font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>COLLUSION • HIGH-FASHION STREETWEAR ECOSYSTEM</span>
          </div>
          <button
            onClick={onSwitchToAcademic}
            className="text-neutral-300 hover:text-white underline underline-offset-2 font-medium transition-colors text-xs"
          >
            Academic Agent Platform →
          </button>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        onNavigateSection={(sec) => {
          if (sec === 'lookbook') scrollTo('shop-the-look');
          else if (sec === 'outfit-builder') scrollTo('outfit-builder');
          else scrollTo('catalog-section');
        }}
      />

      {/* Main Streetwear Showcase Flow */}
      <main>
        {/* 1. Hero Editorial Lookbook Slider */}
        <HeroSection
          onShopClick={() => scrollTo('catalog-section')}
          onLookbookClick={() => scrollTo('shop-the-look')}
          onQuizClick={() => scrollTo('outfit-builder')}
        />

        {/* 2. Interactive Category Browser */}
        <CategoryBar
          onSelectCategory={() => scrollTo('catalog-section')}
        />

        {/* 3. Shop The Look: Editorial Hotspot Pins */}
        <div id="shop-the-look">
          <ShopTheLook />
        </div>

        {/* 4. Complete Catalog & Live Filter System */}
        <div id="catalog-section">
          <ProductGrid />
        </div>

        {/* 5. Vibe Quiz & Outfit Bundle Builder */}
        <div id="outfit-builder">
          <OutfitBuilder />
        </div>

        {/* 6. VIP Drop Newsletter & Instant Discount */}
        <div id="newsletter">
          <Newsletter />
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Interactive Overlays */}
      <CartDrawer />
      <WishlistDrawer />
      <ProductDetailModal />
      <CheckoutModal />
      <ToastContainer />
    </div>
  );
}

export default function CollusionStore({ onSwitchToAcademic }) {
  return (
    <ShopProvider>
      <CollusionStoreContent onSwitchToAcademic={onSwitchToAcademic} />
    </ShopProvider>
  );
}
