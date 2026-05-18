# College Placement Preparation Portal
## Developer Documentation Book
---

# Phase 3: Artificial Intelligence Systems
## Chapter 6: Mock Interviews & Resume Analysis (`aiService.js`)

### 6.1 Overview and Purpose
The Artificial Intelligence module is the core differentiator of the Placement Portal. It bridges the gap between static user interfaces and dynamic, intelligent feedback using Google's `gemini-flash-latest` LLM. 
This phase breaks down three tightly coupled systems:
1. The Backend AI Service (`aiService.js`) which securely interfaces with the Google API.
2. The AI Mock Interview Chat Interface (`MockInterview.jsx`).
3. The PDF ATS Resume Analyzer (`ResumeAnalyzer.jsx`).

---

### 6.2 The LLM Backend Controller (`aiService.js`)
All AI logic is centralized in a utility file. This ensures the frontend *never* holds the `GEMINI_API_KEY`, securing it from malicious extraction. 
The backend forces Gemini to return strict JSON arrays, completely bypassing regular conversational text.

#### 6.2.1 Source Code with Explanatory Comments
```javascript
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

// Secure initialization using Environment Variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// =======================================================
// FUNCTION 1: MOCK INTERVIEW EVALUATOR
// =======================================================
const getMockInterviewResponse = async (domain, question, studentAnswer) => {
  // Advanced Prompt Engineering: Roleplay setup
  const prompt = `
    You are an expert technical interviewer for the domain: ${domain}.
    The question asked to the candidate was: "${question}".
    The candidate's response was: "${studentAnswer}".
    
    Evaluate the candidate's response based on correctness, clarity, and keyword match.
    Provide your response strictly in the following JSON format without any markdown backticks:
    {
      "ai_feedback": "Your detailed feedback here",
      "correctness_score": <a number between 0 and 100>
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json', // Forces Gemini into JSON mode
      }
    });

    // Directly parse the output without RegEx stripping
    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error('Error with Gemini API:', error);
    return { ai_feedback: "Error evaluating response. Please try again.", correctness_score: 0 };
  }
};

// =======================================================
// FUNCTION 2: ATS RESUME ANALYZER
// =======================================================
const getResumeAnalysis = async (resumeDataString) => {
  const prompt = `
    You are an expert ATS (Applicant Tracking System) and Senior Technical Recruiter.
    I am providing you with a student's resume data:
    ${resumeDataString}
    
    Analyze the resume for strengths, weaknesses, and ATS optimization.
    Provide your response strictly in the following JSON format:
    {
      "ats_score": <a number between 0 and 100>,
      "strengths": ["Strength 1"],
      "weaknesses": ["Weakness 1"],
      "suggested_improvements": ["Improvement 1"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    return JSON.parse(response.text);
  } catch (error) {
    // Physical Hard-Drive Logging for severe AI API crashes
    const logMessage = `[${new Date().toISOString()}] Gemini Analysis Failed.\nError: ${error.message}\nStack: ${error.stack}\n\n`;
    fs.appendFileSync(path.join(__dirname, '..', 'debug_resume.log'), logMessage);

    return {
      ats_score: 0,
      strengths: [],
      weaknesses: ["Error analyzing resume. Please try again later."],
      suggested_improvements: []
    };
  }
};

module.exports = { getMockInterviewResponse, getResumeAnalysis };
```

---

### 6.3 AI Chat Interface (`MockInterview.jsx`)
The frontend creates an immersive, real-time chat interface. It uses React `useRef` to auto-scroll, and manages state manually to simulate a human-like "Typing..." delay.

#### 6.3.1 Conversational State Machine
```jsx
  const startSession = async (selectedDomain) => {
    setIsTyping(true); // Triggers bouncing dot animation
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
        
        // Dynamic Question Injection based on Domain
        const firstQuestion = `Great! Let's start your ${selectedDomain} interview. First question: Can you explain a core concept in ${selectedDomain} that you find most interesting?`;
        
        // Push AI message into the chat array
        setMessages((prev) => [
          ...prev, 
          { sender: 'ai', text: firstQuestion }
        ]);
        
        // Globally store the question so the next user input can be evaluated against it
        window.currentMockQuestion = firstQuestion;
      }
    } finally {
      setIsTyping(false);
    }
  };
```

#### 6.3.2 Regex Markdown Formatter
Gemini frequently returns `**bold text**`. Standard HTML cannot parse this. We use a custom JSX mapping function to render bold tags securely without relying on dangerous `innerHTML`.
```jsx
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
```

---

### 6.4 ATS Document Upload Pipeline (`ResumeAnalyzer.jsx`)
The Resume Analyzer uses `FormData` to bypass standard JSON payloads, allowing raw binary files (PDFs) to be shipped to the backend over HTTP securely.

#### 6.4.1 File Upload Logic
```jsx
  const handleUploadAndAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsLoading(true);

    // Setup Form Data for multipart/form-data binary upload
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
        setAnalysis(res.data.data); // Contains ats_score, strengths, weaknesses
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze the uploaded resume.');
    } finally {
      setIsLoading(false);
    }
  };
```

### 6.5 Detailed Technical Breakdown

#### 6.5.1 The `responseMimeType: 'application/json'` Flag
In older versions of OpenAI or Gemini, developers had to write massive Regex parsers to slice out JSON blocks from conversational text (e.g., removing ` ```json ` tags). By using the `config: { responseMimeType: 'application/json' }` command native to the `@google/genai` library, the LLM physically shuts off its conversational engine and strictly returns raw, parsable JSON objects. This completely eliminates JSON parsing crashes.

#### 6.5.2 Intelligent Auto-Scrolling
In `MockInterview.jsx`, the system utilizes a `useRef` hook attached to an empty `<div />` at the bottom of the chat container. Inside a `useEffect` hook, `messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })` is executed anytime the `messages` array changes. This ensures the user is never forced to manually scroll down when a large AI block of text is generated.
