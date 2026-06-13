// components/CourseCard.js
import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  calculateTheoryCIE, 
  calculateLabCIE, 
  calculateIntegratedCIE, 
  calculateEnglishCIE,
  calculateCAEGCIE,
  calculateFOICCIE,
  calculateYogaCIE,
  calculateMathsCIE,
  calculateKannadaCIE,
  calculateFinalScore, 
  getGradeDetails, 
  checkPassStatus,
  calculateRequiredSEE,
  calculateRequiredSEEIntegrated,
  hasTotalCIE
} from '../lib/calculator';
import DetailedCIECalculator from './DetailedCIECalculator';

export default function CourseCard({ id, onUpdate, initialCourseData }) {
  const [cieMarks, setCieMarks] = useState(initialCourseData.cieMarks || {});
  const [seeMarks, setSeeMarks] = useState(initialCourseData.seeMarks || {});
  
  // Use ref to store the previous results to avoid infinite loops
  const prevResultsRef = useRef();

  const courseDetails = initialCourseData.courseDetails || null;
  
  // Hack to handle courses like CS222IA which are labeled "Theory+Lab" but categorized as "Lab" in PDF
  const isEffectivelyIntegrated = Boolean(courseDetails && (courseDetails.type === 'Integrated' || courseDetails.cieMax === 150));

  const results = useMemo(() => {
    if (!courseDetails) {
      return { score: '0.00', grade: 'F', points: 0, isPass: false, totalCie: '0.00' };
    }

    let totalCie = 0;
    let finalScore = 0;
    let passCheckMarks = {};

    // Check if user entered total CIE directly
    if (hasTotalCIE(cieMarks)) {
        totalCie = Number(cieMarks.totalCIE) || 0;
        
        // For integrated courses, we need to handle pass check differently
        if (isEffectivelyIntegrated) {
            // When using total CIE for integrated, pass it along with SEE marks
            const totalSEE = (Number(seeMarks.seeTheory) || 0) + (Number(seeMarks.seeLab) || 0);
            finalScore = calculateFinalScore(totalCie, totalSEE, courseDetails.cieMax, courseDetails.seeMax);
            // Pass totalCie and see breakdown for proper pass/fail check
            passCheckMarks = { 
              totalCie, 
              see: totalSEE,
              seeTheory: seeMarks.seeTheory, 
              seeLab: seeMarks.seeLab 
            };
        } else {
            passCheckMarks = { totalCie, see: seeMarks.see };
            finalScore = calculateFinalScore(totalCie, seeMarks.see || 0, courseDetails.cieMax, courseDetails.seeMax);
        }
    } else {
        // Original calculation logic using individual components
        if (courseDetails.type === 'Theory') {
            totalCie = calculateTheoryCIE(cieMarks);
            passCheckMarks = { totalCie, see: seeMarks.see };
            finalScore = calculateFinalScore(totalCie, seeMarks.see || 0, courseDetails.cieMax, courseDetails.seeMax);
        } else if (courseDetails.type === 'English') {
            totalCie = calculateEnglishCIE(cieMarks);
            passCheckMarks = { totalCie, see: seeMarks.see };
            finalScore = calculateFinalScore(totalCie, seeMarks.see || 0, courseDetails.cieMax, courseDetails.seeMax);
        } else if (courseDetails.type === 'CAEG') {
            totalCie = calculateCAEGCIE(cieMarks);
            passCheckMarks = { totalCie, see: seeMarks.see };
            finalScore = calculateFinalScore(totalCie, seeMarks.see || 0, courseDetails.cieMax, courseDetails.seeMax);
        } else if (courseDetails.type === 'FOIC') {
            totalCie = calculateFOICCIE(cieMarks);
            passCheckMarks = { totalCie, see: seeMarks.see };
            finalScore = calculateFinalScore(totalCie, seeMarks.see || 0, courseDetails.cieMax, courseDetails.seeMax);
        } else if (courseDetails.type === 'Yoga') {
            totalCie = calculateYogaCIE(cieMarks);
            passCheckMarks = { totalCie, see: seeMarks.see };
            finalScore = calculateFinalScore(totalCie, seeMarks.see || 0, courseDetails.cieMax, courseDetails.seeMax);
        } else if (courseDetails.type === 'Maths') {
            totalCie = calculateMathsCIE(cieMarks);
            passCheckMarks = { totalCie, see: seeMarks.see };
            finalScore = calculateFinalScore(totalCie, seeMarks.see || 0, courseDetails.cieMax, courseDetails.seeMax);
        } else if (courseDetails.type === 'Kannada') {
            totalCie = calculateKannadaCIE(cieMarks);
            passCheckMarks = { totalCie, see: seeMarks.see };
            finalScore = calculateFinalScore(totalCie, seeMarks.see || 0, courseDetails.cieMax, courseDetails.seeMax);
        } else if (courseDetails.type === 'Lab' && !isEffectivelyIntegrated) {
            totalCie = calculateLabCIE(cieMarks);
            passCheckMarks = { totalCie, see: seeMarks.see };
            finalScore = calculateFinalScore(totalCie, seeMarks.see || 0, courseDetails.cieMax, courseDetails.seeMax);
        } else if (isEffectivelyIntegrated) {
            const { cieTheory, cieLab } = calculateIntegratedCIE(cieMarks);
            totalCie = cieTheory + cieLab;
            passCheckMarks = { cieTheory, cieLab, seeTheory: seeMarks.seeTheory, seeLab: seeMarks.seeLab };
            const totalSEE = (Number(seeMarks.seeTheory) || 0) + (Number(seeMarks.seeLab) || 0);
            finalScore = calculateFinalScore(totalCie, totalSEE, courseDetails.cieMax, courseDetails.seeMax);
        }
    }
    
    const isPass = checkPassStatus(courseDetails, passCheckMarks);
    const { grade, points } = getGradeDetails(finalScore, isPass);

    return { score: finalScore.toFixed(2), grade, points, isPass, totalCie: totalCie.toFixed(2) };
  }, [cieMarks, seeMarks, courseDetails, isEffectivelyIntegrated]);

  useEffect(() => {
    // Only call onUpdate if results have actually changed (compare values, not references)
    const hasChanged = 
      !prevResultsRef.current ||
      prevResultsRef.current.score !== results.score ||
      prevResultsRef.current.grade !== results.grade ||
      prevResultsRef.current.points !== results.points ||
      prevResultsRef.current.isPass !== results.isPass ||
      prevResultsRef.current.totalCie !== results.totalCie;
    
    if (hasChanged) {
      prevResultsRef.current = results;
      onUpdate(id, { courseDetails, cieMarks, seeMarks, results });
    }
  }, [id, courseDetails, cieMarks, seeMarks, results, onUpdate]);

  // Safety check - should not happen with fixed cycle courses, but prevents runtime errors
  if (!courseDetails) {
    return null;
  }

  const handleCieMarkChange = (e) => {
    const { name, value } = e.target;
    
    // If totalCIE is being entered, clear all individual components but preserve isIntegratedLab
    if (name === 'totalCIE' && value !== '') {
      setCieMarks({ 
        totalCIE: value,
        isIntegratedLab: isEffectivelyIntegrated 
      });
    } 
    // If totalCIE is being cleared, set it to undefined
    else if (name === 'totalCIE' && value === '') {
      setCieMarks(prev => ({
        ...prev,
        totalCIE: undefined,
        isIntegratedLab: isEffectivelyIntegrated
      }));
    }
    // For other fields, update normally and clear totalCIE if it exists
    else {
      setCieMarks(prev => ({
        ...prev,
        [name]: value,
        totalCIE: undefined,
        isIntegratedLab: isEffectivelyIntegrated
      }));
    }
  };

  const handleSeeMarkChange = (e) => {
    setSeeMarks(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  return (
    <div className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.01] animate-slideInLeft">
      {/* Glowing border effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-amber-500/30 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative neumorphic p-6 sm:p-8 rounded-2xl">
        {/* Course Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-black gradient-text-cyan">{courseDetails.code}</h3>
                <div className="flex-grow h-px bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
              </div>
              <p className="text-gray-400 mb-4 text-sm">{courseDetails.title}</p>
              <div className="flex gap-3 flex-wrap">
                <span className="px-4 py-2 rounded-xl glass-effect text-xs font-bold text-emerald-300 inline-flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Credits: {courseDetails.credits}
                </span>
                <span className="px-4 py-2 rounded-xl glass-effect text-xs font-bold text-orange-300 inline-flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {courseDetails.type}
                </span>
              </div>
            </div>
          </div>
        </div>

      <>
          <DetailedCIECalculator courseType={courseDetails.type} cieMarks={cieMarks} handleMarkChange={handleCieMarkChange} />
          
          {/* Show required SEE marks if CIE is entered but SEE is not */}
          {results.totalCie > 0 && !isEffectivelyIntegrated && (
            <RequiredSEEDisplay 
              totalCie={parseFloat(results.totalCie)} 
              cieMax={courseDetails.cieMax} 
              seeMax={courseDetails.seeMax}
              hasSeeMarks={seeMarks.see !== undefined && seeMarks.see !== null && seeMarks.see !== ''}
            />
          )}
          
          {/* Show required SEE marks for integrated courses */}
          {results.totalCie > 0 && isEffectivelyIntegrated && (
            <RequiredSEEIntegratedDisplay 
              cieMarks={cieMarks}
              courseDetails={courseDetails}
              seeMarks={seeMarks}
              results={results}
            />
          )}
          
          <div className="p-6 mt-4 glass-effect rounded-xl border border-emerald-500/20">
            <h3 className="text-xl font-bold gradient-text-cyan mb-4 flex items-center gap-2">
              <div className="p-2 rounded-lg glass-effect">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              Semester End Examination (SEE)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isEffectivelyIntegrated ? (
                    <>
                        <InputField name="seeTheory" label="SEE Theory Marks" placeholder={`Out of ${courseDetails.seeBreakdown.theory}`} value={seeMarks.seeTheory} onChange={handleSeeMarkChange} />
                        <InputField name="seeLab" label="SEE Lab Marks" placeholder={`Out of ${courseDetails.seeBreakdown.lab}`} value={seeMarks.seeLab} onChange={handleSeeMarkChange} />
                    </>
                ) : (
                    <InputField name="see" label="SEE Marks" placeholder={`Out of ${courseDetails.seeMax}`} value={seeMarks.see} onChange={handleSeeMarkChange} />
                )}
            </div>
          </div>
          
          {/* Results Display - Redesigned */}
          <div className="mt-6 relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-amber-500/10"></div>
            <div className="relative neumorphic-inset p-6">
              <h3 className="text-lg font-bold gradient-text-cyan mb-4 flex items-center gap-2">
                <div className="p-2 rounded-lg glass-effect">
                  <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                Results Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <ResultDisplay label="Status" value={results.isPass ? 'Pass ✓' : 'Fail ✗'} color={results.isPass ? 'text-emerald-400' : 'text-red-400'} />
                <ResultDisplay label="Total CIE" value={results.totalCie || '0.00'} color="text-emerald-400" />
                <ResultDisplay label="Final Score" value={results.score + '%'} color="text-teal-400" />
                <ResultDisplay label="Grade" value={results.grade} color="text-pink-400" />
                <ResultDisplay label="Points" value={results.points} color="text-amber-400" />
              </div>
            </div>
          </div>
        </>
      </div>
    </div>
  );
}

const InputField = ({ name, label, placeholder, value, onChange }) => (
    <div className="group">
        <label className="block text-sm font-semibold text-gray-400 mb-2 group-focus-within:text-emerald-400 transition-colors duration-200">{label}</label>
        <input 
            type="number" 
            name={name} 
            placeholder={placeholder} 
            value={value || ''} 
            onChange={onChange} 
            className="w-full p-3 neumorphic-inset rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-emerald-500 transition-all duration-300" 
        />
    </div>
);

const ResultDisplay = ({ label, value, color }) => (
    <div className="text-center p-4 rounded-xl glass-effect hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300 transform hover:scale-105">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">{label}</p>
        <p className={`font-black text-2xl ${color}`}>{value ?? '-'}</p>
    </div>
);

const RequiredSEEDisplay = ({ totalCie, cieMax, seeMax, hasSeeMarks }) => {
    if (hasSeeMarks) return null; // Don't show if SEE marks are already entered
    
    const requiredSEE = calculateRequiredSEE(totalCie, cieMax, seeMax);
    if (!requiredSEE) return null;
    
    return (
        <div className="p-6 mt-4 relative overflow-hidden rounded-xl glass-effect border border-emerald-500/20">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-amber-500/5"></div>
            <div className="relative">
                <h3 className="text-lg font-bold gradient-text-cyan mb-4 flex items-center gap-2">
                    <div className="p-2 rounded-lg glass-effect">
                        <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                    </div>
                    Required SEE Marks for Grades
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(requiredSEE).map(([grade, info]) => (
                        <div key={grade} className={`p-4 rounded-xl glass-effect transition-all duration-300 hover:scale-105 ${info.achievable ? 'border border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]'}`}>
                            <div className="text-center">
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Grade {grade}</p>
                                <p className={`font-black text-3xl ${info.achievable ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {info.required}
                                </p>
                                <p className="text-xs text-gray-500 mt-2 font-semibold">out of {seeMax}</p>
                                {info.note && <p className="text-xs text-gray-500 mt-1 italic">{info.note}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const RequiredSEEIntegratedDisplay = ({ cieMarks, courseDetails, seeMarks, results }) => {
    // Check if SEE marks are already entered
    const hasSeeTheory = seeMarks.seeTheory !== undefined && seeMarks.seeTheory !== null && seeMarks.seeTheory !== '';
    const hasSeeLab = seeMarks.seeLab !== undefined && seeMarks.seeLab !== null && seeMarks.seeLab !== '';
    
    // Don't show if both SEE marks are already entered
    if (hasSeeTheory && hasSeeLab) return null;
    
    // Calculate CIE values
    let cieTheory = 0;
    let cieLab = 0;
    let isEstimated = false;
    
    if (hasTotalCIE(cieMarks)) {
        // If total CIE is entered, we estimate the breakdown proportionally
        // Note: This is an estimate and may not reflect actual theory/lab split
        const totalCie = Number(cieMarks.totalCIE) || 0;
        const theoryRatio = courseDetails.cieBreakdown.theory / courseDetails.cieMax;
        const labRatio = courseDetails.cieBreakdown.lab / courseDetails.cieMax;
        cieTheory = totalCie * theoryRatio;
        cieLab = totalCie * labRatio;
        isEstimated = true;
    } else {
        // Calculate from individual components
        const integrated = calculateIntegratedCIE(cieMarks);
        cieTheory = integrated.cieTheory;
        cieLab = integrated.cieLab;
    }
    
    const requiredSEE = calculateRequiredSEEIntegrated(
        cieTheory, 
        cieLab, 
        courseDetails.cieBreakdown, 
        courseDetails.seeBreakdown,
        courseDetails.cieMax,
        courseDetails.seeMax
    );
    
    if (!requiredSEE) return null;
    
    return (
        <div className="p-5 mt-4 relative overflow-hidden rounded-xl border border-pink-500/30">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-900/30 to-teal-900/30"></div>
            <div className="relative">
                <h3 className="text-lg font-bold text-pink-300 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    Required SEE Marks for Grades (Theory + Lab)
                </h3>
                {isEstimated && (
                    <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                        <p className="text-xs text-yellow-300 flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Note: Theory/Lab breakdown is estimated based on total CIE. For more accurate requirements, enter individual CIE components.
                        </p>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Object.entries(requiredSEE).map(([grade, info]) => {
                        const cardClassName = `p-4 rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                            info.achievable 
                                ? 'bg-gray-800/50 border border-green-500/30' 
                                : 'bg-red-900/20 border border-red-500/30'
                        }`;
                        
                        return (
                        <div key={grade} className={cardClassName}>
                            <div className="text-center">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Grade {grade}</p>
                                
                                {/* Total Required */}
                                <div className="mb-3 pb-3 border-b border-gray-700/50">
                                    <p className="text-xs text-gray-500 mb-1">Total SEE</p>
                                    <p className={`font-bold text-xl ${info.achievable ? 'text-green-400' : 'text-red-400'} drop-shadow-lg`}>
                                        {info.required}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">out of {courseDetails.seeMax}</p>
                                </div>
                                
                                {/* Theory Required */}
                                <div className="mb-2">
                                    <p className="text-xs text-teal-400 mb-1">Theory</p>
                                    <p className={`font-semibold text-sm ${info.achievable ? 'text-teal-300' : 'text-red-300'}`}>
                                        {info.requiredTheory} / {info.theoryMax}
                                    </p>
                                </div>
                                
                                {/* Lab Required */}
                                <div className="mb-2">
                                    <p className="text-xs text-pink-400 mb-1">Lab</p>
                                    <p className={`font-semibold text-sm ${info.achievable ? 'text-pink-300' : 'text-red-300'}`}>
                                        {info.requiredLab} / {info.labMax}
                                    </p>
                                </div>
                                
                                {info.note && (
                                    <p className="text-xs text-gray-500 mt-2 italic">{info.note}</p>
                                )}
                            </div>
                        </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
