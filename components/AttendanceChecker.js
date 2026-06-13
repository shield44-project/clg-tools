// components/AttendanceChecker.js
import { useState, useCallback } from 'react';

const ATTENDANCE_STORAGE_KEY = 'rvce-attendance-data';
const MIN_ATTENDANCE = 85;

function getAttendanceColor(pct) {
  if (pct >= MIN_ATTENDANCE) return { text: 'text-green-400', bg: 'bg-green-500', badge: 'bg-green-500/15 text-green-300 border-green-700/30' };
  if (pct >= 75) return { text: 'text-yellow-400', bg: 'bg-yellow-500', badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-700/30' };
  return { text: 'text-red-400', bg: 'bg-red-500', badge: 'bg-red-500/15 text-red-300 border-red-700/30' };
}

function calcClassesNeeded(held, attended) {
  if (attended / held >= MIN_ATTENDANCE / 100 || held === 0) return 0;
  // x = extra classes to attend to reach 85%: (attended+x)/(held+x) >= 0.85
  // attended + x >= 0.85 * held + 0.85 * x  =>  0.15x >= 0.85*held - attended
  const needed = Math.ceil((MIN_ATTENDANCE / 100 * held - attended) / (1 - MIN_ATTENDANCE / 100));
  return Math.max(0, needed);
}

function calcSafeSkips(held, attended) {
  if (held === 0) return 0;
  // (attended) / (held + x) >= 0.85  =>  held + x <= attended / 0.85
  const maxHeld = Math.floor(attended / (MIN_ATTENDANCE / 100));
  return Math.max(0, maxHeld - held);
}

export default function AttendanceChecker() {
  const [subjects, setSubjects] = useState(() => {
    if (typeof window === 'undefined') return [];

    try {
      const saved = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', held: '', attended: '' });
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [formError, setFormError] = useState('');

  // Persist to localStorage
  const persist = useCallback((data) => {
    setSubjects(data);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(data));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleAddSubject = (e) => {
    e.preventDefault();
    setFormError('');
    const name = newSubject.name.trim();
    const held = parseInt(newSubject.held, 10);
    const attended = parseInt(newSubject.attended, 10);

    if (!name) { setFormError('Subject name is required.'); return; }
    if (isNaN(held) || held < 0) { setFormError('Classes held must be a non-negative number.'); return; }
    if (isNaN(attended) || attended < 0) { setFormError('Classes attended must be a non-negative number.'); return; }
    if (attended > held) { setFormError('Attended cannot be more than classes held.'); return; }
    if (subjects.find(s => s.name.toLowerCase() === name.toLowerCase())) {
      setFormError('A subject with this name already exists.'); return;
    }

    persist([...subjects, { id: Date.now(), name, held, attended }]);
    setNewSubject({ name: '', held: '', attended: '' });
    setShowAddForm(false);
  };

  const handleDelete = (id) => {
    if (confirm('Remove this subject?')) {
      persist(subjects.filter(s => s.id !== id));
    }
  };

  const startEdit = (subject) => {
    setEditingId(subject.id);
    setEditValues({ held: subject.held, attended: subject.attended });
  };

  const saveEdit = (id) => {
    const held = parseInt(editValues.held, 10);
    const attended = parseInt(editValues.attended, 10);
    if (isNaN(held) || held < 0 || isNaN(attended) || attended < 0 || attended > held) return;
    persist(subjects.map(s => s.id === id ? { ...s, held, attended } : s));
    setEditingId(null);
  };

  const handleMarkClass = (id, wasPresent) => {
    persist(subjects.map(s => {
      if (s.id !== id) return s;
      return { ...s, held: s.held + 1, attended: s.attended + (wasPresent ? 1 : 0) };
    }));
  };

  const overallHeld = subjects.reduce((a, s) => a + s.held, 0);
  const overallAttended = subjects.reduce((a, s) => a + s.attended, 0);
  const overallPct = overallHeld > 0 ? Math.round((overallAttended / overallHeld) * 100) : null;
  const overallColors = overallPct !== null ? getAttendanceColor(overallPct) : null;

  const atRiskCount = subjects.filter(s => s.held > 0 && (s.attended / s.held) * 100 < MIN_ATTENDANCE).length;

  return (
    <div className="w-full mx-auto animate-fadeIn">
      {/* Header with overall summary */}
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-teal-500 to-orange-500 opacity-20 blur-xl"></div>
          <div className="relative neumorphic p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Attendance Tracker</h2>
                <p className="text-sm text-gray-400">
                  RVCE requires <span className="text-orange-400 font-semibold">≥ 85%</span> attendance to be eligible for SEE
                </p>
              </div>
              {overallPct !== null && (
                <div className="flex items-center gap-4">
                  {atRiskCount > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-700/30 text-red-300 text-sm">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {atRiskCount} subject{atRiskCount > 1 ? 's' : ''} at risk
                    </div>
                  )}
                  <div className="text-right">
                    <div className={`text-3xl font-black ${overallColors.text}`}>{overallPct}%</div>
                    <div className="text-xs text-gray-500">Overall ({overallAttended}/{overallHeld})</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subject Cards */}
      {subjects.length === 0 ? (
        <div className="neumorphic rounded-2xl p-10 text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-300 font-semibold mb-1">No subjects added yet</p>
          <p className="text-sm text-gray-500">Add your subjects to start tracking attendance</p>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {subjects.map((subject) => {
            const pct = subject.held > 0 ? Math.round((subject.attended / subject.held) * 100) : null;
            const colors = pct !== null ? getAttendanceColor(pct) : null;
            const needed = calcClassesNeeded(subject.held, subject.attended);
            const canSkip = calcSafeSkips(subject.held, subject.attended);
            const isEditing = editingId === subject.id;

            return (
              <div key={subject.id} className="neumorphic rounded-2xl overflow-hidden">
                {/* Top bar with attendance color */}
                {pct !== null && (
                  <div className={`h-1 ${colors.bg} opacity-70`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-base truncate">{subject.name}</h3>
                      {pct !== null ? (
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg border mt-1 ${colors.badge}`}>
                          {pct >= MIN_ATTENDANCE ? '✓ Good' : pct >= 75 ? '⚠ At Risk' : '✗ Low'} — {pct}%
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">No classes recorded</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => startEdit(subject)}
                        className="w-8 h-8 rounded-lg bg-gray-800/60 border border-gray-700/50 text-gray-400 hover:text-cyan-400 hover:border-cyan-700/50 flex items-center justify-center transition-colors"
                        title="Edit counts"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id)}
                        className="w-8 h-8 rounded-lg bg-gray-800/60 border border-gray-700/50 text-gray-400 hover:text-red-400 hover:border-red-700/50 flex items-center justify-center transition-colors"
                        title="Remove subject"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Classes Held</label>
                          <input
                            type="number"
                            min="0"
                            value={editValues.held}
                            onChange={e => setEditValues(v => ({ ...v, held: e.target.value }))}
                            className="w-full px-3 py-2 text-sm neumorphic-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Classes Attended</label>
                          <input
                            type="number"
                            min="0"
                            value={editValues.attended}
                            onChange={e => setEditValues(v => ({ ...v, attended: e.target.value }))}
                            className="w-full px-3 py-2 text-sm neumorphic-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(subject.id)}
                          className="flex-1 py-2 text-sm rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold hover:from-cyan-500 hover:to-teal-500 transition-all"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 text-sm rounded-xl bg-gray-800 text-gray-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-gray-800/40 rounded-xl p-2.5 text-center">
                          <div className="text-lg font-bold text-white">{subject.held}</div>
                          <div className="text-xs text-gray-500">Held</div>
                        </div>
                        <div className="bg-gray-800/40 rounded-xl p-2.5 text-center">
                          <div className="text-lg font-bold text-white">{subject.attended}</div>
                          <div className="text-xs text-gray-500">Attended</div>
                        </div>
                        <div className="bg-gray-800/40 rounded-xl p-2.5 text-center">
                          <div className={`text-lg font-bold ${pct !== null ? colors.text : 'text-gray-400'}`}>
                            {pct !== null ? `${pct}%` : '—'}
                          </div>
                          <div className="text-xs text-gray-500">Percentage</div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {pct !== null && (
                        <div className="mb-4">
                          <div className="h-2 bg-gray-800/60 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${colors.bg}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            ></div>
                          </div>
                          <div className="relative h-0">
                            <div
                              className="absolute -top-3 transform -translate-x-1/2"
                              style={{ left: `${MIN_ATTENDANCE}%` }}
                            >
                              <div className="w-px h-3 bg-orange-500/60 mx-auto"></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Advisory message */}
                      {pct !== null && (
                        <div className={`text-xs px-3 py-2 rounded-lg mb-4 ${
                          pct < MIN_ATTENDANCE
                            ? 'bg-red-500/10 border border-red-700/30 text-red-300'
                            : canSkip > 0
                            ? 'bg-green-500/10 border border-green-700/30 text-green-300'
                            : 'bg-yellow-500/10 border border-yellow-700/30 text-yellow-300'
                        }`}>
                          {pct < MIN_ATTENDANCE
                            ? `⚠ Attend next ${needed} class${needed !== 1 ? 'es' : ''} consecutively to reach 85%`
                            : canSkip > 0
                            ? `✓ You can safely miss up to ${canSkip} more class${canSkip !== 1 ? 'es' : ''}`
                            : '⚠ Don\'t miss any more classes — right at 85%'}
                        </div>
                      )}

                      {/* Quick mark buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMarkClass(subject.id, true)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded-xl bg-green-900/30 border border-green-700/30 text-green-300 hover:bg-green-800/40 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Present
                        </button>
                        <button
                          onClick={() => handleMarkClass(subject.id, false)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded-xl bg-red-900/30 border border-red-700/30 text-red-300 hover:bg-red-800/40 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Absent
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Subject Form */}
      {showAddForm ? (
        <div className="neumorphic rounded-2xl p-5 mb-6 animate-fadeIn">
          <h3 className="font-bold text-white mb-4 text-sm">Add New Subject</h3>
          <form onSubmit={handleAddSubject} className="space-y-3">
            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-700/30 text-red-300 text-xs">
                {formError}
              </div>
            )}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Subject Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={newSubject.name}
                onChange={e => setNewSubject(v => ({ ...v, name: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm neumorphic-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-600"
                placeholder="e.g. Mathematics, Chemistry Lab..."
                maxLength={60}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Classes Held</label>
                <input
                  type="number"
                  min="0"
                  value={newSubject.held}
                  onChange={e => setNewSubject(v => ({ ...v, held: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm neumorphic-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Classes Attended</label>
                <input
                  type="number"
                  min="0"
                  value={newSubject.attended}
                  onChange={e => setNewSubject(v => ({ ...v, attended: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm neumorphic-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                  placeholder="0"
                />
              </div>
            </div>
            <p className="text-xs text-gray-600">Leave held/attended as 0 to start fresh and mark day by day.</p>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 text-sm rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold hover:from-cyan-500 hover:to-teal-500 transition-all"
              >
                Add Subject
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setFormError(''); setNewSubject({ name: '', held: '', attended: '' }); }}
                className="px-4 py-2.5 text-sm rounded-xl bg-gray-800 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-gray-700/60 text-gray-400 hover:border-cyan-700/50 hover:text-cyan-400 transition-all text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Subject
        </button>
      )}

      {/* Info note */}
      <div className="mt-8 neumorphic rounded-2xl p-5">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-gray-400">
            <span className="font-semibold text-white">Note:</span> Attendance data is saved locally in your browser. RVCE mandates a minimum of 85% attendance per subject to be eligible for SEE (end-semester exams).
          </div>
        </div>
      </div>
    </div>
  );
}
