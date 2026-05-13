import { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ResumeAnalyzer = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  if (!user || user.role !== 'Student') {
    navigate('/dashboard');
    return null;
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a valid PDF document.');
        setSelectedFile(null);
        return;
      }
      setError('');
      setSelectedFile(file);
    }
  };

  const handleUploadAndAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose a file to upload first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysis(null);

    // Setup Form Data for file upload
    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      axios.defaults.withCredentials = true;
      const res = await axios.post('http://localhost:5000/api/profiles/student/analyze-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setAnalysis(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze the uploaded resume. Please ensure it is a text-based PDF and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 pb-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight text-gray-900 dark:text-white">
          AI <span className="text-blue-600 dark:text-blue-500">Resume Analyzer</span>
        </h1>
        <p className="text-gray-600 dark:text-slate-400 max-w-xl mx-auto text-lg">
          Upload your existing PDF resume and let Gemini score it against strict industry standards.
        </p>
      </div>

      {/* Upload Container */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm transition-all duration-300 mb-10">
        <form onSubmit={handleUploadAndAnalyze} className="flex flex-col items-center">
          <label 
            htmlFor="file-upload"
            className={`w-full max-w-lg border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
              selectedFile ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-blue-300 dark:border-slate-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${selectedFile ? 'bg-green-100 text-green-600' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600'}`}>
              {selectedFile ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              )}
            </div>
            
            <span className="text-lg font-semibold text-gray-700 dark:text-slate-200">
              {selectedFile ? selectedFile.name : 'Click to Browse PDF'}
            </span>
            <p className="text-xs text-gray-500 mt-1">Maximum file size: 5MB</p>

            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </label>

          <button 
            type="submit"
            disabled={isLoading || !selectedFile}
            className="mt-6 w-full max-w-lg bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold py-4 px-8 rounded-xl shadow-md transition-all disabled:opacity-50 text-lg flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                AI is Analyzing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                Extract & Analyze Resume
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-600 dark:text-red-400 p-4 rounded-lg text-center text-sm font-medium max-w-lg mx-auto">
            {error}
          </div>
        )}
      </div>

      {/* Results visualization */}
      {analysis && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 animate-fade-in">
          
          {/* Score Gauge */}
          <div className="flex flex-col items-center justify-center mb-10 border-b border-gray-200 dark:border-slate-700 pb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Overall ATS Score</h2>
            <div className={`w-44 h-44 rounded-full border-[10px] flex items-center justify-center shadow-lg relative ${
              analysis.ats_score >= 80 ? 'border-green-500' : 
              analysis.ats_score >= 50 ? 'border-yellow-500' : 'border-red-500'
            }`}>
              <div className="text-center">
                <span className={`text-6xl font-black ${
                  analysis.ats_score >= 80 ? 'text-green-600 dark:text-green-400' : 
                  analysis.ats_score >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                }`}>{analysis.ats_score}</span>
                <span className="text-gray-400 dark:text-slate-500 block text-sm font-bold uppercase tracking-widest mt-[-5px]">/ 100</span>
              </div>
            </div>
            <p className="mt-4 font-medium text-gray-600 dark:text-slate-300 text-center max-w-md">
              {analysis.ats_score >= 80 ? 'Excellent! Your resume shows high compatibility with employer tracking software.' 
               : analysis.ats_score >= 50 ? 'Good foundation, but there are significant areas you should refine to stand out.'
               : 'Warning: Low visibility potential. Implement the AI feedback immediately to improve your chances.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* AI-Detected Strengths */}
            <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-xl border border-green-100 dark:border-green-900/20">
              <h3 className="text-lg font-bold text-green-800 dark:text-green-400 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Key Strengths
              </h3>
              <ul className="space-y-3">
                {analysis.strengths?.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white dark:bg-slate-900/40 p-3 rounded-lg shadow-sm border border-green-100/50 dark:border-green-800/20">
                    <span className="text-green-500 text-xl leading-none">•</span>
                    <span className="text-sm text-gray-700 dark:text-slate-300 font-medium">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Critical Weaknesses */}
            <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl border border-red-100 dark:border-red-900/20">
              <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Areas to Address
              </h3>
              <ul className="space-y-3">
                {analysis.weaknesses?.map((wk, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white dark:bg-slate-900/40 p-3 rounded-lg shadow-sm border border-red-100/50 dark:border-red-800/20">
                    <span className="text-red-500 text-xl leading-none">•</span>
                    <span className="text-sm text-gray-700 dark:text-slate-300 font-medium">{wk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Optimization Strategies */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900/20">
            <h3 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Optimization Strategy
            </h3>
            <ul className="space-y-3">
              {analysis.suggested_improvements?.map((sug, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-white dark:bg-slate-900/40 p-4 rounded-lg border border-blue-100/50 dark:border-blue-800/20 shadow-sm">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-sm text-gray-800 dark:text-slate-300 font-medium leading-relaxed">{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
