# College Placement Preparation Portal
## Developer Documentation Book
---

# Phase 6: Core Views & Recovery System
## Chapter 9: Password Recovery Engine & Static Views

### 9.1 Overview and Purpose
This final phase covers the foundational React structures that bind the application together. This includes the `Dashboard.jsx` routing wrapper, static marketing/information pages (`Home.jsx`, `About.jsx`, `Contact.jsx`), and the highly complex, multi-stage `ForgotPassword.jsx` cryptography pipeline.

---

### 9.2 Advanced Password Recovery (`ForgotPassword.jsx`)
The Forgot Password component is built as a Single Page Application (SPA) **State Machine**. Instead of redirecting users to 4 different URLs to reset their password, it uses a unified `step` integer state to swap the UI components seamlessly.

#### 9.2.1 The 4-Stage State Machine Architecture
```jsx
const ForgotPassword = () => {
  // Master State Machine Controller
  // 1: Identify, 2: OTP, 3: Reset, 4: Success
  const [step, setStep] = useState(1); 
  
  // Storage for the 6-digit OTP
  const [otpArray, setOtpArray] = useState(new Array(6).fill(''));
  const otpRefs = useRef([]); // DOM references for auto-focusing
  
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });

  // Redux Event Listener for successful HTTP requests
  useEffect(() => {
    if (isSuccess) {
      if (step === 1) {
        setStep(2); // Move to OTP grid
        dispatch(reset());
      } else if (step === 3) {
        setStep(4); // Show Success UI
        dispatch(reset());
      }
    }
  }, [isSuccess, step, dispatch]);

  return (
    // ... Layout Containers ...
    
    {/* Step 1: Identify Account */}
    {step === 1 && (
       <form onSubmit={onSendOtp}>
         <input placeholder="Email or Phone" />
         <button type="submit">Dispatch Recovery OTP</button>
       </form>
    )}

    {/* Step 2: Input 6-Digit Code */}
    {step === 2 && (
       <form onSubmit={onVerifyOtp}>
         {/* Mapping through array to create 6 individual input boxes */}
         {otpArray.map((data, index) => (
           <input key={index} maxLength="1" ref={(el) => (otpRefs.current[index] = el)} />
         ))}
       </form>
    )}

    {/* Step 3: Enter New Cryptographic Key */}
    {step === 3 && (
       <form onSubmit={onDeployReset}>
         <input type="password" placeholder="New Password" />
         <input type="password" placeholder="Confirm Password" />
       </form>
    )}

    {/* Step 4: Final Success Lockout */}
    {step === 4 && (
       <div>
         <p>All active login sessions have been forcefully expired for absolute safety.</p>
         <button onClick={() => navigate('/login')}>Return to Sign In</button>
       </div>
    )}
  );
};
```

#### 9.2.2 Automatic DOM Focus Shifting (OTP Grid)
When a user types a number into an OTP slot, they shouldn't have to manually click the next box. The UI handles this via DOM reference tracking.
```javascript
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false; // Prevent letters

    const newOtp = [...otpArray];
    newOtp[index] = element.value;
    setOtpArray(newOtp);

    // Auto-focus next input immediately after a number is typed
    if (element.value !== '' && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // If user presses backspace on an empty box, shift focus to the previous box automatically
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };
```

---

### 9.3 Dashboard Routing Wrapper (`Dashboard.jsx`)
In a standard React application, navigating to `/dashboard` renders a single component. However, in our Multi-Tenant Role-Based Access Control (RBAC) system, `/dashboard` is a **Layout Wrapper** (also known as an Interceptor). 

It analyzes the `user.role` from the Redux Store, and instantly injects the correct underlying React Component into the viewport.
- If `user.role === 'Admin'`, it injects `AdminDashboard.jsx`.
- If `user.role === 'Student'`, it injects `StudentDashboard.jsx`.
- If `user.role === 'Company'`, it injects `CompanyDashboard.jsx`.

This keeps the URL clean (`https://portal.com/dashboard`) while serving drastically different SQL data sets to the user based on their cryptographic permissions.

---

### 9.4 Static Core Views (`Home`, `About`, `Contact`, `Settings`)
These components form the public-facing footprint of the application. 
- **`Home.jsx`**: Features the hero banner, Call-to-Action (CTA) buttons, and marketing copy.
- **`About.jsx`**: Details the mission of the AI-integrated mock interview portal.
- **`Contact.jsx`**: A controlled form component that dispatches user queries to the support database.
- **`Settings.jsx`**: A globally accessible UI that allows any authenticated role (Admin, Student, Company) to update their local dark-mode preferences and trigger password resets from within the application.

### 9.5 Detailed Technical Breakdown
#### 9.5.1 OTP State Validation
Before the `ForgotPassword.jsx` Step 2 submits the payload, it runs a concatenation merge on the state array: `const mergedOtp = otpArray.join('');`. 
It then strictly checks `if (mergedOtp.length !== 6) return setValidationErr(...)`. 
This client-side verification prevents unnecessary network requests to the Railway backend if the user accidentally skipped an input box, drastically reducing server load.
