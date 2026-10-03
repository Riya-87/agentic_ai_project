import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Sparkles,
  Code2,
  Heart,
  MapPin,
  Save,
  Plus,
  X,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Building2,
  FileText,
  Target,
  Compass
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAgent } from '../context/AgentContext';
import { ProfileStrengthMeter } from '../components/ProfileStrengthMeter';

export const ProfilePage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { showToast } = useAgent();

  const [formData, setFormData] = useState({
    degree: '',
    branch: '',
    academic_year: '',
    college: '',
    graduation_year: 2026,
    skills: [],
    interests: [],
    preferred_categories: [],
    preferred_location: '',
    mode_preference: 'Any',
    gpa: '',
    bio: '',
    career_goals: '',
    resume_summary: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [strengthData, setStrengthData] = useState(null);
  const [saving, setSaving] = useState(false);

  const popularSkills = [
    'Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'FastAPI',
    'React', 'TypeScript', 'Docker', 'PostgreSQL', 'NLP', 'Computer Vision',
    'LLMs', 'LangGraph', 'Tailwind CSS', 'Next.js', 'Kubernetes'
  ];

  const popularInterests = [
    'Generative AI', 'Agentic Workflows', 'Distributed Systems', 'Open Source',
    'AI in Healthcare', 'Robotics & Hardware', 'Bioinformatics', 'FinTech'
  ];

  useEffect(() => {
    if (profile) {
      setFormData({
        degree: profile.degree || 'Bachelor of Technology',
        branch: profile.branch || 'Computer Science & Engineering',
        academic_year: profile.academic_year || '3rd Year',
        college: profile.college || 'National Institute of Technology',
        graduation_year: profile.graduation_year || 2026,
        skills: profile.skills || ['Python', 'FastAPI', 'React'],
        interests: profile.interests || ['Generative AI', 'Open Source'],
        preferred_categories: profile.preferred_categories || ['Hackathon', 'Research Fellowship'],
        preferred_location: profile.preferred_location || 'Global / Remote',
        mode_preference: profile.mode_preference || 'Any',
        gpa: profile.gpa || '8.8 / 10.0',
        bio: profile.bio || '',
        career_goals: profile.career_goals || 'AI Research Scientist / Software Engineer',
        resume_summary: profile.resume_summary || '',
      });
      fetchStrength();
    }
  }, [profile]);

  const fetchStrength = async () => {
    try {
      const data = await api.getProfileStrength();
      setStrengthData(data);
    } catch (e) {
      console.error('Error fetching strength:', e);
    }
  };

  const allCategories = [
    'Hackathon',
    'Research Fellowship',
    'Scholarship',
    'Internship',
    'Student Program',
    'Competition',
    'Grant',
    'Conference',
  ];

  const handleAddSkill = (e, skillToAdd) => {
    e?.preventDefault();
    const s = skillToAdd || newSkill.trim();
    if (s && !formData.skills.includes(s)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, s] }));
      if (!skillToAdd) setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleAddInterest = (e, interestToAdd) => {
    e?.preventDefault();
    const i = interestToAdd || newInterest.trim();
    if (i && !formData.interests.includes(i)) {
      setFormData((prev) => ({ ...prev, interests: [...prev.interests, i] }));
      if (!interestToAdd) setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interestToRemove),
    }));
  };

  const toggleCategory = (cat) => {
    setFormData((prev) => {
      const exists = prev.preferred_categories.includes(cat);
      return {
        ...prev,
        preferred_categories: exists
          ? prev.preferred_categories.filter((c) => c !== cat)
          : [...prev.preferred_categories, cat],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile(formData);
      await refreshProfile();
      await fetchStrength();
      showToast('Profile updated & 6-dimension match models recalibrated!', 'success');
    } catch (e) {
      console.error('Error saving profile:', e);
      showToast('Error saving profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span>Student Academic Profile</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure your academic credentials, skills, and target aspirations to calibrate the 7-agent matching engine
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-500/25 flex items-center gap-2 transition-all disabled:opacity-60"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Recalibrating AI Matches...' : 'Save & Recalibrate'}</span>
        </button>
      </div>

      {/* Profile Strength Widget */}
      <ProfileStrengthMeter strengthData={strengthData} onNavigateProfile={() => {}} />

      {/* Main Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Academic Credentials */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-500" />
            <span>Academic Background & Degree</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Degree Program
              </label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="e.g. Bachelor of Technology (B.Tech)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Major / Department / Branch
              </label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                University / College Name
              </label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                placeholder="e.g. National Institute of Technology"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Current Academic Year
                </label>
                <select
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500 font-medium"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Graduate / Masters">Graduate / Masters</option>
                  <option value="PhD Candidate">PhD Candidate</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Graduation Year
                </label>
                <input
                  type="number"
                  value={formData.graduation_year}
                  onChange={(e) => setFormData({ ...formData, graduation_year: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Cumulative GPA / CGPA
              </label>
              <input
                type="text"
                value={formData.gpa}
                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                placeholder="e.g. 8.9 / 10.0 or 3.8 / 4.0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Preferred Mode
              </label>
              <select
                value={formData.mode_preference}
                onChange={(e) => setFormData({ ...formData, mode_preference: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500 font-medium"
              >
                <option value="Any">Any Mode (Online, Offline & Hybrid)</option>
                <option value="Online">Online / Remote Preferred</option>
                <option value="Offline">In-Person Only</option>
                <option value="Hybrid">Hybrid Preferred</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Technical Skills */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-brand-500" />
              <span>Technical Skills & Frameworks ({formData.skills.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400">Weighted 25% in matching calculations</span>
          </div>

          {/* Add skill input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
              placeholder="Type custom skill and press Enter..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
            />
            <button
              type="button"
              onClick={(e) => handleAddSkill(e)}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          {/* Active Skills Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {formData.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20 text-xs font-semibold flex items-center gap-2"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          {/* Popular Suggested Skills */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-500" /> One-click suggested skill additions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {popularSkills
                .filter((s) => !formData.skills.includes(s))
                .slice(0, 10)
                .map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => handleAddSkill(e, s)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition-all border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{s}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Section 3: Interests & Target Categories */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Target Opportunity Categories & Focus Areas</span>
          </h3>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Preferred Opportunity Types (Click to toggle)
            </label>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => {
                const isSelected = formData.preferred_categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-brand-500 text-white border-brand-500 shadow-sm shadow-brand-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-500'
                    }`}
                  >
                    {isSelected && '✓ '}{cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Academic & Research Interests ({formData.interests.length})
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddInterest(e)}
                placeholder="Add interest (e.g. Agentic AI, Quant Finance, Robotics)..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={(e) => handleAddInterest(e)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {formData.interests.map((interest, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 text-xs font-semibold flex items-center gap-2"
                >
                  <span>{interest}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            {/* Popular Suggested Interests */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {popularInterests
                .filter((i) => !formData.interests.includes(i))
                .map((i, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => handleAddInterest(e, i)}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-[11px] font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-600 hover:text-white transition-all border border-purple-200/60 dark:border-purple-800/60 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{i}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Section 4: Career Goals & Aspirations */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-500" />
            <span>Target Career Goals & Aspirations</span>
          </h3>

          <div className="text-xs space-y-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Primary Career Objectives (e.g. AI Research Scientist, ML Engineer, Quant Strategist)
              </label>
              <input
                type="text"
                value={formData.career_goals}
                onChange={(e) => setFormData({ ...formData, career_goals: e.target.value })}
                placeholder="e.g. AI Research Scientist, Full-Stack Engineer at Tier 1 Tech, Graduate School"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Bio & Resume Summary */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            <span>Bio & Portfolio Context</span>
          </h3>

          <div className="text-xs space-y-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Short Student Bio
              </label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief summary of your academic journey, honors, and specific research interests..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Resume & Portfolio Highlights (Used by Copilot & LLM Matching)
              </label>
              <textarea
                rows={3}
                value={formData.resume_summary}
                onChange={(e) => setFormData({ ...formData, resume_summary: e.target.value })}
                placeholder="Major project achievements, hackathon placements, open-source repositories, or published papers..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="flex justify-end pt-2 pb-12">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold shadow-xl shadow-brand-500/25 flex items-center gap-2 transition-all disabled:opacity-60"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Profile & Recalibrate Agent Matches</span>
          </button>
        </div>
      </form>
    </div>
  );
};
