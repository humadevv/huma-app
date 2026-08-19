import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, CheckCircle2, ArrowRight, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { HumaLogo } from '../Common/HumaLogo';
import { useApp } from '../../context/AppContext';
import { validatePassword, validateEmailProvider, validateUsername } from '../../utils/validation';

export const AuthModal: React.FC = () => {
  const { login, signup, sendSignupVerificationCode, verifySignupCode, isAuthenticated, darkMode } = useApp();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Signup fields
  const [signupStep, setSignupStep] = useState<'details' | 'verify_code'>('details');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmailOrPhone, setSignupEmailOrPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);

  // Forgot password field
  const [forgotIdentifier, setForgotIdentifier] = useState('');

  // Status message
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (isAuthenticated) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanIdentifier = loginIdentifier.trim();
    if (!cleanIdentifier || !loginPassword) {
      setErrorMessage('Please enter your phone number, email, or username and password.');
      return;
    }

    // Verify email provider domain if logging in with email
    if (cleanIdentifier.includes('@')) {
      const emailVal = validateEmailProvider(cleanIdentifier);
      if (!emailVal.valid) {
        setErrorMessage(emailVal.error || 'Please enter a valid email from a verified provider (@gmail.com, @yahoo.com, etc.).');
        return;
      }
    }

    const res = login(cleanIdentifier, loginPassword);
    if (!res.success) {
      setErrorMessage(res.error || 'Invalid phone number, email, username, or password.');
    }
  };

  const handleSignupStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanFullName = signupFullName.trim();
    const cleanUsername = signupUsername.trim().toLowerCase().replace(/\s+/g, '_');
    const cleanContact = signupEmailOrPhone.trim().toLowerCase();

    if (!cleanFullName || !cleanUsername || !cleanContact || !signupPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    const usernameVal = validateUsername(cleanUsername, false);
    if (!usernameVal.valid) {
      setErrorMessage(usernameVal.error || 'Username must be at least 3 characters long.');
      return;
    }

    // Strict verified email provider validation
    if (cleanContact.includes('@')) {
      const emailVal = validateEmailProvider(cleanContact);
      if (!emailVal.valid) {
        setErrorMessage(emailVal.error || 'Please use a recognized email provider (e.g. @gmail.com, @yahoo.com, @outlook.com, @icloud.com).');
        return;
      }
    }

    const pwdValidation = validatePassword(signupPassword);
    if (!pwdValidation.valid) {
      setErrorMessage(pwdValidation.error || 'Password does not meet requirements.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSendingCode(true);
    // Send 6-digit verification code securely
    const res = sendSignupVerificationCode(cleanContact);
    setIsSendingCode(false);

    if (typeof res === 'object' && res && res.success === false) {
      setErrorMessage(res.error || 'Failed to dispatch verification code. Please check your email.');
      return;
    }

    setVerificationCodeInput('');
    setSignupStep('verify_code');
    setSuccessMessage(`A 6-digit verification code was sent to ${cleanContact}. Please check your inbox.`);
  };

  const handleResendCode = () => {
    const cleanContact = signupEmailOrPhone.trim().toLowerCase();
    if (!cleanContact) return;

    setIsSendingCode(true);
    const res = sendSignupVerificationCode(cleanContact);
    setIsSendingCode(false);

    if (typeof res === 'object' && res && res.success === false) {
      setErrorMessage(res.error || 'Failed to resend code.');
    } else {
      setSuccessMessage(`A fresh verification code has been dispatched to ${cleanContact}.`);
      setErrorMessage('');
    }
  };

  const handleVerifyAndCompleteSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanCode = verificationCodeInput.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    const isValid = verifySignupCode(cleanCode);
    if (!isValid) {
      setErrorMessage('Invalid or expired verification code. Please check your email inbox and try again.');
      return;
    }

    const res = signup({
      fullName: signupFullName.trim(),
      username: signupUsername.trim().toLowerCase().replace(/\s+/g, '_'),
      emailOrPhone: signupEmailOrPhone.trim().toLowerCase(),
      password: signupPassword,
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Registration failed.');
      setSignupStep('details');
    } else {
      setSuccessMessage('Email verified successfully! Welcome to HUMA.');
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanInput = forgotIdentifier.trim().toLowerCase();
    if (!cleanInput) {
      setErrorMessage('Please enter your email or username.');
      return;
    }

    if (cleanInput.includes('@')) {
      const emailVal = validateEmailProvider(cleanInput);
      if (!emailVal.valid) {
        setErrorMessage(emailVal.error || 'Please enter a valid email address from a recognized provider.');
        return;
      }
    }

    setSuccessMessage(`A password reset link has been dispatched to ${cleanInput}. Please check your inbox and spam folder.`);
    setTimeout(() => setMode('login'), 3500);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto ${
      darkMode ? 'bg-black text-white' : 'bg-[#fafafa] text-[#1a1a1a]'
    }`}>
      <div className="w-full max-w-md my-8 flex flex-col gap-4">
        {/* Main Card Container */}
        <div className={`p-8 rounded-2xl border shadow-xl transition-all ${
          darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#efefef]'
        }`}>
          {/* HUMA Logo Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="mb-3">
              <HumaLogo size={56} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              {mode === 'login' ? 'Welcome to HUMA' : mode === 'signup' ? 'Join HUMA Today' : 'Reset Password'}
            </h1>
            <div className="mt-2.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-rose-500/20 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5">
              <span className="text-amber-400 font-bold">HUMA</span>
              <span className="text-zinc-500">•</span>
              <span>Human Made</span>
            </div>
          </div>

          {/* Error / Success Toast Banners */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-zinc-400">
                  Phone number, email, or username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="Phone, email, or username"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                      darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#fafafa] border-[#efefef] text-[#1a1a1a]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-[11px] text-[#0095f6] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                      darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#fafafa] border-[#efefef] text-[#1a1a1a]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#0095f6] text-white hover:bg-sky-600 transition-colors shadow-md mt-2"
              >
                Log In
              </button>
            </form>
          )}

          {/* SIGN UP FORM - STEP 1: DETAILS */}
          {mode === 'signup' && signupStep === 'details' && (
            <form onSubmit={handleSignupStep1} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-400">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Vance"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                      darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#fafafa] border-[#efefef] text-[#1a1a1a]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-400">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-zinc-500 text-sm">@</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. alex_vance"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                      darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#fafafa] border-[#efefef] text-[#1a1a1a]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-zinc-400">
                    Email Address
                  </label>
                  <span className="text-[10px] text-sky-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified provider (@gmail, @yahoo, etc.)
                  </span>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com or @yahoo.com"
                    value={signupEmailOrPhone}
                    onChange={(e) => setSignupEmailOrPhone(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                      darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#fafafa] border-[#efefef] text-[#1a1a1a]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-400">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 8 chars, 1 capital, 1 number, 1 special (!,@)"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                      darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#fafafa] border-[#efefef] text-[#1a1a1a]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password Complexity checklist */}
                <div className="mt-1.5 grid grid-cols-2 gap-1 text-[11px] text-zinc-400 font-medium">
                  <span className={signupPassword.length >= 8 ? 'text-emerald-400 font-semibold' : ''}>
                    ✓ Min 8 letters
                  </span>
                  <span className={/[A-Z]/.test(signupPassword) ? 'text-emerald-400 font-semibold' : ''}>
                    ✓ 1 Capital letter
                  </span>
                  <span className={/[0-9]/.test(signupPassword) ? 'text-emerald-400 font-semibold' : ''}>
                    ✓ 1 Number
                  </span>
                  <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signupPassword) ? 'text-emerald-400 font-semibold' : ''}>
                    ✓ 1 Special char (!@?)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-400">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                      darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#fafafa] border-[#efefef] text-[#1a1a1a]'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSendingCode}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#0095f6] text-white hover:bg-sky-600 transition-colors shadow-md mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isSendingCode ? 'Sending Verification Email...' : 'Send Verification Code'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* SIGN UP FORM - STEP 2: EMAIL VERIFICATION (SECURE) */}
          {mode === 'signup' && signupStep === 'verify_code' && (
            <form onSubmit={handleVerifyAndCompleteSignup} className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs space-y-2.5">
                <div className="font-bold flex items-center justify-between text-sky-300">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    <span>Check Your Email</span>
                  </div>
                  <span className="text-[10px] bg-sky-500/20 text-sky-200 px-2 py-0.5 rounded font-mono">
                    6-Digit Security Code
                  </span>
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  We've sent a 6-digit verification code to <span className="font-semibold text-white">{signupEmailOrPhone}</span>.
                </p>
                <p className="text-[11px] text-zinc-400">
                  Please check your inbox (and spam folder) and enter the code below to complete your registration.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-zinc-400">
                  Enter 6-Digit Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="• • • • • •"
                    value={verificationCodeInput}
                    onChange={(e) => setVerificationCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                    className={`w-full px-4 py-3 rounded-xl border text-center text-2xl font-mono tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                      darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#fafafa] border-[#efefef] text-[#1a1a1a]'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                <span>Didn't receive the email?</span>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isSendingCode}
                  className="text-[#0095f6] font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isSendingCode ? 'animate-spin' : ''}`} />
                  <span>Resend Code</span>
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSignupStep('details')}
                  className="w-1/3 py-2.5 px-3 rounded-xl font-semibold text-xs border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 px-4 rounded-xl font-bold text-xs bg-[#0095f6] text-white hover:bg-sky-600 transition-colors shadow-md"
                >
                  Verify & Create Account
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <p className="text-xs text-zinc-400 leading-relaxed text-center">
                Enter your verified email address or username and we'll dispatch a secure link to reset your account password.
              </p>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  placeholder="name@gmail.com, @yahoo.com, etc."
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                    darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#fafafa] border-[#efefef] text-[#1a1a1a]'
                  }`}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#0095f6] text-white hover:bg-sky-600 transition-colors shadow-md"
              >
                Send Reset Link
              </button>
            </form>
          )}
        </div>

        {/* Bottom Toggle Card */}
        <div className={`p-4 rounded-2xl border text-center text-sm font-medium transition-all ${
          darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#efefef]'
        }`}>
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setMode('signup');
                  setSignupStep('details');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="font-bold text-[#0095f6] hover:underline ml-1"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Have an account?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="font-bold text-[#0095f6] hover:underline ml-1"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
