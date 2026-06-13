// components/SgpaCalculator.js
import { useState, useMemo, useCallback, useEffect } from 'react';
import CourseCard from './CourseCard';
import SGPAProbabilityPredictor from './SGPAProbabilityPredictor';
import { calculateSGPA } from '../lib/calculator';
import { cCycleCourses, pCycleCourses } from '../lib/data';

const CYCLE_KEY = 'rvce-grade-calculator-cycle';
const C_CYCLE_DATA_KEY = 'rvce-grade-calculator-c-cycle-data';
const P_CYCLE_DATA_KEY = 'rvce-grade-calculator-p-cycle-data';
const SEMESTER_SGPA_KEY = 'rvce-grade-calculator-semester-sgpa';

const SEMESTERS = [
  { key: 'sem1', number: 1, label: 'Sem 1', year: 'First Year', subtitle: 'Chemistry Cycle', cycle: 'C', hasCalculator: true },
  { key: 'sem2', number: 2, label: 'Sem 2', year: 'First Year', subtitle: 'Physics Cycle', cycle: 'P', hasCalculator: true },
  { key: 'sem3', number: 3, label: 'Sem 3', year: 'Second Year', subtitle: 'Direct SGPA entry', hasCalculator: false },
  { key: 'sem4', number: 4, label: 'Sem 4', year: 'Second Year', subtitle: 'Direct SGPA entry', hasCalculator: false },
  { key: 'sem5', number: 5, label: 'Sem 5', year: 'Third Year', subtitle: 'Direct SGPA entry', hasCalculator: false },
  { key: 'sem6', number: 6, label: 'Sem 6', year: 'Third Year', subtitle: 'Direct SGPA entry', hasCalculator: false },
  { key: 'sem7', number: 7, label: 'Sem 7', year: 'Fourth Year', subtitle: 'Direct SGPA entry', hasCalculator: false },
  { key: 'sem8', number: 8, label: 'Sem 8', year: 'Fourth Year', subtitle: 'Direct SGPA entry', hasCalculator: false },
];

const YEARS = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];

const EMPTY_SEMESTER_SGPA = SEMESTERS.reduce((acc, sem) => {
  acc[sem.key] = '';
  return acc;
}, {});

const createCourses = (cycle) => {
  const cycleCourses = cycle === 'C' ? cCycleCourses : pCycleCourses;
  return cycleCourses.map((course, index) => ({
    id: index + 1,
    courseDetails: course,
    cieMarks: {},
    seeMarks: {},
    results: {},
  }));
};

const loadSemesterSgpas = () => {
  if (typeof window === 'undefined') {
    return EMPTY_SEMESTER_SGPA;
  }

  try {
    const saved = localStorage.getItem(SEMESTER_SGPA_KEY);
    if (!saved) return EMPTY_SEMESTER_SGPA;
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object') return EMPTY_SEMESTER_SGPA;
    return { ...EMPTY_SEMESTER_SGPA, ...parsed };
  } catch (error) {
    console.error('Error loading semester SGPA data from localStorage:', error);
    return EMPTY_SEMESTER_SGPA;
  }
};

const loadCycleCourses = (cycle) => {
  if (typeof window !== 'undefined') {
    try {
      const storageKey = cycle === 'C' ? C_CYCLE_DATA_KEY : P_CYCLE_DATA_KEY;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading cycle data:', error);
    }
  }

  return createCourses(cycle);
};

const getValidSgpa = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const sgpa = Number(value);
  if (!Number.isFinite(sgpa) || sgpa < 0 || sgpa > 10) return null;
  return sgpa;
};

const formatSgpa = (value) => {
  const sgpa = getValidSgpa(value);
  return sgpa === null ? '—' : sgpa.toFixed(2);
};

const formatSemesterSgpa = (semester) => {
  return semester.source === 'Pending' ? '—' : formatSgpa(semester.effectiveSgpa);
};

const readSavedCycleSgpas = () => {
  if (typeof window === 'undefined') {
    return { C: 0, P: 0 };
  }

  try {
    const cCycleData = localStorage.getItem(C_CYCLE_DATA_KEY);
    const pCycleData = localStorage.getItem(P_CYCLE_DATA_KEY);
    return {
      C: cCycleData ? Number(calculateSGPA(JSON.parse(cCycleData))) || 0 : 0,
      P: pCycleData ? Number(calculateSGPA(JSON.parse(pCycleData))) || 0 : 0,
    };
  } catch (error) {
    console.error('Error calculating saved cycle SGPAs:', error);
    return { C: 0, P: 0 };
  }
};

export default function SgpaCalculator() {
  const [selectedCycle, setSelectedCycle] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(CYCLE_KEY);
        if (saved === 'C' || saved === 'P') {
          return saved;
        }
      } catch (error) {
        console.error('Error loading cycle from localStorage:', error);
      }
    }
    return 'C';
  });

  const [courses, setCourses] = useState(() => loadCycleCourses(selectedCycle));
  const [semesterSgpas, setSemesterSgpas] = useState(() => loadSemesterSgpas());

  const currentCalculatedSgpa = useMemo(() => Number(calculateSGPA(courses)) || 0, [courses]);

  const cycleSgpas = useMemo(() => {
    const saved = readSavedCycleSgpas();
    return {
      C: selectedCycle === 'C' ? currentCalculatedSgpa : saved.C,
      P: selectedCycle === 'P' ? currentCalculatedSgpa : saved.P,
    };
  }, [currentCalculatedSgpa, selectedCycle]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(CYCLE_KEY, selectedCycle);
    } catch (error) {
      console.error('Error saving cycle to localStorage:', error);
    }
  }, [selectedCycle]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storageKey = selectedCycle === 'C' ? C_CYCLE_DATA_KEY : P_CYCLE_DATA_KEY;
      localStorage.setItem(storageKey, JSON.stringify(courses));
    } catch (error) {
      console.error('Error saving courses to localStorage:', error);
    }
  }, [courses, selectedCycle]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(SEMESTER_SGPA_KEY, JSON.stringify(semesterSgpas));
    } catch (error) {
      console.error('Error saving semester SGPA data:', error);
    }
  }, [semesterSgpas]);

  const semesterSummary = useMemo(() => {
    return SEMESTERS.map((semester) => {
      const directSgpa = getValidSgpa(semesterSgpas[semester.key]);
      const calculatedSgpa = semester.key === 'sem1'
        ? getValidSgpa(cycleSgpas.C)
        : semester.key === 'sem2'
          ? getValidSgpa(cycleSgpas.P)
          : null;
      const effectiveSgpa = directSgpa ?? calculatedSgpa;

      return {
        ...semester,
        directSgpa,
        calculatedSgpa,
        effectiveSgpa,
        source: directSgpa !== null ? 'Direct' : calculatedSgpa !== null && calculatedSgpa > 0 ? 'Calculated' : 'Pending',
      };
    });
  }, [cycleSgpas, semesterSgpas]);

  const completedSemesters = useMemo(
    () => semesterSummary.filter((semester) => semester.effectiveSgpa !== null && semester.effectiveSgpa > 0),
    [semesterSummary]
  );

  const cgpa = useMemo(() => {
    if (completedSemesters.length === 0) return null;
    const total = completedSemesters.reduce((sum, semester) => sum + semester.effectiveSgpa, 0);
    return total / completedSemesters.length;
  }, [completedSemesters]);

  const selectedSemester = selectedCycle === 'C' ? semesterSummary[0] : semesterSummary[1];
  const currentCycleSgpa = selectedSemester?.source === 'Pending'
    ? 0
    : selectedSemester?.effectiveSgpa ?? currentCalculatedSgpa;
  const currentCycleDisplay = selectedSemester?.source === 'Pending' ? '—' : formatSgpa(currentCycleSgpa);
  const cgpaDisplay = cgpa === null ? '—' : cgpa.toFixed(2);

  useEffect(() => {
    const hasCourseData = courses.some(course =>
      course.courseDetails &&
      (Object.keys(course.cieMarks || {}).length > 0 || Object.keys(course.seeMarks || {}).length > 0)
    );
    const hasSemesterOverrides = Object.values(semesterSgpas).some(value => getValidSgpa(value) !== null);
    const hasData = hasCourseData || hasSemesterOverrides;

    if (!hasData) return;

    const timeoutId = setTimeout(async () => {
      try {
        const username = localStorage.getItem('rvce-calculator-username') || null;
        const loginTime = localStorage.getItem('rvce-calculator-login-time') || null;

        const submissionData = {
          username,
          loginTime,
          sgpa: currentCycleSgpa.toFixed(2),
          cgpa: cgpa === null ? null : cgpa.toFixed(2),
          cycle: selectedCycle,
          semesterSgpas,
          courses: courses.map(course => ({
            courseDetails: course.courseDetails,
            cieMarks: course.cieMarks,
            seeMarks: course.seeMarks,
            results: course.results,
          })),
        };

        await fetch('/api/submit-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        });
      } catch (error) {
        console.error('Error submitting data:', error);
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [cgpa, courses, currentCycleSgpa, semesterSgpas, selectedCycle]);

  const handleCycleChange = (cycle) => {
    if (cycle === selectedCycle) return;
    setSelectedCycle(cycle);
    setCourses(loadCycleCourses(cycle));
  };

  const updateCourse = useCallback((id, data) => {
    setCourses(courses => courses.map(course => (course.id === id ? { ...course, ...data } : course)));
  }, []);

  const handleSemesterSgpaChange = (semesterKey, value) => {
    if (value === '') {
      setSemesterSgpas(prev => ({ ...prev, [semesterKey]: '' }));
      return;
    }

    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0 || numeric > 10) {
      return;
    }

    setSemesterSgpas(prev => ({
      ...prev,
      [semesterKey]: value,
    }));
  };

  const clearDirectSgpa = (semesterKey) => {
    setSemesterSgpas(prev => ({
      ...prev,
      [semesterKey]: '',
    }));
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all saved course and SGPA data? This cannot be undone.')) {
      setCourses(createCourses(selectedCycle));
      setSemesterSgpas(EMPTY_SEMESTER_SGPA);

      if (typeof window !== 'undefined') {
        localStorage.removeItem(C_CYCLE_DATA_KEY);
        localStorage.removeItem(P_CYCLE_DATA_KEY);
        localStorage.removeItem(SEMESTER_SGPA_KEY);
      }
    }
  };

  return (
    <div className="w-full mx-auto animate-fadeIn">
      <section className="mb-8 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4 sm:gap-5">
        <div className="glass-panel p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div>
              <div className="glass-chip mb-4">Sem 1-8 Tracker</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                SGPA entries and CGPA in one place
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl">
                Calculate Sem 1 and Sem 2 with the first-year chemistry and physics cycles, or enter any completed semester SGPA directly.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[240px]">
              <div className="rounded-3xl border border-white/12 bg-white/[0.08] p-4 shadow-inner">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">CGPA</p>
                <p className="mt-2 text-4xl font-black text-white">{cgpaDisplay}</p>
                <p className="mt-1 text-xs text-slate-400">{completedSemesters.length} sem{completedSemesters.length === 1 ? '' : 's'} used</p>
              </div>
              <div className="rounded-3xl border border-white/12 bg-white/[0.08] p-4 shadow-inner">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Current</p>
                <p className="mt-2 text-4xl font-black text-white">{currentCycleDisplay}</p>
                <p className="mt-1 text-xs text-slate-400">{selectedCycle === 'C' ? 'Sem 1' : 'Sem 2'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 sm:p-7">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">First Year Calculators</p>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {semesterSummary.slice(0, 2).map((semester) => (
              <button
                key={semester.key}
                onClick={() => handleCycleChange(semester.cycle)}
                className={`text-left rounded-3xl border p-4 transition-all duration-200 ${
                  selectedCycle === semester.cycle
                    ? 'border-cyan-300/45 bg-cyan-300/15 shadow-[0_18px_55px_rgba(8,145,178,0.22)]'
                    : 'border-white/12 bg-white/[0.06] hover:border-white/25 hover:bg-white/[0.1]'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-white">{semester.label}</p>
                    <p className="mt-1 text-xs text-slate-300">{semester.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">SGPA</p>
                    <p className="text-2xl font-black text-white">{formatSemesterSgpa(semester)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-8 space-y-5">
        {YEARS.map((year) => (
          <div key={year} className="glass-panel p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{year}</p>
                <h3 className="mt-1 text-lg font-black text-white">
                  {semesterSummary.filter((semester) => semester.year === year).map((semester) => semester.label).join(' + ')}
                </h3>
              </div>
              {year === 'First Year' && (
                <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                  Chemistry + Physics cycle
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {semesterSummary.filter((semester) => semester.year === year).map((semester) => (
                <SemesterCard
                  key={semester.key}
                  semester={semester}
                  value={semesterSgpas[semester.key]}
                  onChange={handleSemesterSgpaChange}
                  onClear={clearDirectSgpa}
                  onOpenCalculator={handleCycleChange}
                  isSelected={selectedCycle === semester.cycle}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="sticky top-20 z-20 mb-8">
        <div className="glass-panel overflow-hidden p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Live Summary</p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white">
                {selectedCycle === 'C' ? 'Sem 1 Chemistry Cycle' : 'Sem 2 Physics Cycle'}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                CGPA is the average of all valid semester SGPAs currently filled above.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryStat label="This SGPA" value={currentCycleDisplay} tone="cyan" />
              <SummaryStat label="CGPA" value={cgpaDisplay} tone="orange" />
              <SummaryStat label="Completed" value={completedSemesters.length} tone="emerald" />
              <SummaryStat label="Out of" value="10.0" tone="slate" />
            </div>
          </div>
        </div>
      </section>

      <SGPAProbabilityPredictor courses={courses} />

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Course Calculator</p>
            <h2 className="mt-1 text-2xl font-black text-white">
              {selectedCycle === 'C' ? 'Sem 1 Chemistry Cycle' : 'Sem 2 Physics Cycle'}
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Enter CIE and SEE marks below, or use direct SGPA entries above for completed semesters.
          </p>
        </div>

        {courses.map((course, index) => (
          <div key={course.id} className="animate-slideInLeft" style={{ animationDelay: `${index * 0.06}s` }}>
            <CourseCard id={course.id} initialCourseData={course} onUpdate={updateCourse} />
          </div>
        ))}
      </section>

      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={clearAllData}
          className="group relative overflow-hidden rounded-2xl border border-red-300/20 bg-red-500/10 px-8 py-4 text-sm font-bold text-red-100 backdrop-blur-xl transition-all duration-200 hover:border-red-300/35 hover:bg-red-500/15"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All Data
          </span>
        </button>
      </div>

      <section className="mt-12 glass-panel p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-orange-300/25 bg-orange-300/10">
            <svg className="w-5 h-5 text-orange-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-black text-white">Disclaimer & Assumptions</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>Course data and CIE rubrics are based on the provided Dean first-year 2025 scheme syllabus.</li>
              <li>Passing standards use the existing calculator assumptions: CIE &gt;= 40%, SEE &gt;= 35%, and aggregate &gt;= 40%.</li>
              <li>This is an unofficial tool. Confirm final marks and CGPA with official university results.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

const SemesterCard = ({ semester, value, onChange, onClear, onOpenCalculator, isSelected }) => {
  const hasDirect = semester.directSgpa !== null;
  const hasCalculated = semester.calculatedSgpa !== null && semester.calculatedSgpa > 0;
  const isFirstYear = semester.hasCalculator;

  return (
    <div className={`rounded-3xl border bg-white/[0.055] p-4 transition-all duration-200 ${
      isSelected ? 'border-cyan-300/45 shadow-[0_18px_45px_rgba(8,145,178,0.18)]' : 'border-white/10 hover:border-white/20'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/10 text-sm font-black text-white">
              {semester.number}
            </span>
            <div>
              <h4 className="text-base font-black text-white">{semester.label}</h4>
              <p className="text-xs text-slate-400">{semester.subtitle}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">SGPA</p>
          <p className="text-3xl font-black text-white">{formatSemesterSgpa(semester)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
          hasDirect
            ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100'
            : hasCalculated
              ? 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100'
              : 'border-white/10 bg-white/[0.06] text-slate-300'
        }`}>
          {semester.source}
        </span>
        {isFirstYear ? (
          <button
            type="button"
            onClick={() => onOpenCalculator(semester.cycle)}
            className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-slate-200 transition hover:border-cyan-300/30 hover:text-white"
          >
            Open calculator
          </button>
        ) : (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-400">
            Calculator pending
          </span>
        )}
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-xs font-semibold text-slate-300">
          Direct SGPA {isFirstYear ? '(optional override)' : ''}
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            max="10"
            step="0.01"
            value={value}
            onChange={(e) => onChange(semester.key, e.target.value)}
            placeholder={isFirstYear ? 'Use calculated or enter SGPA' : 'Enter completed SGPA'}
            className="glass-input"
          />
          {hasDirect && (
            <button
              type="button"
              onClick={() => onClear(semester.key)}
              className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 text-xs font-bold text-slate-300 transition hover:border-white/25 hover:text-white"
              aria-label={`Clear direct SGPA for ${semester.label}`}
            >
              Clear
            </button>
          )}
        </div>
        {isFirstYear && hasCalculated && (
          <p className="mt-2 text-xs text-slate-500">
            Calculated value: {formatSgpa(semester.calculatedSgpa)}
          </p>
        )}
      </div>
    </div>
  );
};

const SummaryStat = ({ label, value, tone }) => {
  const toneClass = {
    cyan: 'text-cyan-100 border-cyan-300/20 bg-cyan-300/10',
    orange: 'text-orange-100 border-orange-300/20 bg-orange-300/10',
    emerald: 'text-emerald-100 border-emerald-300/20 bg-emerald-300/10',
    slate: 'text-slate-100 border-white/12 bg-white/[0.06]',
  }[tone];

  return (
    <div className={`min-w-[96px] rounded-3xl border p-4 text-center ${toneClass}`}>
      <p className="text-[10px] uppercase tracking-[0.18em] opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
};
