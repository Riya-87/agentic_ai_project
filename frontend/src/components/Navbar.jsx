import React, { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Search,
  User,
  LogOut,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAgent } from '../context/AgentContext';
import { AgentStatusBadge } from './AgentStatusBadge';

export const Navbar = ({ onOpenCopilot, onNavigate }) => {
  const { user, logout, setAuthModalOpen } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAllNotificationsRead } = useAgent();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-canvas-border dark:border-webbble-border bg-white/95 dark:bg-webbble-dark/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Page Title from Dribbble Reference */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 md:hidden">
          <div className="w-8 h-8 rounded-xl bg-lagune-600 flex items-center justify-center text-white shadow-sm">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Explore Domain
          </h2>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Discover verified scholarships, internships & hackathons
          </p>
        </div>
      </div>

      {/* Right Controls - Sharon Ahmed Shot Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Single Primary Action Button */}
        <AgentStatusBadge />

        {/* Search Icon Trigger */}
        <button
          onClick={onOpenCopilot}
          className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-webbble-card transition-all btn-tactile"
          title="Search Opportunities"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notification Bell with Badge */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              if (unreadCount > 0) markAllNotificationsRead();
            }}
            className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-webbble-card transition-all relative btn-tactile"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-nectarine-500 ring-2 ring-white dark:ring-webbble-dark" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-webbble-dark border border-slate-200 dark:border-webbble-border shadow-xl p-4 space-y-3 z-50 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-webbble-border pb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
                <span className="text-[10px] text-slate-400">Live web updates</span>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 text-xs no-scrollbar">
                {notifications && notifications.length > 0 ? (
                  notifications.map((n, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-webbble-card border border-slate-100 dark:border-webbble-border">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{n.title || n.message}</p>
                      <span className="text-[10px] text-slate-400">{n.time || 'Just now'}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-slate-400 text-xs">No new notifications</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-webbble-card transition-all btn-tactile"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-peche-400" /> : <Moon className="w-4 h-4 text-lagune-600" />}
        </button>

        {/* User Profile Avatar from Dribbble Reference */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-lagune-500/30 transition-all btn-tactile"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-nectarine-400 to-peche-400 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-webbble-dark border border-slate-200 dark:border-webbble-border shadow-xl p-2 z-50 animate-fade-in text-xs">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-webbble-border">
                <p className="font-bold text-slate-900 dark:text-white truncate">{user?.full_name || 'Student'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'student@university.edu'}</p>
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  onNavigate('profile');
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-webbble-card text-slate-700 dark:text-slate-300 font-medium"
              >
                Profile & Skills
              </button>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  onNavigate('settings');
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-webbble-card text-slate-700 dark:text-slate-300 font-medium"
              >
                Settings
              </button>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 font-semibold"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
