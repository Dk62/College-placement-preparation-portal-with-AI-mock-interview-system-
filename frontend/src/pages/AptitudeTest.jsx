import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AptitudeTest = () => {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [testId, setTestId] = useState(null);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (!user || user.role !== 'Student') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-bold text-red-500">Access Denied</h2>
        <p className="text-gray-500 mt-2">Only students can access aptitude tests.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 bg-[#1e3a8a] text-white px-4 py-2 rounded">Go Back</button>
      </div>
    );
  }

  const generateTest = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/tests/generate',
        { domain, count: 5 },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setQuestions(response.data.data);
        setTestId(response.data.testId);
      }
    } catch (error) {
      console.error('Error generating test:', error);
      alert('Failed to generate test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option) => {
    setAnswers({
      ...answers,
      [currentQuestion]: option
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    let calculatedScore = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct) {
        calculatedScore++;
      }
    });
    
    setScore(calculatedScore);
    setSubmitted(true);
    
    // Submit result to backend
    try {
      await axios.post(
        `http://localhost:5000/api/tests/${testId}/submit`,
        { 
          score: calculatedScore, 
          accuracy_percentage: (calculatedScore / questions.length) * 100 
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Failed to submit test results:', error);
    }
  };

  if (!questions) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 text-center">
        <div className="w-16 h-16 bg-blue-100 text-[#1e3a8a] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        </div>
        <h2 className="text-3xl font-bold mb-2">AI Test Generator</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Enter a topic or domain to generate a dynamic aptitude test using AI.</p>
        
        <input 
          type="text" 
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="e.g. React.js, Data Structures, General Aptitude..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-[#1e3a8a] focus:outline-none mb-6 text-gray-900 dark:text-white"
        />
        
        <button 
          onClick={generateTest}
          disabled={loading || !domain.trim()}
          className="w-full bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all disabled:opacity-70 flex justify-center items-center"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Test...
            </span>
          ) : 'Generate Test'}
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 text-center">
        <h2 className="text-3xl font-bold mb-4">Test Submitted!</h2>
        <div className="w-48 h-48 mx-auto rounded-full border-8 border-[#1e3a8a] flex items-center justify-center mb-6">
          <span className="text-5xl font-bold text-[#1e3a8a]">{Math.round((score / questions.length) * 100)}%</span>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          You scored {score} out of {questions.length}.
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-8 bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">AI Technical Test</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Topic: {domain}</p>
        </div>
        <span className="bg-blue-100 text-[#1e3a8a] px-4 py-2 rounded-full font-bold">
          Question {currentQuestion + 1} / {questions.length}
        </span>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700">
        <h2 className="text-xl font-medium mb-6">{question.question}</h2>

        <div className="space-y-4">
          {question.options.map((option, idx) => (
            <div 
              key={idx}
              onClick={() => handleOptionSelect(option)}
              className={`p-4 border rounded-xl cursor-pointer transition-all ${
                answers[currentQuestion] === option 
                  ? 'border-[#1e3a8a] bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
                  : 'border-gray-200 dark:border-slate-600 hover:border-[#1e3a8a]/50 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 ${
                  answers[currentQuestion] === option ? 'border-[#1e3a8a]' : 'border-gray-300 dark:border-gray-500'
                }`}>
                  {answers[currentQuestion] === option && <div className="w-3 h-3 bg-[#1e3a8a] rounded-full"></div>}
                </div>
                <span className="text-gray-800 dark:text-gray-200">{option}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-10">
          <button 
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            className="px-6 py-2 border border-gray-300 dark:border-slate-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          
          {currentQuestion === questions.length - 1 ? (
            <button 
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < questions.length}
              className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md transition-all disabled:opacity-50"
            >
              Submit Test
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="px-8 py-2 bg-[#1e3a8a] hover:bg-blue-800 text-white rounded-lg font-bold shadow-md transition-all"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AptitudeTest;
