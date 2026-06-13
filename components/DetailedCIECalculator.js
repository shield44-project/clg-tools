// components/DetailedCIECalculator.js
import { hasTotalCIE } from '../lib/calculator';

const InputField = ({ name, label, placeholder, value, onChange }) => (
    <div className="group">
        <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-emerald-400 transition-colors duration-200">{label}</label>
        <input
            type="number"
            name={name}
            placeholder={placeholder}
            value={value || ''}
            onChange={onChange}
            className="glass-input text-sm"
        />
    </div>
);

export default function DetailedCIECalculator({ courseType, cieMarks, handleMarkChange }) {
    if (!courseType || courseType === 'None') return null;

    // Check if user has entered total CIE directly
    const hasTotalCIEEntered = hasTotalCIE(cieMarks);
    
    const renderTheoryInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-emerald-400 flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Quizzes (Total 20 Marks)
            </h4>
            <InputField name="quiz1" label="Quiz 1" placeholder="Out of 10" value={cieMarks.quiz1} onChange={handleMarkChange} />
            <InputField name="quiz2" label="Quiz 2" placeholder="Out of 10" value={cieMarks.quiz2} onChange={handleMarkChange} />
            
            <h4 className="col-span-full mt-4 text-lg font-semibold text-emerald-400 flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Tests (Best 2 of 3, reduced to 40 Marks)
            </h4>
            <InputField name="test1" label="Test 1" placeholder="Out of 50" value={cieMarks.test1} onChange={handleMarkChange} />
            <InputField name="test2" label="Test 2" placeholder="Out of 50" value={cieMarks.test2} onChange={handleMarkChange} />
            <InputField name="test3" label="Test 3" placeholder="Out of 50" value={cieMarks.test3} onChange={handleMarkChange} />

            <h4 className="col-span-full mt-4 text-lg font-semibold text-emerald-400 flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Experiential Learning (Total 40 Marks)
            </h4>
            <InputField name="expLearning" label="Program/Seminar/MATLAB etc." placeholder="Out of 40" value={cieMarks.expLearning} onChange={handleMarkChange} />
        </>
    );

    // For pure labs like IDEA LAB (pg 74)
    const renderLabInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-emerald-400 flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Lab CIE (Total 50 Marks)
            </h4>
            <InputField name="labRecord" label="Conduction, Report, Observation" placeholder="Out of 20" value={cieMarks.labRecord} onChange={handleMarkChange} />
            <InputField name="labTest" label="Lab Test" placeholder="Out of 10" value={cieMarks.labTest} onChange={handleMarkChange} />
            <InputField name="innovativeExp" label="Innovative Experiment/Concept Design" placeholder="Out of 20" value={cieMarks.innovativeExp} onChange={handleMarkChange} />
        </>
    );

    // For English courses (HS111EL, HS121EL)
    const renderEnglishInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-emerald-400 flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Assessment Components
            </h4>
            <InputField name="modules" label="Modules" placeholder="Out of 10" value={cieMarks.modules} onChange={handleMarkChange} />
            <InputField name="labTest" label="Lab Test" placeholder="Out of 20" value={cieMarks.labTest} onChange={handleMarkChange} />
            <InputField name="expLearning" label="Experiential Learning" placeholder="Out of 20" value={cieMarks.expLearning} onChange={handleMarkChange} />
        </>
    );

    // For CAEG courses (ME112GL, ME122GL)
    const renderCAEGInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-emerald-400 flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                CIEs (Best of 2 Manual CIEs + 1 Lab CIE)
            </h4>
            <InputField name="manualCie1" label="Manual CIE 1" placeholder="Out of 50" value={cieMarks.manualCie1} onChange={handleMarkChange} />
            <InputField name="manualCie2" label="Manual CIE 2" placeholder="Out of 50" value={cieMarks.manualCie2} onChange={handleMarkChange} />
            <InputField name="labCie" label="Lab CIE" placeholder="Out of 50" value={cieMarks.labCie} onChange={handleMarkChange} />
            
            <h4 className="col-span-full mt-4 text-lg font-semibold text-emerald-400 flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Additional Components
            </h4>
            <InputField name="labRecord" label="Lab Record" placeholder="Out of 80" value={cieMarks.labRecord} onChange={handleMarkChange} />
            <InputField name="expLearning" label="Experiential Learning" placeholder="Out of 20" value={cieMarks.expLearning} onChange={handleMarkChange} />
        </>
    );

    // For FOIC course (HS114TC)
    const renderFOICInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-emerald-400 flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Quizzes (Average of 2)
            </h4>
            <InputField name="quiz1" label="Quiz 1" placeholder="Out of 10" value={cieMarks.quiz1} onChange={handleMarkChange} />
            <InputField name="quiz2" label="Quiz 2" placeholder="Out of 10" value={cieMarks.quiz2} onChange={handleMarkChange} />
            
            <h4 className="col-span-full mt-4 text-lg font-semibold text-emerald-400 flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Tests (Total 100, reduced to 20)
            </h4>
            <InputField name="test1" label="Test 1" placeholder="Out of 50" value={cieMarks.test1} onChange={handleMarkChange} />
            <InputField name="test2" label="Test 2" placeholder="Out of 50" value={cieMarks.test2} onChange={handleMarkChange} />

            <h4 className="col-span-full mt-4 text-lg font-semibold text-emerald-400 flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Experiential Learning
            </h4>
            <InputField name="expLearning" label="EL (40 reduced to 20)" placeholder="Out of 40" value={cieMarks.expLearning} onChange={handleMarkChange} />
        </>
    );

    // For Yoga course (HS115YL)
    const renderYogaInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-emerald-400 flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Assessments
            </h4>
            <InputField name="quiz" label="Quiz" placeholder="Out of 10" value={cieMarks.quiz} onChange={handleMarkChange} />
            <InputField name="test" label="Test (40 reduced to 30)" placeholder="Out of 40" value={cieMarks.test} onChange={handleMarkChange} />
            <InputField name="expLearning" label="Experiential Learning" placeholder="Out of 10" value={cieMarks.expLearning} onChange={handleMarkChange} />
        </>
    );

    // For Maths courses
    const renderMathsInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-emerald-400 flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Quizzes (Total 20 Marks)
            </h4>
            <InputField name="quiz1" label="Quiz 1" placeholder="Out of 10" value={cieMarks.quiz1} onChange={handleMarkChange} />
            <InputField name="quiz2" label="Quiz 2" placeholder="Out of 10" value={cieMarks.quiz2} onChange={handleMarkChange} />
            
            <h4 className="col-span-full mt-4 text-lg font-semibold text-emerald-400 flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Tests (Best 2 of 3, reduced to 40 Marks)
            </h4>
            <InputField name="test1" label="Test 1" placeholder="Out of 50" value={cieMarks.test1} onChange={handleMarkChange} />
            <InputField name="test2" label="Test 2" placeholder="Out of 50" value={cieMarks.test2} onChange={handleMarkChange} />
            <InputField name="test3" label="Test 3" placeholder="Out of 50" value={cieMarks.test3} onChange={handleMarkChange} />

            <h4 className="col-span-full mt-4 text-lg font-semibold text-emerald-400 flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Additional Components
            </h4>
            <InputField name="expLearning" label="Experiential Learning" placeholder="Out of 20" value={cieMarks.expLearning} onChange={handleMarkChange} />
            <InputField name="matlab" label="MATLAB" placeholder="Out of 20" value={cieMarks.matlab} onChange={handleMarkChange} />
        </>
    );

    // For Kannada course (HS12XKB)
    const renderKannadaInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-emerald-400 flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Quizzes (5 + 5 = 10 Marks, direct)
            </h4>
            <InputField name="quiz1" label="Quiz 1" placeholder="Out of 5" value={cieMarks.quiz1} onChange={handleMarkChange} />
            <InputField name="quiz2" label="Quiz 2" placeholder="Out of 5" value={cieMarks.quiz2} onChange={handleMarkChange} />
            
            <h4 className="col-span-full mt-4 text-lg font-semibold text-emerald-400 flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Tests (25 + 25 reduced to 20 Marks)
            </h4>
            <InputField name="test1" label="Test 1" placeholder="Out of 25" value={cieMarks.test1} onChange={handleMarkChange} />
            <InputField name="test2" label="Test 2" placeholder="Out of 25" value={cieMarks.test2} onChange={handleMarkChange} />

            <h4 className="col-span-full mt-4 text-lg font-semibold text-emerald-400 flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Experiential Learning (20 Marks, direct)
            </h4>
            <InputField name="expLearning" label="Experiential Learning" placeholder="Out of 20" value={cieMarks.expLearning} onChange={handleMarkChange} />
        </>
    );

    // For the Lab part of Integrated courses (pg 31)
    const renderIntegratedLabInputs = () => (
         <div className='col-span-full p-4 border border-orange-300/25 rounded-xl bg-orange-300/10'>
            <h3 className="text-xl font-bold text-orange-200 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd" />
                </svg>
                Lab Components (50 Marks)
            </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField name="labRecord" label="Conduction, Report, Observation, Analysis" placeholder="Out of 40" value={cieMarks.labRecord} onChange={handleMarkChange} />
                <InputField name="labTest" label="Lab Test" placeholder="Out of 10" value={cieMarks.labTest} onChange={handleMarkChange} />
            </div>
        </div>
    )

    const renderIntegratedInputs = () => (
        <>
            <div className='col-span-full p-4 border border-emerald-500/30 rounded-xl bg-teal-900/10'>
                <h3 className="text-xl font-bold text-teal-300 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    Theory Components (100 Marks)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderTheoryInputs()}
                </div>
            </div>
            {renderIntegratedLabInputs()}
        </>
    );
    
    // Some "Lab" courses like CS222IA follow the Integrated marking scheme
    const isEffectivelyIntegrated = courseType === 'Integrated' || (courseType === 'Lab' && cieMarks.isIntegratedLab);
    
    // Determine the max CIE value based on course type
    const getCIEMax = () => {
        if (isEffectivelyIntegrated) return 150;
        if (courseType === 'Theory' || courseType === 'Maths') return 100;
        return 50; // Lab, English, CAEG, FOIC, Yoga, Kannada
    };

    return (
        <div className="p-5 mt-4 rounded-xl border border-white/10 bg-white/[0.055] backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Continuous Internal Evaluation (CIE)
            </h3>
            
            {/* Total CIE Input Section */}
            <div className="mb-6 p-4 rounded-xl border border-cyan-300/20 bg-cyan-300/10">
                <h4 className="text-lg font-semibold text-cyan-100 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    Total CIE Marks (Optional)
                </h4>
                <p className="text-sm text-gray-400 mb-3">
                    Enter your total CIE marks here to skip individual component entry. Once entered, individual fields will be hidden.
                </p>
                {isEffectivelyIntegrated && (
                    <p className="text-sm text-yellow-400 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Note: For integrated courses, entering Total CIE will not verify individual theory/lab pass requirements. Use individual components for accurate pass/fail validation.
                    </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField 
                        name="totalCIE" 
                        label="Total CIE Marks" 
                        placeholder={`Out of ${getCIEMax()}`} 
                        value={cieMarks.totalCIE} 
                        onChange={handleMarkChange} 
                    />
                    {hasTotalCIEEntered && (
                        <button
                            type="button"
                            onClick={() => handleMarkChange({ target: { name: 'totalCIE', value: '' } })}
                            className="self-end px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 hover:bg-red-500/30 transition-all duration-300"
                        >
                            Clear & Enter Individual Components
                        </button>
                    )}
                </div>
            </div>
            
            {/* Individual CIE Components - Only show if Total CIE is not entered */}
            {!hasTotalCIEEntered && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courseType === 'Theory' && renderTheoryInputs()}
                    {courseType === 'Lab' && renderLabInputs()}
                    {courseType === 'English' && renderEnglishInputs()}
                    {courseType === 'CAEG' && renderCAEGInputs()}
                    {courseType === 'FOIC' && renderFOICInputs()}
                    {courseType === 'Yoga' && renderYogaInputs()}
                    {courseType === 'Maths' && renderMathsInputs()}
                    {courseType === 'Kannada' && renderKannadaInputs()}
                    {isEffectivelyIntegrated && renderIntegratedInputs()}
                </div>
            )}
            
            {/* Message when Total CIE is entered */}
            {hasTotalCIEEntered && (
                <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
                    <p className="text-green-300 text-sm flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Total CIE marks entered. Individual components are hidden. Click the button above to clear and enter individual components.
                    </p>
                </div>
            )}
        </div>
    );
}
