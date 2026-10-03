import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AgentProvider, useAgent } from './context/AgentContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { DashboardPage } from './pages/DashboardPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { DeadlinesPage } from './pages/DeadlinesPage';
import { CopilotPage } from './pages/CopilotPage';
import { SavedPage } from './pages/SavedPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AgentRoomPage } from './pages/AgentRoomPage';
import { AuthModal } from './pages/AuthModal';
import { api } from './services/api';

const AppContent = () => {
  const { authModalOpen, setAuthModalOpen } = useAuth();
  const { toast, showToast } = useAgent();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState('');

  const handleOpenDetail = (item) => {
    setSelectedOpportunity(item);
    setModalOpen(true);
  };

  const handleNavigate = (tabId, params = {}) => {
    setActiveTab(tabId);
    if (params.initialPrompt) {
      setCopilotInitialPrompt(params.initialPrompt);
    }
  };

  const handleSaveOpportunity = async (oppId, status = 'saved', notes = '') => {
    try {
      await api.saveOpportunity(oppId, status, notes);
      showToast(`Application marked as ${status}!`, 'success');
      if (selectedOpportunity && selectedOpportunity.opportunity.id === oppId) {
        setSelectedOpportunity((prev) => ({
          ...prev,
          is_saved: true,
          saved_status: status,
        }));
      }
    } catch (e) {
      showToast('Error updating status', 'error');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-canvas-cream dark:bg-webbble-darker text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar navigation */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar activeTab={activeTab} onSelectTab={(tab) => handleNavigate(tab)} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar
          onOpenControlRoom={() => handleNavigate('settings')}
          onOpenCopilot={() => handleNavigate('copilot')}
          onNavigate={(tab) => handleNavigate(tab)}
        />

        {/* Mobile Tab Bar Header */}
        <div className="flex md:hidden items-center gap-1.5 p-2 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'opportunities', label: 'Discover' },
            { id: 'deadlines', label: 'Deadlines' },
            { id: 'copilot', label: 'Copilot' },
            { id: 'saved', label: 'Saved' },
            { id: 'profile', label: 'Profile' },
            { id: 'settings', label: 'Settings' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => handleNavigate(t.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === t.id
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigate={(tab, params) => handleNavigate(tab, params)}
              onOpenDetail={handleOpenDetail}
            />
          )}

          {activeTab === 'opportunities' && (
            <OpportunitiesPage onOpenDetail={handleOpenDetail} />
          )}

          {activeTab === 'deadlines' && (
            <DeadlinesPage onOpenDetail={handleOpenDetail} />
          )}

          {activeTab === 'copilot' && (
            <CopilotPage
              initialPrompt={copilotInitialPrompt}
              onOpenDetail={handleOpenDetail}
            />
          )}

          {activeTab === 'saved' && (
            <SavedPage onOpenDetail={handleOpenDetail} />
          )}

          {activeTab === 'profile' && <ProfilePage />}

          {activeTab === 'settings' && <SettingsPage />}

          {activeTab === 'agents' && <SettingsPage />}
        </main>
      </div>

      {/* Global Modals & Toasts */}
      <OpportunityDetailModal
        item={selectedOpportunity}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveOpportunity}
        onUpdateStatus={handleSaveOpportunity}
      />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <Toast toast={toast} onClose={() => {}} />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AgentProvider>
          <AppContent />
        </AgentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
