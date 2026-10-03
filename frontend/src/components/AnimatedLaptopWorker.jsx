import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';

export const AnimatedLaptopWorker = ({ onUpgradeClick }) => {
  const [keystroke, setKeystroke] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setKeystroke((prev) => (prev + 1) % 4);
    }, 250);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative rounded-3xl bg-[#F4F3FF] dark:bg-webbble-card border border-indigo-100 dark:border-webbble-border p-4 text-center overflow-hidden shadow-lg select-none group">
      {/* Background Soft Blob matching Image 2 */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#E8E5FE] dark:bg-indigo-950/40 rounded-full blur-xl pointer-events-none" />

      {/* Pure Vector Animated Character Illustration (Redesigned from Image 2) */}
      <div className="relative w-full h-44 flex items-center justify-center">
        <svg
          viewBox="0 0 240 220"
          className="w-full h-full max-w-[200px] overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Animated Background Aura Blob */}
          <path
            d="M70 40C120 10 170 20 190 70C210 120 190 170 140 185C90 200 40 170 30 120C20 70 20 70 70 40Z"
            fill="#ECE9FE"
            className="dark:fill-indigo-950/60 transition-colors"
          />

          {/* Screen Light Cone / Pulsing Glow */}
          <polygon
            points="145,115 195,70 195,165 145,155"
            fill="url(#screenGlowGradient)"
            className="animate-pulse"
            opacity="0.65"
          />

          {/* --- LAPTOP --- */}
          {/* Laptop Base / Keyboard */}
          <path
            d="M100 155 L180 155 L165 170 L85 170 Z"
            fill="#1E1E24"
            stroke="#1E1E24"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Keyboard Keys Track & Illuminated keys */}
          <line x1="102" y1="160" x2="162" y2="160" stroke="#4A4A58" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="95" y1="164" x2="155" y2="164" stroke="#4A4A58" strokeWidth="2" strokeDasharray="3 2" />

          {/* Laptop Screen / Lid (Tilted view) */}
          <path
            d="M165 170 L185 85 L180 84 L160 168 Z"
            fill="#2D313A"
            stroke="#1E1E24"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Glowing Laptop Display */}
          <path
            d="M168 165 L184 89 L181 87 L165 163 Z"
            fill="#6398A9"
            opacity="0.8"
          />
          {/* Code lines streaming on laptop screen */}
          <line x1="169" y1="110" x2="178" y2="98" stroke="#96C7B3" strokeWidth="1.5" className="animate-pulse" />
          <line x1="167" y1="125" x2="175" y2="114" stroke="#FAF7F5" strokeWidth="1.5" />
          <line x1="165" y1="140" x2="173" y2="129" stroke="#F9B95C" strokeWidth="1.5" />

          {/* --- CHARACTER --- */}
          <g className="animate-gentle-breathe origin-bottom">
            {/* Body / Torso */}
            <path
              d="M55 210 L65 140 C70 120 125 120 135 140 L145 210 Z"
              fill="#FFFFFF"
              stroke="#1E1E24"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Crewneck Collar */}
            <path
              d="M90 128 C95 138 110 138 115 128"
              stroke="#1E1E24"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Neck */}
            <path
              d="M93 115 L93 130 C98 134 107 134 112 130 L112 115 Z"
              fill="#FFFFFF"
              stroke="#1E1E24"
              strokeWidth="2.5"
            />

            {/* Head & Face */}
            <g className="transition-transform duration-300">
              {/* Head outline */}
              <path
                d="M95 72 C95 55 110 55 118 72 C122 82 120 102 114 115 C102 118 96 112 95 105 Z"
                fill="#FFFFFF"
                stroke="#1E1E24"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Ear */}
              <path
                d="M94 88 C91 88 91 95 95 96"
                stroke="#1E1E24"
                strokeWidth="2"
                fill="#FFFFFF"
              />
              {/* Eye (Looking right toward laptop screen) */}
              <circle cx="112" cy="84" r="2" fill="#1E1E24" />
              {/* Eyebrow */}
              <path d="M109 78 C112 76 116 77 117 79" stroke="#1E1E24" strokeWidth="1.5" strokeLinecap="round" />
              {/* Nose */}
              <path d="M116 86 L119 91 L115 93" stroke="#1E1E24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              {/* Smile / Concentrated expression */}
              <path d="M112 99 C115 101 118 100 120 98" stroke="#1E1E24" strokeWidth="1.8" strokeLinecap="round" />

              {/* Curly Hair (Exact from Image 2) */}
              <path
                d="M95 72 C90 65 92 52 98 46 C105 40 115 38 122 45 C128 50 125 60 122 68 C118 64 110 65 105 68 C100 68 97 70 95 72 Z"
                fill="#1E1E24"
              />
              {/* Hair Curls Details */}
              <path d="M102 44 C104 38 112 36 116 42" stroke="#1E1E24" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M115 42 C120 38 126 44 124 50" stroke="#1E1E24" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* Left Arm (Resting on table / keyboard) */}
            <path
              d="M65 148 L95 180 L135 162"
              stroke="#1E1E24"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Left Sleeve */}
            <path d="M60 145 C65 158 75 162 82 155" stroke="#1E1E24" strokeWidth="2.5" />

            {/* Right Arm (Reaching to laptop keys) */}
            <path
              d="M125 142 L142 165 L158 158"
              stroke="#1E1E24"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Right Sleeve */}
            <path d="M125 142 C132 150 138 152 142 145" stroke="#1E1E24" strokeWidth="2.5" />

            {/* Hands with LIVE RHYTHMIC TYPING ANIMATION */}
            {/* Left Hand Fingers */}
            <g transform={keystroke % 2 === 0 ? "translate(0, -3)" : "translate(0, 1)"} className="transition-transform duration-100">
              <path
                d="M130 162 C135 159 142 161 144 163 C145 165 142 167 137 167 Z"
                fill="#FFFFFF"
                stroke="#1E1E24"
                strokeWidth="2"
              />
            </g>
            {/* Right Hand Fingers */}
            <g transform={keystroke % 2 !== 0 ? "translate(0, -3)" : "translate(0, 1)"} className="transition-transform duration-100">
              <path
                d="M152 158 C156 156 162 157 164 160 C164 162 160 164 155 163 Z"
                fill="#FFFFFF"
                stroke="#1E1E24"
                strokeWidth="2"
              />
            </g>
          </g>

          {/* Floating animated code / discovery tags */}
          <g className="animate-particle-float">
            <rect x="180" y="45" width="46" height="18" rx="9" fill="#D7897F" />
            <text x="203" y="57" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">AI Pro</text>
          </g>
          <g className="animate-particle-float [animation-delay:1.8s]">
            <rect x="20" y="80" width="48" height="18" rx="9" fill="#96C7B3" />
            <text x="44" y="92" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">Active ✓</text>
          </g>

          {/* Gradient Definition */}
          <defs>
            <linearGradient id="screenGlowGradient" x1="180" y1="120" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6398A9" stopOpacity="0.4" />
              <stop offset="1" stopColor="#6398A9" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Copy / Text - Exact from Image 2 */}
      <div className="relative z-10 space-y-1 my-2">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
          Get Upgrade
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug px-2">
          Step to the next level, with more features
        </p>
      </div>

      {/* Purple Pill Button matching Image 2 */}
      <div className="relative z-10 pt-2">
        <button
          onClick={onUpgradeClick}
          className="w-full py-2.5 px-4 rounded-2xl bg-[#5D5FEF] hover:bg-[#4E50E6] text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 group-hover:shadow-indigo-500/40 cursor-pointer"
        >
          <span>Learn more</span>
        </button>
      </div>
    </div>
  );
};
