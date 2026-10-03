import React from 'react';
import {
  LayoutDashboard,
  BarChart2,
  Globe2,
  Compass,
  Code2,
  Server,
  Activity,
  History,
  Layers,
  Sparkles
} from 'lucide-react';
import { AnimatedLaptopWorker } from './AnimatedLaptopWorker';

export const Sidebar = ({ activeTab, onSelectTab }) => {
  // Navigation items matching Sharon Ahmed's Webbble shot
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'sites', label: 'Sites', icon: <Globe2 className="w-4 h-4" /> },
    { id: 'opportunities', label: 'Explore Domain', icon: <Compass className="w-4 h-4" />, isPrimary: true },
    { id: 'builder', label: 'Website Builder', icon: <Code2 className="w-4 h-4" /> },
    { id: 'services', label: 'Manage Service', icon: <Server className="w-4 h-4" /> },
    { id: 'monitoring', label: 'Monitoring', icon: <Activity className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity Log', icon: <History className="w-4 h-4" /> },
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
            const isActive = activeTab === item.id || (item.isPrimary && (activeTab === 'opportunities' || activeTab === 'dashboard'));
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id === 'opportunities' || item.id === 'dashboard' ? item.id : 'opportunities')}
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
