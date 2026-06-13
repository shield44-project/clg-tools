// pages/index.js
import Head from 'next/head';
import SgpaCalculator from '../components/SgpaCalculator';
import LoginButton from '../components/LoginButton';
import AttendanceChecker from '../components/AttendanceChecker';
import Resources from '../components/Resources';
import { useState } from 'react';

const NAV_TABS = [
  {
    id: 'calculator',
    label: 'SGPA Calculator',
    shortLabel: 'Calculator',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'attendance',
    label: 'Attendance Checker',
    shortLabel: 'Attendance',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'resources',
    label: 'Resources',
    shortLabel: 'Resources',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({ title: '', description: '', email: '' });
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState('');

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportSubmitting(true);
    setReportError('');

    try {
      const response = await fetch('/api/report-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reportForm, page: window.location.pathname }),
      });

      const data = await response.json();

      if (response.ok) {
        setReportSuccess(true);
        setReportForm({ title: '', description: '', email: '' });
        setTimeout(() => {
          setShowReportModal(false);
          setReportSuccess(false);
        }, 2000);
      } else {
        setReportError(data.error || 'Failed to submit issue');
      }
    } catch {
      setReportError('Failed to connect to server');
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden">
      <Head>
        <title>RVCE Grade & SGPA Calculator | 2025 Scheme</title>
        <meta name="description" content="An accurate RVCE grade and SGPA calculator for the 2025 scheme, based on the official syllabus document." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      {/* Top navigation bar */}
      <header className="sticky top-0 z-40 w-full">
        <div className="border-b border-white/10 bg-slate-950/45 backdrop-blur-2xl">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16 gap-4">
              {/* Brand */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-orange-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                  </svg>
                </div>
                <span className="font-bold text-white text-sm hidden sm:block">RVCE Tools</span>
              </div>

              {/* Tab navigation */}
              <nav className="flex items-center gap-1 flex-1 justify-center">
                {NAV_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border border-cyan-300/25 bg-cyan-300/15 text-white shadow-sm'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </button>
                ))}
              </nav>

              {/* Login */}
              <div className="flex-shrink-0">
                <LoginButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page hero — only on calculator tab */}
      {activeTab === 'calculator' && (
        <div className="relative z-10 pt-10 pb-6 px-4 sm:px-6 text-center animate-fadeIn">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-700/40 bg-cyan-500/8 text-cyan-300 text-xs font-semibold mb-5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              2025 Scheme · Sem 1-8
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-3">
              RVCE Grade &{' '}
              <span className="gradient-text-cyan">SGPA Calculator</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              Calculate first-year cycles, enter completed semester SGPAs directly, and average them into CGPA.
            </p>
          </div>
        </div>
      )}

      {/* Tab content header for non-calculator tabs */}
      {activeTab !== 'calculator' && (
        <div className="relative z-10 pt-8 pb-4 px-4 sm:px-6 animate-fadeIn">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <button onClick={() => setActiveTab('calculator')} className="hover:text-gray-300 transition-colors">SGPA Calculator</button>
              <span>›</span>
              <span className="text-gray-300">{NAV_TABS.find(t => t.id === activeTab)?.label}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="relative z-10 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'calculator' && <SgpaCalculator />}
          {activeTab === 'attendance' && <AttendanceChecker />}
          {activeTab === 'resources' && <Resources />}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-10 px-4 sm:px-6 border-t border-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-gray-500 text-sm text-center sm:text-left">
              Made for RVCE students · Unofficial tool for educational purposes
            </p>

            <div className="flex items-center gap-6">
              <a
                href="https://github.com/shield44"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                @shield44
              </a>

              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-orange-400 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Report Issue
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Report Issue Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowReportModal(false); setReportError(''); } }}
        >
          <div className="glass-panel max-w-md w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold gradient-text-cyan">Report an Issue</h2>
                <button
                  onClick={() => { setShowReportModal(false); setReportError(''); setReportSuccess(false); }}
                  className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {reportSuccess ? (
                <div className="py-10 text-center animate-scaleIn">
                  <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-effect-cyan">
                    <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-white font-bold mb-1">Submitted successfully!</p>
                  <p className="text-sm text-gray-400">Thank you for your feedback.</p>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  {reportError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-700/30 text-red-300 text-sm">
                      {reportError}
                    </div>
                  )}

                  <div>
                    <label htmlFor="issueTitle" className="block text-gray-300 text-xs font-semibold mb-1.5">
                      Issue Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="issueTitle"
                      value={reportForm.title}
                      onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                      className="glass-input text-sm"
                      placeholder="Brief description of the issue"
                      required
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label htmlFor="issueDescription" className="block text-gray-300 text-xs font-semibold mb-1.5">
                      Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="issueDescription"
                      value={reportForm.description}
                      onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                      className="glass-input min-h-28 resize-none text-sm"
                      placeholder="Please describe the issue in detail..."
                      required
                      rows={4}
                      maxLength={1000}
                    />
                    <p className="text-xs text-gray-600 mt-1">{reportForm.description.length}/1000</p>
                  </div>

                  <div>
                    <label htmlFor="issueEmail" className="block text-gray-300 text-xs font-semibold mb-1.5">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      id="issueEmail"
                      value={reportForm.email}
                      onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                      className="glass-input text-sm"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => { setShowReportModal(false); setReportError(''); }}
                      className="flex-1 px-4 py-2.5 glass-effect text-gray-300 hover:text-white font-semibold rounded-xl transition-all text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reportSubmitting}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-sm"
                    >
                      {reportSubmitting ? 'Submitting…' : 'Submit'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
