import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Zap, ShieldCheck } from 'lucide-react';

export const LaptopWorkerCard = ({ onUpgradeClick }) => {
  const [activeSignal, setActiveSignal] = useState(0);

  const signals = [
    'Scanning public sources...',
    'Verified domain ✓',
    'Analyzing 6D Match: 96%',
    'Ingesting live deadlines...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSignal((prev) => (prev + 1) % signals.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-slate-800/80 via-slate-850 to-webbble-darker border border-slate-700/60 p-4 text-center overflow-hidden shadow-lg group">
      {/* Ambient background glow */}
      <div className="absolute -top-10 -left-10 w-28 h-28 bg-lagune-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-nectarine-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Floating live intelligence pill */}
      <div className="relative z-10 flex justify-center mb-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-[10px] font-mono text-menthe-400 shadow-sm animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-menthe-400 animate-ping" />
          <span className="truncate max-w-[130px]">{signals[activeSignal]}</span>
        </div>
      </div>

      {/* Continuously Animated Laptop Worker Character */}
      <div className="relative w-full h-36 flex items-center justify-center my-1 select-none">
        {/* Soft laptop screen glow projecting outward */}
        <div className="absolute w-24 h-16 bg-gradient-to-t from-lagune-400/40 via-menthe-400/20 to-transparent rounded-full blur-xl animate-screen-glow" />

        {/* Character Illustration with continuous breathing motion */}
        <div className="relative z-10 w-32 h-32 animate-gentle-breathe">
          <img
            src="/laptop-worker.png"
            alt="AI Agent working on laptop"
            className="w-full h-full object-contain filter drop-shadow-md"
          />

          {/* Typing hands micro-animation overlay positioned over keyboard */}
          <div className="absolute bottom-[28%] left-[45%] w-10 h-4 pointer-events-none">
            <div className="w-full h-full flex items-center justify-between opacity-80 animate-typing-hands">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900/60 shadow-sm" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900/60 shadow-sm -mt-1" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900/60 shadow-sm" />
            </div>
          </div>

          {/* Continuous floating discovery data particles */}
          <div className="absolute -top-1 right-2 pointer-events-none animate-particle-float">
            <span className="px-1.5 py-0.5 rounded bg-menthe-500/90 text-white text-[9px] font-bold shadow">
              ✓ MLH
            </span>
          </div>
          <div className="absolute top-6 left-0 pointer-events-none animate-particle-float [animation-delay:1.5s]">
            <span className="px-1.5 py-0.5 rounded bg-peche-500/90 text-white text-[9px] font-bold shadow">
              98%
            </span>
          </div>
        </div>
      </div>

      {/* Copy / Text - Exactly inspired by Reference 2 */}
      <div className="relative z-10 space-y-1 mb-3">
        <h4 className="text-xs font-bold text-white tracking-tight flex items-center justify-center gap-1.5">
          <span>Get Upgrade</span>
          <Sparkles className="w-3 h-3 text-peche-400" />
        </h4>
        <p className="text-[11px] text-slate-400 leading-snug px-1">
          Step to the next level, with more features & autonomous agent discovery
        </p>
      </div>

      {/* Purple / Lagune Pill Button from Image 2 */}
      <div className="relative z-10">
        <button
          onClick={onUpgradeClick}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-1.5 group-hover:shadow-indigo-500/40"
        >
          <span>Learn more</span>
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
