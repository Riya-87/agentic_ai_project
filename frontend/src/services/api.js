const BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://127.0.0.1:8008/api/v1' : '/api/v1');

class ApiService {
  constructor() {
    this.token = localStorage.getItem('academic_auth_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('academic_auth_token', token);
    } else {
      localStorage.removeItem('academic_auth_token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('academic_auth_token');
  }

  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      if (response.status === 401) {
        // Token expired or invalid
        this.setToken(null);
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        throw new Error('Session expired. Please log in again.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth Endpoints
  async login(email, password) {
    const data = await this.request('/auth/login/json', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async getMe() {
    return await this.request('/auth/me');
  }

  // Student Profile
  async getProfile() {
    return await this.request('/profile/me');
  }

  async updateProfile(profileData) {
    return await this.request('/profile/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getProfileStrength() {
    return await this.request('/profile/strength');
  }

  // Opportunities
  async getOpportunities(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await this.request(`/opportunities${queryString}`);
  }

  async getOpportunity(id) {
    return await this.request(`/opportunities/${id}`);
  }

  async interpretSearch(query) {
    return await this.request('/opportunities/interpret-search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  // Matches & Recommendations
  async getTopMatches(limit = 6) {
    return await this.request(`/matches/top?limit=${limit}`);
  }


  async refreshMatches() {
    return await this.request('/matches/refresh', { method: 'POST' });
  }

  // Saved Opportunities
  async getSaved(status = null) {
    const qs = status ? `?status_filter=${status}` : '';
    return await this.request(`/saved${qs}`);
  }

  async saveOpportunity(opportunityId, status = 'saved', notes = '') {
    return await this.request('/saved', {
      method: 'POST',
      body: JSON.stringify({ opportunity_id: opportunityId, status, notes }),
    });
  }

  async updateSavedStatus(opportunityId, updateData) {
    return await this.request(`/saved/${opportunityId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async removeSaved(opportunityId) {
    return await this.request(`/saved/${opportunityId}`, { method: 'DELETE' });
  }

  // Deadlines
  async getDeadlines(savedOnly = false) {
    return await this.request(`/deadlines?saved_only=${savedOnly}`);
  }

  async getUrgencyMetrics() {
    return await this.request('/deadlines/metrics');
  }

  // Notifications
  async getNotifications(limit = 20) {
    return await this.request(`/notifications?limit=${limit}`);
  }

  async markNotificationsRead(notificationIds = null, markAll = false) {
    return await this.request('/notifications/read', {
      method: 'POST',
      body: JSON.stringify({ notification_ids: notificationIds, mark_all: markAll }),
    });
  }

  async getUnreadCount() {
    return await this.request('/notifications/unread-count');
  }

  // Agent Orchestrator Control Room
  async runAgentPipeline(forceRefresh = false, targetUserId = null, customQuery = null) {
    return await this.request('/agents/run', {
      method: 'POST',
      body: JSON.stringify({ 
        force_refresh: forceRefresh, 
        target_user_id: targetUserId,
        custom_query: customQuery
      }),
    });
  }

  async getPipelineStatus() {
    return await this.request('/agents/status');
  }

  async getLastSync() {
    return await this.request('/agents/last-sync');
  }

  async getAgentNodes() {
    return await this.request('/agents/nodes');
  }

  async getTrustedSources() {
    return await this.request('/agents/sources');
  }

  async addTrustedSource(sourceData) {
    return await this.request('/agents/sources', {
      method: 'POST',
      body: JSON.stringify(sourceData),
    });
  }

  // Grounded AI Assistant Copilot
  async sendAssistantMessage(message, history = []) {
    return await this.request('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  }

  // Analytics
  async getDashboardAnalytics() {
    return await this.request('/analytics/dashboard');
  }

  // Company Career Radar (LangGraph Autonomous Crawler)
  async crawlCompanyCareer(companyName, categoryFilter = 'All', studentProfile = null) {
    return await this.request('/opportunities/company-crawl', {
      method: 'POST',
      body: JSON.stringify({
        company_name: companyName,
        category_filter: categoryFilter,
        student_profile: studentProfile,
      }),
    });
  }

  // Conversational Opportunity Agent
  async agentChat(message, sessionId = null) {
    return await this.request('/agent/chat', {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId }),
    });
  }

  async agentCompare(opportunityIds) {
    return await this.request('/agent/compare', {
      method: 'POST',
      body: JSON.stringify({ opportunity_ids: opportunityIds }),
    });
  }

  async agentExplain(opportunityId) {
    return await this.request('/agent/explain', {
      method: 'POST',
      body: JSON.stringify({ opportunity_id: opportunityId }),
    });
  }

  async agentResetSession(sessionId) {
    return await this.request(`/agent/reset-session?session_id=${sessionId}`, {
      method: 'POST',
    });
  }

  // Resume Analyzer
  async uploadResume(file) {
    const url = `${BASE_URL}/resume/upload`;
    const formData = new FormData();
    formData.append('file', file);
    const headers = {};
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Resume upload failed');
    }
    return await response.json();
  }

  async parseResumeText(text, applyToProfile = true) {
    return await this.request('/resume/parse-text', {
      method: 'POST',
      body: JSON.stringify({ text, apply_to_profile: applyToProfile }),
    });
  }

  async getResumeStatus() {
    return await this.request('/resume/status');
  }
}

export const api = new ApiService();
