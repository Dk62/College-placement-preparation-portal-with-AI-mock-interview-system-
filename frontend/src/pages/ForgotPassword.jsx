import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword, resetPassword, reset } from '../features/auth/authSlice';
import { KeyRound, Mail, Phone, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Identify, 2: OTP, 3: Reset, 4: Success
  const [identifier, setIdentifier] = useState('');
  
  // OTP Input state - array for 6 individual character slots
  const [otpArray, setOtpArray] = useState(new Array(6).fill(''));
  const otpRefs = useRef([]);

  // Passwords intake
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [validationErr, setValidationErr] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  // Dynamic focus for OTP character grids
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otpArray];
    newOtp[index] = element.value;
    setOtpArray(newOtp);

    // Auto-focus next input on typing
    if (element.value !== '' && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Backspace focus shifting
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  useEffect(() => {
    if (isError) {
      setValidationErr(message || 'An error occurred. Please try again.');
      dispatch(reset());
    }

    // Shift steps based on successes
    if (isSuccess) {
      if (step === 1) {
        setStep(2);
        setValidationErr('');
        dispatch(reset());
      } else if (step === 3) {
        setStep(4);
        setValidationErr('');
        dispatch(reset());
      }
    }
  }, [isError, isSuccess, message, step, dispatch]);

  // Step 1 Handler: Request OTP dispatch
  const onSendOtp = (e) => {
    e.preventDefault();
    if (!identifier.trim()) return setValidationErr('Please enter contact details.');
    setValidationErr('');
    dispatch(forgotPassword(identifier.trim()));
  };

  // Step 2 Handler: Move to Reset Passwords intake
  const onVerifyOtp = (e) => {
    e.preventDefault();
    const mergedOtp = otpArray.join('');
    if (mergedOtp.length !== 6) return setValidationErr('Please input complete 6-digit code.');
    
    setValidationErr('');
    // Move straight to Password intake locally
    setStep(3);
  };

  // Step 3 Handler: Deploy new passwords to server
  const onDeployReset = (e) => {
    e.preventDefault();
    const { newPassword, confirmPassword } = passwords;

    if (newPassword.length < 6) {
      return setValidationErr('Password must span at least 6 characters.');
    }
    if (newPassword !== confirmPassword) {
      return setValidationErr('Passwords do not match.');
    }

    setValidationErr('');
    const payload = {
      identifier: identifier.trim(),
      otp: otpArray.join(''),
      newPassword
    };

    dispatch(resetPassword(payload));
  };

  return (
    <div className="flex justify-center items-center min-h-[85vh] px-4">
      <div className="bg-white dark:bg-[#1f2028] p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 dark:border-[#2e303a] transition-all duration-300 transform">
        
        {/* Dynamic Header Indicators */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#aa3bff]/10 text-[#aa3bff] mb-4">
            {step === 1 && <Mail size={28} />}
            {step === 2 && <KeyRound size={28} />}
            {step === 3 && <KeyRound size={28} />}
            {step === 4 && <CheckCircle size={36} className="text-emerald-500" />}
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
            {step === 1 && 'Reset Access Key'}
            {step === 2 && 'Enter Security OTP'}
            {step === 3 && 'Define New Password'}
            {step === 4 && 'Success!'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 px-4">
            {step === 1 && 'Provide your registered Email Address or Phone Number to fetch a recovery code.'}
            {step === 2 && `We dispatched a secure code to your coordinates. Enter below.`}
            {step === 3 && 'Assign a secure new alphanumeric passkey to re-authorize your account.'}
            {step === 4 && 'Your passkey credentials updated successfully. You can sign in now.'}
          </p>
        </div>

        {/* Global Alerts Bar */}
        {validationErr && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 flex items-start gap-3 animate-shake">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span className="text-xs font-medium">{validationErr}</span>
          </div>
        )}

        {/* ========================= STEP 1: IDENTIFY ========================= */}
        {step === 1 && (
          <form onSubmit={onSendOtp} className="space-y-6">
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Email or Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#16171d] text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:ring-2 focus:ring-[#aa3bff]/50 focus:border-[#aa3bff] outline-none transition-all"
                  placeholder="e.g., youremail@domain.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#aa3bff] to-[#8a2be2] hover:opacity-90 text-white font-bold shadow-lg shadow-[#aa3bff]/20 hover:shadow-[#aa3bff]/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Locating Account...' : 'Dispatch Recovery OTP'}
            </button>
          </form>
        )}

        {/* ========================= STEP 2: OTP VERIFICATION GRID ========================= */}
        {step === 2 && (
          <form onSubmit={onVerifyOtp} className="space-y-8">
            <div>
              <label className="block text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                6-Digit Verification Code
              </label>
              <div className="flex justify-between gap-2 md:gap-3 px-2">
                {otpArray.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={(el) => (otpRefs.current[index] = el)}
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onFocus={(e) => e.target.select()}
                    className="w-11 h-14 text-center text-xl font-extrabold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#16171d] text-[#aa3bff] focus:ring-2 focus:ring-[#aa3bff]/60 focus:border-[#aa3bff] outline-none shadow-sm transition-all"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-md hover:shadow-lg cursor-pointer transition-all"
              >
                Verify Security Token
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 text-xs font-semibold"
              >
                <ArrowLeft size={14} /> Modify details
              </button>
            </div>
          </form>
        )}

        {/* ========================= STEP 3: ASSIGN NEW PASSWORDS ========================= */}
        {step === 3 && (
          <form onSubmit={onDeployReset} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#16171d] text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:ring-2 focus:ring-[#aa3bff] outline-none"
                    placeholder="At least 6 characters"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Confirm New Password
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#16171d] text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:ring-2 focus:ring-[#aa3bff] outline-none"
                  placeholder="Confirm credentials"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#aa3bff] to-[#8a2be2] hover:opacity-90 text-white font-bold shadow-lg shadow-[#aa3bff]/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Updating Cipher...' : 'Finalize Password Reset'}
            </button>
          </form>
        )}

        {/* ========================= STEP 4: FINAL SUCCESSFUL RESET ========================= */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl text-emerald-700 dark:text-emerald-400 text-center text-sm font-medium">
              All active login sessions have been forcefully expired for absolute safety.
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-3.5 rounded-xl bg-[#aa3bff] hover:bg-[#902bd9] text-white font-bold shadow-lg shadow-[#aa3bff]/25 transition-all cursor-pointer"
            >
              Return to Sign In
            </button>
          </div>
        )}

        {/* Back to Authentication quicklink (Hidden on final success) */}
        {step !== 4 && (
          <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-[#aa3bff] hover:text-[#902bd9] tracking-wide uppercase transition-colors">
              <ArrowLeft size={14} /> Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
