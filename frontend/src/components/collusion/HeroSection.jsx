import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Flame, ShieldCheck, Play, ArrowDown, Compass } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

const HERO_SLIDES = [
  {
    tag: 'NEW SEASON / SS26 DROP',
    title: 'UNFILTERED STREETWEAR',
    subtitle: 'Oversized heavyweights, liquid vinyl outerwear, and modular tactical silhouettes.',
    badge: 'EXCLUSIVE ONLINE RELEASE',
    bgImage: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1920&q=85',
  },
  {
    tag: 'EDITORIAL COLLECTION',
    title: 'CYBER-METRIC ACID',
    subtitle: '480 GSM organic french terry & Japanese selvedge denim designed for all genders.',
    badge: '100% ANIMAL FREE',
    bgImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=85',
  },
  {
    tag: 'LOOKBOOK SPOTLIGHT',
    title: 'MODULAR CARGO CULTURE',
    subtitle: 'Engineered utility garments constructed with Cordura ripstop and waterproof YKK zips.',
    badge: 'SUSTAINABLY CRAFTED',
    bgImage: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1920&q=85',
  },
];

export const HeroSection = ({ onShopClick, onLookbookClick, onQuizClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="relative w-full min-h-[92vh] sm:min-h-screen flex flex-col justify-between overflow-hidden bg-black text-white pt-24">
      {/* Background Image Slides with Parallax Zoom */}
      {HERO_SLIDES.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-80 scale-105' : 'opacity-0 scale-100'
          }`}
          style={{
            backgroundImage: `url(${s.bgImage})`,
            backgroundPosition: 'center 20%',
            backgroundSize: 'cover',
            transitionProperty: 'opacity, transform',
            transitionDuration: '1.2s',
          }}
        />
      ))}

      {/* High-fashion Vignette & Mesh Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none" />

      {/* Main Hero Typography & CTAs */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto w-full py-12">
        <div className="max-w-3xl space-y-6">
          {/* Top Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-lime-400 text-xs font-black tracking-widest uppercase animate-in fade-in slide-in-from-bottom-2 duration-700">
            <Sparkles className="w-3.5 h-3.5 text-lime-400 animate-pulse" />
            <span>{slide.tag}</span>
            <span className="w-1 h-1 rounded-full bg-lime-400" />
            <span className="text-white text-[10px] font-bold">{slide.badge}</span>
          </div>

          {/* Giant Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none font-mono text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-400 drop-shadow-2xl">
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-zinc-300 max-w-xl font-medium leading-relaxed drop-shadow">
            {slide.subtitle}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={onShopClick}
              className="px-8 py-4 rounded-full bg-lime-400 hover:bg-lime-300 text-black text-xs sm:text-sm font-black tracking-wider uppercase transition-all shadow-xl shadow-lime-400/25 flex items-center gap-2 group active:scale-95"
            >
              <span>SHOP THE DROP</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onLookbookClick}
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-black tracking-wider uppercase transition-all flex items-center gap-2 active:scale-95"
            >
              <Compass className="w-4 h-4 text-lime-400" />
              <span>SHOP THE LOOK</span>
            </button>

            <button
              onClick={onQuizClick}
              className="px-6 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs sm:text-sm font-black tracking-wider uppercase transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95"
            >
              <Flame className="w-4 h-4" />
              <span>VIBE QUIZ (-15%)</span>
            </button>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex items-center gap-2 pt-10">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentSlide ? 'w-10 bg-lime-400' : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Infinite Marquee Ticker Bar */}
      <div className="relative z-10 w-full bg-lime-400 text-black py-3 overflow-hidden font-mono font-black text-xs sm:text-sm tracking-widest select-none shadow-2xl">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="flex items-center gap-8 mx-4">
              <span>FREE WORLDWIDE SHIPPING OVER $75</span>
              <span>✦</span>
              <span>100% ANIMAL-FREE & VEGAN</span>
              <span>✦</span>
              <span>SUSTAINABLY SOURCED ORGANIC COTTON</span>
              <span>✦</span>
              <span>INCLUSIVE UNISEX FIT</span>
              <span>✦</span>
              <span>NEW DROPS EVERY THURSDAY</span>
              <span>✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
