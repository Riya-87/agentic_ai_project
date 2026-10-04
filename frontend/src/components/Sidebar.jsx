import React from 'react';
import {
  LayoutDashboard,
  Radar,
  Compass,
  Clock,
  Sparkles,
  Bookmark,
  Activity,
  History,
  Layers,
  Settings
} from 'lucide-react';
import { AnimatedLaptopWorker } from './AnimatedLaptopWorker';

export const Sidebar = ({ activeTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'radar', label: 'Company Radar', icon: <Radar className="w-4 h-4 text-lagune-400" />, badge: 'LIVE' },
    { id: 'opportunities', label: 'Explore Domain', icon: <Compass className="w-4 h-4" /> },
    { id: 'deadlines', label: 'Deadlines', icon: <Clock className="w-4 h-4" /> },
    { id: 'copilot', label: 'AI Copilot', icon: <Sparkles className="w-4 h-4 text-nectarine-400" /> },
    { id: 'saved', label: 'Saved Tracker', icon: <Bookmark className="w-4 h-4" /> },
    { id: 'settings', label: 'Agent Room', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-webbble-dark border-r border-webbble-border flex flex-col justify-between p-4 flex-shrink-0 min-h-screen text-slate-300 select-none shadow-2xl">
      <div className="space-y-6">
        {/* Brand Header: Webbble from Dribbble Reference */}
        <div className="flex items-center gap-3 px-3 py-3 border-b border-webbble-border/60">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-lagune-600 via-lagune-500 to-menthe-400 flex items-center justify-center text-white shadow-md shadow-lagune-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>Webbble</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              Academic Intelligence
            </p>
          </div>
        </div>

        {/* Navigation List - Sharon Ahmed Active State with White Dot */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-webbble-card text-white shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-white hover:bg-webbble-hover/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-lagune-500/20 text-lagune-400 font-extrabold border border-lagune-500/30">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* White Dot Indicator on Selected Item */}
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Redesigned Animated Vector Person (Image 2) */}
      <div className="pt-4">
        <AnimatedLaptopWorker onUpgradeClick={() => onSelectTab('copilot')} />
      </div>
    </aside>
  );
};
