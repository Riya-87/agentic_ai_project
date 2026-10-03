import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const AgentContext = createContext(null);

export const AgentProvider = ({ children }) => {
  const { user } = useAuth();
  const [pipelineStatus, setPipelineStatus] = useState({
    status: 'idle',
    current_agent: null,
    completed_steps: 6,
    total_steps: 6,
    logs: [],
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications(15);
      setNotifications(data);
      const countRes = await api.getUnreadCount();
      setUnreadCount(countRes.unread_count);
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  }, [user]);

  const markAllNotificationsRead = async () => {
    try {
      await api.markNotificationsRead(null, true);
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      showToast('All notifications marked as read', 'success');
    } catch (e) {
      console.error('Error marking notifications read:', e);
    }
  };

  const triggerPipeline = async (forceRefresh = false, customQuery = null) => {
    if (isRunning) return;
    setIsRunning(true);
    showToast('🚀 Orchestrator Agent launched multi-source web discovery & matching cycle...', 'info');

    try {
      setPipelineStatus((prev) => ({
        ...prev,
        status: 'running',
        current_agent: 'Information Collector Agent (Tavily Web Search)',
        completed_steps: 0,
      }));

      const result = await api.runAgentPipeline(forceRefresh, null, customQuery);
      setPipelineStatus(result);
      showToast('✨ Autonomous agents completed web discovery, deduplication, and student matching!', 'success');
      fetchNotifications();
      return result;
    } catch (e) {
      console.error('Error triggering agent pipeline:', e);
      showToast(`Agent Pipeline Error: ${e.message}`, 'error');
      setPipelineStatus((prev) => ({ ...prev, status: 'failed' }));
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  return (
    <AgentContext.Provider
      value={{
        pipelineStatus,
        isRunning,
        triggerPipeline,
        notifications,
        unreadCount,
        fetchNotifications,
        markAllNotificationsRead,
        toast,
        showToast,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
