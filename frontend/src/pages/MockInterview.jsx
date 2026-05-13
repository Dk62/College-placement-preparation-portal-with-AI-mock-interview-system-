import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MockInterview = () => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your AI interviewer. To get started, please tell me which domain you would like to interview for (e.g., Frontend, Backend, Data Science).' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [domain, setDomain] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  
  const messagesEndRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (!user || user.role !== 'Student') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-bold text-red-500">Access Denied</h2>
        <p className="text-gray-500 mt-2">Only students can access mock interviews.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 bg-[#1e3a8a] text-white px-4 py-2 rounded">Go Back</button>
      </div>
    );
  }

  const startSession = async (selectedDomain) => {
    setIsTyping(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/mock/sessions',
        { domain: selectedDomain },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setSessionId(response.data.data.id);
        setSessionActive(true);
        setQuestionCount(1);
        
        // Let's ask the first generic question based on domain
        const firstQuestion = `Great! Let's start your ${selectedDomain} interview. First question: Can you explain a core concept in ${selectedDomain} that you find most interesting?`;
        
        setMessages((prev) => [
          ...prev, 
          { sender: 'ai', text: firstQuestion }
        ]);
        
        // We temporarily store the question being asked so we can send it with the next user response
        window.currentMockQuestion = firstQuestion;
      }
    } catch (error) {
      console.error('Failed to start session', error);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error starting the session. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const submitAnswer = async (answer) => {
    setIsTyping(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/mock/sessions/${sessionId}/responses`,
        { 
          question: window.currentMockQuestion || 'Initial Question', 
          student_answer: answer 
        },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        const feedback = response.data.data.ai_feedback;
        const score = response.data.data.correctness_score;
        setQuestionCount((prev) => prev + 1);
        
        const feedbackMessage = `**Feedback:**\n${feedback}\n\n**Score:** ${score}/100`;
        
        let nextQuestion = '';
        if (questionCount < 5) { // Limit to 5 questions
           nextQuestion = `\n\nNext Question: How does this relate to best practices in ${domain}? (Or elaborate further on your previous point).`;
           window.currentMockQuestion = nextQuestion.replace('\n\nNext Question: ', '');
        } else {
           nextQuestion = `\n\nThat concludes our interview! You can click "End Session" to view your summary.`;
           window.currentMockQuestion = null;
        }

        setMessages((prev) => [
          ...prev, 
          { sender: 'ai', text: feedbackMessage + nextQuestion }
        ]);
      }
    } catch (error) {
      console.error('Failed to submit answer', error);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Sorry, I failed to evaluate your answer. Let\'s move on.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    
    const currentInput = input;
    setInput('');

    if (!sessionActive) {
      setDomain(currentInput);
      startSession(currentInput);
    } else {
      if (window.currentMockQuestion) {
        submitAnswer(currentInput);
      } else {
         setMessages((prev) => [...prev, { sender: 'ai', text: 'The interview is complete. Please click End Session.' }]);
      }
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) {
      navigate('/dashboard');
      return;
    }
    
    setIsTyping(true);
    try {
      await axios.put(`http://localhost:5000/api/mock/sessions/${sessionId}/complete`, {}, { withCredentials: true });
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to complete session', error);
      navigate('/dashboard');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper to safely render text that might have bold **markdown**
  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="max-w-4xl mx-auto mt-4 h-[80vh] flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-[#1e3a8a] text-white p-4 flex justify-between items-center shadow-md z-10">
        <div>
          <h1 className="text-xl font-bold">AI Interviewer</h1>
          <p className="text-xs text-blue-200">{sessionActive ? `Domain: ${domain} | Question ${questionCount}/5` : 'Waiting for domain setup...'}</p>
        </div>
        <button 
          onClick={handleEndSession}
          className="text-sm font-medium bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          {sessionActive ? 'End Session & Get Score' : 'Cancel'}
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-grow p-4 sm:p-6 overflow-y-auto bg-gray-50 dark:bg-slate-900">
        <div className="space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-[#1e3a8a] text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-slate-700'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                  {renderFormattedText(msg.text)}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
        <div className="relative flex items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer..."
            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl py-3 pl-4 pr-14 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] resize-none overflow-hidden min-h-[50px] max-h-[150px] text-sm text-gray-900 dark:text-white"
            rows="1"
            style={{ height: 'auto' }}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 bottom-1.5 p-2 bg-[#1e3a8a] text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:hover:bg-[#1e3a8a] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">Press Enter to send, Shift + Enter for new line</p>
      </div>
    </div>
  );
};

export default MockInterview;
