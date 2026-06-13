// lib/calculator.js
import { gradingSystem } from './data';

// Helper function to check if total CIE is entered
export const hasTotalCIE = (cieMarks) => {
  return cieMarks.totalCIE !== undefined && cieMarks.totalCIE !== null && cieMarks.totalCIE !== '';
};

// Rubric for THEORY CIE (e.g., page 13 of PDF)
export const calculateTheoryCIE = (cieMarks) => {
  const { quiz1, quiz2, test1, test2, test3, expLearning } = cieMarks;
  
  const quizTotal = (Number(quiz1) || 0) + (Number(quiz2) || 0); // Max 20

  const tests = [Number(test1) || 0, Number(test2) || 0, Number(test3) || 0].sort((a, b) => b - a);
  const testTotal = ((tests[0] + tests[1]) / 100) * 40; // Best 2 of 3 (out of 100) reduced to 40

  const expLearningTotal = Number(expLearning) || 0; // Max 40

  return Math.min(100, quizTotal + testTotal + expLearningTotal);
};

// Rubric for LAB CIE (e.g., page 74 for IDEA LAB)
export const calculateLabCIE = (cieMarks) => {
    const { labRecord, labTest, innovativeExp } = cieMarks;
    const total = (Number(labRecord) || 0) + (Number(labTest) || 0) + (Number(innovativeExp) || 0);
    return Math.min(50, total);
};

// Rubric for English CIE (HS111EL, HS121EL)
// Modules: 10 marks, Lab test: 20 marks, EL: 20 marks = 50 CIE total
export const calculateEnglishCIE = (cieMarks) => {
    const { modules, labTest, expLearning } = cieMarks;
    
    const modulesTotal = Number(modules) || 0; // Out of 10
    const labTestTotal = Number(labTest) || 0; // Out of 20
    const expLearningTotal = Number(expLearning) || 0; // Out of 20
    
    return Math.min(50, modulesTotal + labTestTotal + expLearningTotal);
};

// Rubric for CAEG CIE (ME112GL, ME122GL)
// Lab record 20, lab test 20, EL 10 = 50 CIE
// Three CIEs (2 manual, 1 lab), best of 2 manuals taken
// Manual + lab test = 100 reduced to 20, lab record 80 reduced to 20, EL 20 reduced to 10
export const calculateCAEGCIE = (cieMarks) => {
    const { manualCie1, manualCie2, labCie, labRecord, expLearning } = cieMarks;
    
    // Best of 2 manual CIEs (each out of 50)
    const manual1 = Number(manualCie1) || 0;
    const manual2 = Number(manualCie2) || 0;
    const bestManual = Math.max(manual1, manual2);
    
    const lab = Number(labCie) || 0; // Out of 50
    
    // Manual + Lab = 100, reduced to 20
    const manualLabTotal = bestManual + lab; // Out of 100
    const manualLabReduced = (manualLabTotal / 100) * 20;
    
    // Lab record 80 reduced to 20
    const labRecordValue = Number(labRecord) || 0; // Out of 80
    const labRecordReduced = (labRecordValue / 80) * 20;
    
    // EL 20 reduced to 10
    const expLearningValue = Number(expLearning) || 0; // Out of 20
    const expLearningReduced = (expLearningValue / 20) * 10;
    
    return Math.min(50, manualLabReduced + labRecordReduced + expLearningReduced);
};

// Rubric for FOIC CIE (HS114TC)
// 2 quizzes (10 each, averaged), 2 tests (50 each, total 100 reduced to 20), EL 40 reduced to 20 = 50 CIE
export const calculateFOICCIE = (cieMarks) => {
    const { quiz1, quiz2, test1, test2, expLearning } = cieMarks;
    
    // Average of 2 quizzes
    const quiz1Value = Number(quiz1) || 0;
    const quiz2Value = Number(quiz2) || 0;
    const quizAverage = (quiz1Value + quiz2Value) / 2; // Out of 10
    
    // 2 tests, 50 each, total 100 reduced to 20
    const test1Value = Number(test1) || 0;
    const test2Value = Number(test2) || 0;
    const testTotal = test1Value + test2Value; // Out of 100
    const testReduced = (testTotal / 100) * 20;
    
    // EL 40 reduced to 20
    const expLearningValue = Number(expLearning) || 0; // Out of 40
    const expLearningReduced = (expLearningValue / 40) * 20;
    
    return Math.min(50, quizAverage + testReduced + expLearningReduced);
};

// Rubric for Yoga CIE (HS115YL)
// 1 quiz (10), 1 test (40 reduced to 30), EL 10 = 50 CIE
export const calculateYogaCIE = (cieMarks) => {
    const { quiz, test, expLearning } = cieMarks;
    
    const quizValue = Number(quiz) || 0; // Out of 10
    
    // Test 40 reduced to 30
    const testValue = Number(test) || 0; // Out of 40
    const testReduced = (testValue / 40) * 30;
    
    const expLearningValue = Number(expLearning) || 0; // Out of 10
    
    return Math.min(50, quizValue + testReduced + expLearningValue);
};

// Rubric for Maths CIE - separate EL to 20 marks and add MATLAB section for 20 marks
export const calculateMathsCIE = (cieMarks) => {
    const { quiz1, quiz2, test1, test2, test3, expLearning, matlab } = cieMarks;
    
    const quizTotal = (Number(quiz1) || 0) + (Number(quiz2) || 0); // Max 20

    const tests = [Number(test1) || 0, Number(test2) || 0, Number(test3) || 0].sort((a, b) => b - a);
    const testTotal = ((tests[0] + tests[1]) / 100) * 40; // Best 2 of 3 (out of 100) reduced to 40

    const expLearningTotal = Number(expLearning) || 0; // Max 20 (changed from 40)
    const matlabTotal = Number(matlab) || 0; // Max 20

    return Math.min(100, quizTotal + testTotal + expLearningTotal + matlabTotal);
};

// Rubric for Kannada CIE (HS12XKB)
// 2 quizzes (5 each, direct total 10), 2 tests (25 each, total 50 reduced to 20), EL 20 direct = 50 CIE
export const calculateKannadaCIE = (cieMarks) => {
    const { quiz1, quiz2, test1, test2, expLearning } = cieMarks;
    
    // 2 quizzes, each out of 5, added directly
    const quiz1Value = Math.min(5, Number(quiz1) || 0);
    const quiz2Value = Math.min(5, Number(quiz2) || 0);
    const quizTotal = quiz1Value + quiz2Value; // Direct total 10

    // 2 tests, each out of 25, total 50 reduced to 20
    const test1Value = Math.min(25, Number(test1) || 0); // Out of 25
    const test2Value = Math.min(25, Number(test2) || 0); // Out of 25
    const testTotal = ((test1Value + test2Value) / 50) * 20; // Total 50 reduced to 20

    const expLearningValue = Math.min(20, Number(expLearning) || 0); // Out of 20
    
    return Math.min(50, quizTotal + testTotal + expLearningValue);
};

// Rubric for INTEGRATED CIE (e.g., page 31 for Physics)
export const calculateIntegratedCIE = (cieMarks) => {
    const { quiz1, quiz2, test1, test2, test3, expLearning, labRecord, labTest } = cieMarks;
    
    // Theory Part (100 Marks)
    const quizTotal = (Number(quiz1) || 0) + (Number(quiz2) || 0);
    const tests = [Number(test1) || 0, Number(test2) || 0, Number(test3) || 0].sort((a, b) => b - a);
    const testTotal = ((tests[0] + tests[1]) / 100) * 40;
    const expLearningTotal = Number(expLearning) || 0;
    const theoryCIETotal = Math.min(100, quizTotal + testTotal + expLearningTotal);

    // Lab Part (50 Marks)
    const labCIETotal = (Number(labRecord) || 0) + (Number(labTest) || 0);
    
    return {
        cieTheory: theoryCIETotal,
        cieLab: Math.min(50, labCIETotal),
    }
};

export const calculateFinalScore = (cieMarks, seeMarks, cieMax, seeMax) => {
  if (cieMax === 0 || seeMax === 0) return 0;
  const weightedCIE = (cieMarks / cieMax) * 50;
  const weightedSEE = (seeMarks / seeMax) * 50;
  return weightedCIE + weightedSEE;
};

export const getGradeDetails = (finalScore, isPass) => {
  if (!isPass) {
    return { grade: 'F', points: 0 };
  }
  const score = Math.round(finalScore);
  for (const level of gradingSystem) {
    if (score >= level.min && score <= level.max) {
      return { grade: level.grade, points: level.points };
    }
  }
  if (score > 100) return { grade: 'O', points: 10 };
  return { grade: 'F', points: 0 };
};

export const checkPassStatus = (course, marks) => {
  // IMPORTANT: Passing standards are based on the old images, as they are not in the new PDF.
  // Theory: CIE >= 40%, SEE >= 35%, Aggregate >= 40%
  // Lab: CIE >= 40%, SEE >= 35%, Aggregate >= 40%
  // Integrated: CIE(Theory) >= 40%, CIE(Lab) >= 40%, SEE(Theory) >= 35%, SEE(Lab) >= 35%, Aggregate >= 40%
  
  const { type, cieMax, seeMax, cieBreakdown, seeBreakdown } = course;
  const { totalCie, see, seeTheory, seeLab, cieTheory, cieLab } = marks;

  // Handle special course types (English, CAEG, FOIC, Yoga, Maths, Kannada) same as Theory
  if (type === 'Theory' || type === 'English' || type === 'CAEG' || type === 'FOIC' || type === 'Yoga' || type === 'Maths' || type === 'Kannada' || (type === 'Lab' && cieMax !== 150)) {
    const ciePercent = (totalCie / cieMax) * 100;
    const seePercent = ((see || 0) / seeMax) * 100;
    const aggregate = calculateFinalScore(totalCie, see || 0, cieMax, seeMax);
    return ciePercent >= 40 && seePercent >= 35 && aggregate >= 40;
  }
  
  if (type === 'Integrated' || (type === 'Lab' && cieMax === 150) ) { // Integrated courses & some labs like CS222IA
    const safeCieBreakdown = cieBreakdown || { theory: 100, lab: 50 }; // Default for safety
    const safeSeeBreakdown = seeBreakdown || { theory: 100, lab: 50 };

    // Check if we have broken down CIE values
    let effectiveCieTheory = cieTheory;
    let effectiveCieLab = cieLab;
    let effectiveSeeTheory = seeTheory;
    let effectiveSeeLab = seeLab;

    // If totalCie is provided but not broken down, estimate the breakdown proportionally
    if (totalCie !== undefined && (cieTheory === undefined || cieLab === undefined)) {
      const theoryRatio = safeCieBreakdown.theory / cieMax;
      const labRatio = safeCieBreakdown.lab / cieMax;
      effectiveCieTheory = totalCie * theoryRatio;
      effectiveCieLab = totalCie * labRatio;
    }

    // If see total is provided but not broken down, estimate the breakdown proportionally
    if (see !== undefined && (seeTheory === undefined || seeLab === undefined)) {
      const theoryRatio = safeSeeBreakdown.theory / seeMax;
      const labRatio = safeSeeBreakdown.lab / seeMax;
      effectiveSeeTheory = see * theoryRatio;
      effectiveSeeLab = see * labRatio;
    }

    const cieTheoryPercent = (effectiveCieTheory / safeCieBreakdown.theory) * 100;
    const cieLabPercent = (effectiveCieLab / safeCieBreakdown.lab) * 100;
    const seeTheoryPercent = ((effectiveSeeTheory || 0) / safeSeeBreakdown.theory) * 100;
    const seeLabPercent = ((effectiveSeeLab || 0) / safeSeeBreakdown.lab) * 100;

    const totalCIE = Number(effectiveCieTheory || 0) + Number(effectiveCieLab || 0);
    const totalSEE = Number(effectiveSeeTheory || 0) + Number(effectiveSeeLab || 0);
    const aggregate = calculateFinalScore(totalCIE, totalSEE, cieMax, seeMax);

    const ciePass = cieTheoryPercent >= 40 && cieLabPercent >= 40;
    const seePass = seeTheoryPercent >= 35 && seeLabPercent >= 35;
    const aggregatePass = aggregate >= 40;

    return ciePass && seePass && aggregatePass;
  }

  return false;
};

export const calculateSGPA = (courses) => {
  let totalCredits = 0;
  let totalWeightedPoints = 0;

  courses.forEach(course => {
    if (course.courseDetails && course.courseDetails.credits > 0) {
      totalCredits += course.courseDetails.credits;
      if (course.results.isPass) { // Only add points if the student passed
         totalWeightedPoints += course.results.points * course.courseDetails.credits;
      }
    }
  });

  if (totalCredits === 0) return 0;
  return (totalWeightedPoints / totalCredits).toFixed(2);
};

// Calculate required SEE marks to achieve different grades
export const calculateRequiredSEE = (cieMarks, cieMax, seeMax) => {
  if (!cieMarks || cieMarks === 0) return null;
  
  const weightedCIE = (cieMarks / cieMax) * 50;
  const results = {};
  
  gradingSystem.forEach(grade => {
    if (grade.grade !== 'F') {
      // For each grade, calculate required SEE marks
      // Final score = weightedCIE + weightedSEE
      // weightedSEE = (seeMarks / seeMax) * 50
      // We need: weightedCIE + weightedSEE >= grade.min
      const requiredWeightedSEE = grade.min - weightedCIE;
      const requiredSEE = (requiredWeightedSEE * seeMax) / 50;
      
      // Check if it's achievable (SEE must be >= 35% and <= 100%)
      const minSEE = seeMax * 0.35; // 35% minimum
      const achievableSEE = Math.max(minSEE, Math.min(seeMax, requiredSEE));
      
      if (achievableSEE <= seeMax && requiredSEE >= minSEE) {
        results[grade.grade] = {
          required: Math.ceil(achievableSEE),
          achievable: requiredSEE <= seeMax
        };
      } else if (requiredSEE < minSEE) {
        results[grade.grade] = {
          required: Math.ceil(minSEE),
          achievable: true,
          note: 'Already achievable with minimum SEE'
        };
      } else {
        results[grade.grade] = {
          required: seeMax,
          achievable: false,
          note: 'Not achievable'
        };
      }
    }
  });
  
  return results;
};

// Calculate required SEE marks for integrated courses (with theory and lab breakdown)
export const calculateRequiredSEEIntegrated = (cieTheory, cieLab, cieBreakdown, seeBreakdown, cieMax, seeMax) => {
  // Validate inputs - check for null/undefined, 0 is a valid score
  if (cieTheory == null && cieLab == null) return null;
  if (!cieBreakdown || !seeBreakdown) return null;
  
  const totalCie = (Number(cieTheory) || 0) + (Number(cieLab) || 0);
  if (totalCie === 0) return null;
  
  const weightedCIE = (totalCie / cieMax) * 50;
  const results = {};
  
  gradingSystem.forEach(grade => {
    if (grade.grade !== 'F') {
      // Calculate required total SEE marks
      const requiredWeightedSEE = grade.min - weightedCIE;
      const requiredTotalSEE = (requiredWeightedSEE * seeMax) / 50;
      
      // SEE must be >= 35% for both theory and lab
      const minSEETheory = seeBreakdown.theory * 0.35;
      const minSEELab = seeBreakdown.lab * 0.35;
      const minTotalSEE = minSEETheory + minSEELab;
      
      // Check if the required total is achievable
      if (requiredTotalSEE <= seeMax && requiredTotalSEE >= minTotalSEE) {
        // Distribute the required SEE proportionally between theory and lab
        // while respecting minimum requirements
        const theoryRatio = seeBreakdown.theory / seeMax;
        const labRatio = seeBreakdown.lab / seeMax;
        
        let requiredSEETheory = requiredTotalSEE * theoryRatio;
        let requiredSEELab = requiredTotalSEE * labRatio;
        
        // Ensure minimum requirements are met
        requiredSEETheory = Math.max(minSEETheory, requiredSEETheory);
        requiredSEELab = Math.max(minSEELab, requiredSEELab);
        
        // Adjust if the sum exceeds required total due to minimum constraints
        // This can happen when minimum requirements force us above the calculated total
        const totalWithMinimums = requiredSEETheory + requiredSEELab;
        if (totalWithMinimums > requiredTotalSEE) {
          // Use minimums as the actual requirement since they're mandatory
          requiredSEETheory = minSEETheory;
          requiredSEELab = minSEELab;
        }
        
        results[grade.grade] = {
          required: Math.ceil(Math.max(requiredTotalSEE, minSEETheory + minSEELab)),
          requiredTheory: Math.ceil(requiredSEETheory),
          requiredLab: Math.ceil(requiredSEELab),
          achievable: requiredTotalSEE <= seeMax,
          theoryMax: seeBreakdown.theory,
          labMax: seeBreakdown.lab
        };
      } else if (requiredTotalSEE < minTotalSEE) {
        results[grade.grade] = {
          required: Math.ceil(minTotalSEE),
          requiredTheory: Math.ceil(minSEETheory),
          requiredLab: Math.ceil(minSEELab),
          achievable: true,
          note: 'Already achievable with minimum SEE',
          theoryMax: seeBreakdown.theory,
          labMax: seeBreakdown.lab
        };
      } else {
        // Not achievable even with max SEE marks
        results[grade.grade] = {
          required: seeMax,
          requiredTheory: seeBreakdown.theory,
          requiredLab: seeBreakdown.lab,
          achievable: false,
          note: 'Not achievable',
          theoryMax: seeBreakdown.theory,
          labMax: seeBreakdown.lab
        };
      }
    }
  });
  
  return results;
};
