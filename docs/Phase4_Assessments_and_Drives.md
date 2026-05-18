# College Placement Preparation Portal
## Developer Documentation Book
---

# Phase 4: Assessment & Job Drives
## Chapter 7: Automated Testing & Corporate Drives

### 7.1 Overview and Purpose
This chapter dissects the assessment modules of the application. The system generates real-time, dynamic aptitude tests using the Gemini AI, evaluating students instantly. Once evaluated, students can access the Placement Drives portal to apply for jobs directly through the platform.

---

### 7.2 AI Aptitude Test Generator (`AptitudeTest.jsx`)
The `AptitudeTest.jsx` module is a state-heavy React component that manages a live examination environment. It tracks answers in memory, calculates scores, and posts the final accuracy percentage to the MySQL database.

#### 7.2.1 State Management and Score Calculation
```jsx
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AptitudeTest = () => {
  // Core AI Generation States
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [testId, setTestId] = useState(null);
  
  // Live Examination Tracking States
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({}); // Dictionary tracking selected options
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // =======================================================
  // TEST GENERATION HOOK
  // =======================================================
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
        setQuestions(response.data.data); // Stores the JSON array of questions
        setTestId(response.data.testId);
      }
    } catch (error) {
      alert('Failed to generate test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // MATHEMATICAL GRADING ENGINE
  // =======================================================
  const handleSubmit = async () => {
    let calculatedScore = 0;
    
    // Evaluate the answers dictionary against the source of truth
    questions.forEach((q, index) => {
      if (answers[index] === q.correct) {
        calculatedScore++;
      }
    });
    
    setScore(calculatedScore);
    setSubmitted(true);
    
    // Asynchronous Score Sync
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

  // ... View Rendering Logic (See Section 7.4) ...
};
```

---

### 7.3 Corporate Placement Drives (`PlacementDrives.jsx`)
This interface allows students to view active drives and apply for them. The component uses a dynamic grid layout and complex state handlers to prevent duplicate applications.

#### 7.3.1 Applicant Interceptor Logic
```jsx
  const handleApply = async (driveId) => {
    setApplyingId(driveId); // Triggers loading spinner on the specific button
    setMessage(null);
    try {
      // Execute RESTful POST
      const response = await axios.post(`http://localhost:5000/api/drives/${driveId}/apply`, {}, { withCredentials: true });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Successfully applied to the drive!' });
      }
    } catch (error) {
      // Defensive fallback if the backend SQL constraints catch an invalid apply
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to apply. Make sure your profile is complete.' 
      });
    } finally {
      setApplyingId(null);
      
      // Auto-Healing Notification: Clears the toast after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };
```

#### 7.3.2 Responsive Dynamic Cards
```jsx
  {/* Drive Grid System */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {drives.map((drive) => (
      <div key={drive.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-xl transition-all group flex flex-col">
        {/* Aesthetic Color Header */}
        <div className="h-2 bg-gradient-to-r from-[#1e3a8a] to-blue-500"></div>
        
        <div className="p-6 flex-grow">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold group-hover:text-blue-600 transition-colors">
              {drive.CompanyProfile?.company_name || 'Unknown Company'}
            </h2>
            
            {/* Dynamic Status Badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              drive.status === 'Ongoing' ? 'bg-green-100 text-green-700' 
              : drive.status === 'Completed' ? 'bg-gray-100 text-gray-700'
              : 'bg-blue-100 text-blue-700'
            }`}>
              {drive.status || 'Upcoming'}
            </span>
          </div>
          
          {/* Apply Button specific to user role */}
          <div className="p-4 bg-gray-50 border-t mt-auto">
            {user?.role === 'Student' ? (
              <button 
                onClick={() => handleApply(drive.id)}
                disabled={applyingId === drive.id}
                className="w-full bg-[#1e3a8a] text-white py-2 rounded-lg font-bold disabled:opacity-70"
              >
                {applyingId === drive.id ? 'Applying...' : 'Apply Now'}
              </button>
            ) : (
              <button className="w-full bg-white border border-[#1e3a8a] text-[#1e3a8a] py-2 rounded-lg font-bold">
                Manage Applicants
              </button>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
```

### 7.4 Detailed Technical Breakdown

#### 7.4.1 O(1) Dictionary Tracking for Test Answers
In `AptitudeTest.jsx`, the system does NOT use a large complex array to track the user's answers. Instead, it utilizes a JavaScript Dictionary (`{}`).
```javascript
const handleOptionSelect = (option) => {
  setAnswers({
    ...answers,
    [currentQuestion]: option // e.g., { 0: 'Option A', 2: 'Option C' }
  });
};
```
By mapping the `currentQuestion` index directly to the dictionary key, the application achieves $O(1)$ constant time complexity when updating an answer. This prevents performance lagging even if a student skips forward and backward rapidly between questions.

#### 7.4.2 Cross-Component Role Rendering
In `PlacementDrives.jsx`, the application uses the Redux state `user.role` to fundamentally alter the behavior of the page. 
If the user is a `Student`, the button executes `handleApply()`. 
If the user is a `Company` or `TPO`, the button changes text to "Manage Applicants" and disables the application pipeline, turning the portal into an administrative tool without needing to write a second completely separate component.
