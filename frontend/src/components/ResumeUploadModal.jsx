import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Code,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { api } from '../services/api';

export const ResumeUploadModal = ({ isOpen, onClose, onProfileUpdated }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' or 'text'
  const [selectedFile, setSelectedFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedResult, setParsedResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a valid PDF file (.pdf)');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setParsedResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Please drop a valid PDF file (.pdf)');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setParsedResult(null);
    }
  };

  const handleUploadPdf = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.uploadResume(selectedFile);
      setParsedResult(res.parsed_data);
      if (onProfileUpdated) {
        onProfileUpdated(res.profile);
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      setError(err.message || 'Failed to process resume. Please ensure the PDF has selectable text.');
    } finally {
      setLoading(false);
    }
  };

  const handleParseText = async () => {
    if (!rawText || rawText.trim().length < 20) {
      setError('Please enter at least 20 characters of resume or CV text.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await api.parseResumeText(rawText, true);
      setParsedResult(res.parsed_data);
      if (onProfileUpdated && res.profile) {
        onProfileUpdated(res.profile);
      }
    } catch (err) {
      console.error('Resume text parsing error:', err);
      setError(err.message || 'Failed to parse resume text.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-fade-in my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                AI Resume & CV Analyzer
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Extract skills, projects, and calibrate your 6-Factor match scores
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-850/30 px-6 pt-3">
          <button
            onClick={() => {
              setActiveTab('pdf');
              setError(null);
            }}
            className={`pb-3 text-xs font-bold transition-all border-b-2 mr-6 ${
              activeTab === 'pdf'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Upload PDF Document
          </button>
          <button
            onClick={() => {
              setActiveTab('text');
              setError(null);
            }}
            className={`pb-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'text'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Paste Plain Text / Markdown
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'pdf' ? (
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                  selectedFile
                    ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-950/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-brand-400 bg-slate-50/50 dark:bg-slate-850/50'
                }`}
              >
                <input
                  type="file"
                  id="resume-file-input"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="resume-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-brand-500 group-hover:scale-105 transition-transform">
                    {selectedFile ? (
                      <FileText className="w-7 h-7 text-brand-600" />
                    ) : (
                      <UploadCloud className="w-7 h-7 text-slate-400" />
                    )}
                  </div>
                  {selectedFile ? (
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Click or drop to replace
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Click to select your Resume PDF or drag and drop here
                      </p>
                      <p className="text-xs text-slate-400">PDF documents up to 10MB supported</p>
                    </div>
                  )}
                </label>
              </div>

              <button
                type="button"
                onClick={handleUploadPdf}
                disabled={!selectedFile || loading}
                className="w-full py-3 rounded-2xl bg-slate-900 text-white dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-500 font-bold text-xs shadow-md disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Resume with Groq AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract & Calibrate Profile</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste your education, skills, projects, and work experience here..."
                rows={8}
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
              <button
                type="button"
                onClick={handleParseText}
                disabled={!rawText.trim() || loading}
                className="w-full py-3 rounded-2xl bg-slate-900 text-white dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-500 font-bold text-xs shadow-md disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Parsing Resume Content...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Parse Text & Update Profile</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Success Extraction Preview */}
          {parsedResult && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold">Successfully Extracted & Profile Updated!</span>
              </div>

              {parsedResult.resume_summary && (
                <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                  "{parsedResult.resume_summary}"
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-emerald-100 dark:border-emerald-900/30">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Extracted Skills ({parsedResult.skills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {parsedResult.skills?.slice(0, 8).map((sk, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-emerald-100 dark:border-emerald-900/30">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Education & Credentials
                  </span>
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    {parsedResult.degree} • {parsedResult.academic_year}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {parsedResult.college} (GPA: {parsedResult.gpa})
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>View Updated Matches</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
