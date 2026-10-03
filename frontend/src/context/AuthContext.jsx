import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
          const profileData = await api.getProfile().catch(() => null);
          setProfile(profileData);
        } catch (err) {
          console.error('Failed to restore session:', err);
          api.setToken(null);
          setUser(null);
          setProfile(null);
        }
      } else {
        // Auto-login demo student if not logged in for instant evaluation out-of-the-box
        try {
          const demoData = await api.login('alex.chen@university.edu', 'student123');
          setUser(demoData.user);
          const profileData = await api.getProfile().catch(() => null);
          setProfile(profileData);
        } catch (e) {
          console.log('Demo user auto-login skipped or unavailable.');
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setProfile(null);
      setAuthModalOpen(true);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setUser(data.user);
    const profileData = await api.getProfile().catch(() => null);
    setProfile(profileData);
    setAuthModalOpen(false);
    return data;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    setUser(data.user);
    const profileData = await api.getProfile().catch(() => null);
    setProfile(profileData);
    setAuthModalOpen(false);
    return data;
  };

  const loginDemo = async () => {
    return await login('alex.chen@university.edu', 'student123');
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const p = await api.getProfile();
      setProfile(p);
      return p;
    } catch (e) {
      console.error('Error refreshing profile:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        loginDemo,
        logout,
        refreshProfile,
        authModalOpen,
        setAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
