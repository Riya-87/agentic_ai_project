import React from 'react';
import { 
  Instagram, 
  Twitter, 
  Youtube, 
  ArrowUpRight, 
  Globe, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Sparkles
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { CURRENCIES } from '../../data/products';

export const Footer = () => {
  const { currency, setCurrency } = useShop();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-neutral-800 pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Props Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-neutral-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-lime-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-white">Free Express Shipping</p>
              <p className="text-[11px] text-neutral-400">On all orders over $75</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-lime-400 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-white">30-Day Easy Returns</p>
              <p className="text-[11px] text-neutral-400">Hassle-free exchanges</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-lime-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-white">100% Carbon Neutral</p>
              <p className="text-[11px] text-neutral-400">Eco-conscious packaging</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-lime-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-white">Secure Payments</p>
              <p className="text-[11px] text-neutral-400">Encrypted 256-bit SSL</p>
            </div>
          </div>
        </div>

        {/* Main Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 py-14">
          {/* Brand Manifesto */}
          <div className="col-span-2 md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter uppercase text-white font-mono">
                COLLUSION<span className="text-lime-400">®</span>
              </span>
              <span className="text-[9px] bg-lime-400/10 text-lime-400 border border-lime-400/30 font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                FW26 Ready
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed pr-6">
              A radical collaborative streetwear ecosystem designed for a new generation. Unconstrained by gender boundaries, constructed with architectural precision, and committed to circular, conscious fashion.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-lime-400 hover:border-lime-400/40 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-lime-400 hover:border-lime-400/40 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-lime-400 hover:border-lime-400/40 transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-white">Collections</p>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button onClick={() => scrollToSection('catalog-section')} className="hover:text-lime-400 transition-colors">
                  Cyberpunk FW26
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('catalog-section')} className="hover:text-lime-400 transition-colors">
                  Heavyweight Hoodies
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('catalog-section')} className="hover:text-lime-400 transition-colors">
                  Modular Cargo Pants
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('catalog-section')} className="hover:text-lime-400 transition-colors">
                  Distressed Denim
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('shop-the-look')} className="hover:text-lime-400 transition-colors">
                  Lookbook Hotspots
                </button>
              </li>
            </ul>
          </div>

          {/* Experience */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-white">Experience</p>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button onClick={() => scrollToSection('outfit-builder')} className="hover:text-lime-400 transition-colors flex items-center gap-1">
                  Vibe Quiz <ArrowUpRight className="w-3 h-3 text-lime-400" />
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('shop-the-look')} className="hover:text-lime-400 transition-colors">
                  Shop the Look (Pins)
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('newsletter')} className="hover:text-lime-400 transition-colors">
                  VIP Drop Access
                </button>
              </li>
              <li>
                <span className="hover:text-lime-400 transition-colors cursor-pointer">
                  Sustainability Ledger
                </span>
              </li>
              <li>
                <span className="hover:text-lime-400 transition-colors cursor-pointer">
                  Archive Sale
                </span>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-white">Assistance</p>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li className="hover:text-lime-400 transition-colors cursor-pointer">Track My Order</li>
              <li className="hover:text-lime-400 transition-colors cursor-pointer">Size & Fit Guide</li>
              <li className="hover:text-lime-400 transition-colors cursor-pointer">Shipping & Customs</li>
              <li className="hover:text-lime-400 transition-colors cursor-pointer">Returns & Exchanges</li>
              <li className="hover:text-lime-400 transition-colors cursor-pointer">Contact Concierge</li>
            </ul>
          </div>

          {/* Legal / Currency */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-white">Region & Currency</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Globe className="w-3.5 h-3.5 text-lime-400" />
                <span>Global Shipping (EN)</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {Object.keys(CURRENCIES).map((code) => (
                  <button
                    key={code}
                    onClick={() => setCurrency(code)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                      currency === code
                        ? 'bg-lime-400 text-black border-lime-400 shadow-sm'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {code} ({CURRENCIES[code].symbol})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Giant Monolithic Watermark Typography */}
        <div className="pt-8 pb-4 select-none overflow-hidden text-center opacity-10 pointer-events-none">
          <p className="text-[12vw] font-black uppercase tracking-tighter leading-none font-mono text-white whitespace-nowrap">
            COLLUSION 2026
          </p>
        </div>

        {/* Bottom Sub-footer */}
        <div className="pt-6 border-t border-neutral-900 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500 font-mono">
          <div className="flex items-center gap-1.5">
            <span>© 2026 COLLUSION STUDIOS PLC. ALL RIGHTS RESERVED.</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-neutral-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-neutral-300 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-neutral-300 transition-colors cursor-pointer">Cookie Settings</span>
            <span className="hover:text-neutral-300 transition-colors cursor-pointer">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
