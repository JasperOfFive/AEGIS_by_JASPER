import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  User,
  Building,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useAegis } from '../context/AegisContext';
import MetallicPaint from '../components/react-bits/MetallicPaint';
import { api } from '../services/apiService';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
}

interface UserAccount {
  name: string;
  email: string;
  password: string;
  organization?: string;
}

const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    name: 'Alex Carter',
    email: 'alex@aegis.security',
    password: 'password123',
    organization: 'Acme SecOps'
  },
  {
    name: 'Security Admin',
    email: 'admin@aegis.com',
    password: 'admin123',
    organization: 'AEGIS SOC'
  }
];

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const { theme, toggleTheme, setCurrentUser } = useAegis();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine mode from prop or path
  const [mode, setMode] = useState<'login' | 'signup'>(() => {
    if (location.pathname.includes('signup')) return 'signup';
    if (location.pathname.includes('login')) return 'login';
    return initialMode;
  });

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupOrg, setSignupOrg] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [agreeRules, setAgreeRules] = useState(true);

  // UI / Feedback states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  // Sync mode when URL changes
  useEffect(() => {
    if (location.pathname.includes('signup')) {
      setMode('signup');
      setAuthStatus('idle');
      setErrorMessage('');
    } else if (location.pathname.includes('login')) {
      setMode('login');
      setAuthStatus('idle');
      setErrorMessage('');
    }
  }, [location.pathname]);

  // Retrieve stored registered accounts or initialize with defaults
  const getRegisteredAccounts = (): UserAccount[] => {
    try {
      const stored = localStorage.getItem('aegis-registered-users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    localStorage.setItem('aegis-registered-users', JSON.stringify(DEFAULT_ACCOUNTS));
    return DEFAULT_ACCOUNTS;
  };

  // Quick fill demo credentials
  const handleQuickDemoFill = () => {
    setLoginEmail('alex@aegis.security');
    setLoginPassword('password123');
    setAuthStatus('idle');
    setErrorMessage('');
  };

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setAuthStatus('loading');

    const emailTrimmed = loginEmail.trim().toLowerCase();
    const passTrimmed = loginPassword.trim();

    if (!emailTrimmed || !passTrimmed) {
      setAuthStatus('error');
      setErrorMessage('Please enter both your email address and password.');
      setShakeKey(prev => prev + 1);
      return;
    }

    // Attempt real backend authentication first
    const backendRes = await api.auth.login(emailTrimmed, passTrimmed);
    if (backendRes.data && backendRes.data.user) {
      if (backendRes.data.token) {
        localStorage.setItem('aegis-auth-token', backendRes.data.token);
      }
      setAuthStatus('success');
      setSuccessMessage(`Access Granted. Welcome back, ${backendRes.data.user.name}!`);
      setCurrentUser(backendRes.data.user);
      setTimeout(() => {
        navigate('/app');
      }, 850);
      return;
    }

    // Graceful offline/mock demo account fallback
    setTimeout(() => {
      const accounts = getRegisteredAccounts();
      const matched = accounts.find(
        acc => acc.email.toLowerCase() === emailTrimmed && acc.password === passTrimmed
      );

      if (matched) {
        // SUCCESS: Right animation
        setAuthStatus('success');
        setSuccessMessage(`Access Granted. Welcome back, ${matched.name}!`);
        setCurrentUser({ name: matched.name, email: matched.email });
        setTimeout(() => {
          navigate('/app');
        }, 850);
      } else {
        // FAILURE: Wrong animation (Shake + Red glow + error message)
        setAuthStatus('error');
        setErrorMessage('Invalid credentials. The email or password entered does not match our records.');
        setShakeKey(prev => prev + 1);
      }
    }, 300);
  };

  // Handle Signup submission
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setAuthStatus('loading');

    const nameTrimmed = signupName.trim();
    const emailTrimmed = signupEmail.trim().toLowerCase();
    const passTrimmed = signupPassword.trim();
    const confirmTrimmed = signupConfirmPassword.trim();

    // Validation checks
    if (!nameTrimmed || !emailTrimmed || !passTrimmed || !confirmTrimmed) {
      setAuthStatus('error');
      setErrorMessage('All required fields must be completed.');
      setShakeKey(prev => prev + 1);
      return;
    }

    if (!emailTrimmed.includes('@') || !emailTrimmed.includes('.')) {
      setAuthStatus('error');
      setErrorMessage('Please provide a valid corporate or security email address.');
      setShakeKey(prev => prev + 1);
      return;
    }

    if (passTrimmed.length < 6) {
      setAuthStatus('error');
      setErrorMessage('Password must be at least 6 characters long.');
      setShakeKey(prev => prev + 1);
      return;
    }

    if (passTrimmed !== confirmTrimmed) {
      // Wrong animation
      setAuthStatus('error');
      setErrorMessage('Passwords do not match. Please verify your credentials.');
      setShakeKey(prev => prev + 1);
      return;
    }

    if (!agreeRules) {
      setAuthStatus('error');
      setErrorMessage('You must agree to the Defensive Security Operational Rules.');
      setShakeKey(prev => prev + 1);
      return;
    }

    // Attempt real backend registration first
    const backendRes = await api.auth.register({
      name: nameTrimmed,
      email: emailTrimmed,
      password: passTrimmed,
      organization: signupOrg.trim() || 'Enterprise SecOps'
    });

    if (backendRes.data && backendRes.data.user) {
      if (backendRes.data.token) {
        localStorage.setItem('aegis-auth-token', backendRes.data.token);
      }
      setAuthStatus('success');
      setSuccessMessage(`Account created successfully! Welcome to AEGIS, ${backendRes.data.user.name}.`);
      setCurrentUser(backendRes.data.user);
      setTimeout(() => {
        navigate('/app');
      }, 900);
      return;
    }

    // Graceful offline/mock demo account fallback
    setTimeout(() => {
      const accounts = getRegisteredAccounts();
      if (accounts.some(acc => acc.email.toLowerCase() === emailTrimmed)) {
        setAuthStatus('error');
        setErrorMessage('An account with this email already exists. Please log in instead.');
        setShakeKey(prev => prev + 1);
        return;
      }

      // Save user
      const newAcc: UserAccount = {
        name: nameTrimmed,
        email: emailTrimmed,
        password: passTrimmed,
        organization: signupOrg.trim() || 'Enterprise SecOps'
      };
      const updated = [newAcc, ...accounts];
      localStorage.setItem('aegis-registered-users', JSON.stringify(updated));

      // SUCCESS: Right animation
      setAuthStatus('success');
      setSuccessMessage(`Account created successfully! Welcome to AEGIS, ${nameTrimmed}.`);
      setCurrentUser({ name: nameTrimmed, email: emailTrimmed });
      setTimeout(() => {
        navigate('/app');
      }, 900);
    }, 300);
  };

  return (
    <div
      className="min-h-screen relative flex flex-col justify-between overflow-x-hidden transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Background ambient lighting */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 transition-opacity"
        style={{
          background: theme === 'dark'
            ? 'radial-gradient(ellipse at 50% 20%, rgba(56, 189, 248, 0.12) 0%, rgba(6, 9, 15, 0) 70%)'
            : 'radial-gradient(ellipse at 50% 20%, rgba(255, 141, 92, 0.18) 0%, rgba(247, 238, 229, 0) 70%)'
        }}
      />

      {/* Header Bar */}
      <header
        className="w-full border-b px-6 sm:px-12 py-3.5 backdrop-blur-md flex items-center justify-between relative z-20"
        style={{
          backgroundColor: 'var(--topbar-bg)',
          borderColor: 'var(--border-color)'
        }}
      >
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 relative shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform"
            style={{
              filter: theme === 'dark'
                ? 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.45))'
                : 'drop-shadow(0 0 8px rgba(255, 141, 92, 0.4))'
            }}
          >
            <MetallicPaint
              imageSrc="/aegis-logo.png"
              scale={0.88}
              color={theme === 'dark' ? '#FFFFFF' : '#FF8D5C'}
              gradientColor={theme === 'dark' ? '#0070F3' : '#C2410C'}
              lightMode={theme === 'light'}
              edgeBend={0.7}
              distortion={0.08}
              mouseTilt={0.6}
              speed={0.8}
              density={2.5}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wider font-mono leading-none" style={{ color: 'var(--text-primary)' }}>
              AEGIS
            </span>
            <span className="text-[9px] uppercase tracking-widest font-medium" style={{ color: 'var(--primary-accent)' }}>
              Brand Intel
            </span>
          </div>
        </NavLink>

        <div className="flex items-center gap-3">
          <NavLink
            to="/"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border hover:opacity-80 transition-all"
            style={{
              backgroundColor: 'var(--card-sub-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            ← Back to AEGIS
          </NavLink>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border transition-all hover:scale-105"
            style={{
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--card-sub-bg)',
              color: 'var(--primary-accent)'
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Main Form Center Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        <div
          key={shakeKey}
          className={`w-full max-w-md rounded-3xl border p-6 sm:p-8 backdrop-blur-2xl transition-all duration-300 ${
            authStatus === 'error'
              ? 'animate-auth-shake border-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.3)]'
              : authStatus === 'success'
              ? 'animate-auth-success border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.35)]'
              : 'shadow-2xl'
          }`}
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: authStatus === 'error'
              ? '#EF4444'
              : authStatus === 'success'
              ? '#10B981'
              : 'var(--border-color)',
            boxShadow: authStatus === 'error'
              ? '0 20px 50px -10px rgba(239, 68, 68, 0.25)'
              : authStatus === 'success'
              ? '0 20px 50px -10px rgba(16, 185, 129, 0.25)'
              : 'var(--card-glow)'
          }}
        >
          {/* Card Top Title & Icon */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono tracking-wider font-semibold uppercase"
              style={{
                backgroundColor: 'var(--card-sub-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--primary-accent)'
              }}
            >
              <Shield size={12} /> Defensive Access Portal
            </div>

            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {mode === 'login' ? 'Sign In to AEGIS' : 'Create Your Account'}
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {mode === 'login'
                ? 'Enter your security analyst credentials to continue'
                : 'Join the autonomous brand protection intelligence platform'}
            </p>
          </div>

          {/* Symmetrical Mode Switcher Tabs */}
          <div
            className="flex p-1 rounded-2xl border mb-6 relative"
            style={{
              backgroundColor: 'var(--card-sub-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setAuthStatus('idle');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                mode === 'login' ? 'shadow-md scale-[1.01]' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: mode === 'login' ? 'var(--card-bg)' : 'transparent',
                color: mode === 'login' ? 'var(--primary-accent)' : 'var(--text-secondary)',
                border: mode === 'login' ? '1px solid var(--border-color)' : '1px solid transparent'
              }}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setAuthStatus('idle');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                mode === 'signup' ? 'shadow-md scale-[1.01]' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: mode === 'signup' ? 'var(--card-bg)' : 'transparent',
                color: mode === 'signup' ? 'var(--primary-accent)' : 'var(--text-secondary)',
                border: mode === 'signup' ? '1px solid var(--border-color)' : '1px solid transparent'
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Feedback Banners (Wrong / Right Animation Feedback) */}
          {authStatus === 'error' && (
            <div
              className="p-3.5 rounded-xl border mb-5 flex items-start gap-2.5 text-xs bg-rose-500/10 border-rose-500/40 text-rose-500"
              role="alert"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}

          {authStatus === 'success' && (
            <div
              className="p-3.5 rounded-xl border mb-5 flex items-start gap-2.5 text-xs bg-emerald-500/10 border-emerald-500/40 text-emerald-500"
              role="status"
            >
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                {successMessage}
              </div>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Quick Demo Pill */}
              <div className="flex items-center justify-between text-[11px] pb-1">
                <span style={{ color: 'var(--text-muted)' }}>Need demo access?</span>
                <button
                  type="button"
                  onClick={handleQuickDemoFill}
                  className="font-mono text-[10px] px-2 py-0.5 rounded-lg border hover:scale-105 transition-all cursor-pointer"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--primary-accent)'
                  }}
                  title="Auto-fill with alex@aegis.security"
                >
                  Quick Demo: alex@aegis.security
                </button>
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Work Email Address
                </label>
                <div
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all ${
                    authStatus === 'error' ? 'border-rose-500/60' : 'focus-within:border-[var(--primary-accent)]'
                  }`}
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: authStatus === 'error' ? '#EF4444' : 'var(--border-color)'
                  }}
                >
                  <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    placeholder="alex@aegis.security"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (authStatus === 'error') setAuthStatus('idle');
                    }}
                    className="w-full bg-transparent border-none outline-none text-xs"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('alex@aegis.security');
                      setLoginPassword('password123');
                    }}
                    className="text-[11px] hover:underline"
                    style={{ color: 'var(--primary-accent)' }}
                  >
                    Reset? (Use demo pass)
                  </button>
                </div>
                <div
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all ${
                    authStatus === 'error' ? 'border-rose-500/60' : 'focus-within:border-[var(--primary-accent)]'
                  }`}
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: authStatus === 'error' ? '#EF4444' : 'var(--border-color)'
                  }}
                >
                  <Lock size={16} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password..."
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (authStatus === 'error') setAuthStatus('idle');
                    }}
                    className="w-full bg-transparent border-none outline-none text-xs"
                    style={{ color: 'var(--text-primary)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember checkbox */}
              <div className="flex items-center gap-2 pt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  id="remember-me"
                  defaultChecked
                  className="rounded accent-[var(--primary-accent)] cursor-pointer"
                />
                <label htmlFor="remember-me" className="cursor-pointer">
                  Remember this security terminal
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={authStatus === 'loading' || authStatus === 'success'}
                className="w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-80"
                style={{
                  backgroundColor: authStatus === 'success'
                    ? '#10B981'
                    : 'var(--primary-accent)',
                  color: '#FFFFFF',
                  boxShadow: authStatus === 'success'
                    ? '0 0 20px rgba(16, 185, 129, 0.4)'
                    : '0 4px 15px -3px rgba(56, 189, 248, 0.4)'
                }}
              >
                {authStatus === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating Credentials...
                  </span>
                ) : authStatus === 'success' ? (
                  <span className="flex items-center gap-2">
                    <Check size={16} />
                    Verified • Launching Console...
                  </span>
                ) : (
                  <>
                    Sign In to Security Console <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Full Name
                </label>
                <div
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border focus-within:border-[var(--primary-accent)] transition-all"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <User size={16} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    placeholder="Alex Carter"
                    value={signupName}
                    onChange={(e) => {
                      setSignupName(e.target.value);
                      if (authStatus === 'error') setAuthStatus('idle');
                    }}
                    className="w-full bg-transparent border-none outline-none text-xs"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Work Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Work Email Address
                </label>
                <div
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border focus-within:border-[var(--primary-accent)] transition-all"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={signupEmail}
                    onChange={(e) => {
                      setSignupEmail(e.target.value);
                      if (authStatus === 'error') setAuthStatus('idle');
                    }}
                    className="w-full bg-transparent border-none outline-none text-xs"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Organization */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Organization / Brand Name
                </label>
                <div
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border focus-within:border-[var(--primary-accent)] transition-all"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <Building size={16} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Acme Corporation"
                    value={signupOrg}
                    onChange={(e) => setSignupOrg(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-xs"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Password (min. 6 characters)
                </label>
                <div
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border focus-within:border-[var(--primary-accent)] transition-all"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <Lock size={16} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a strong password..."
                    value={signupPassword}
                    onChange={(e) => {
                      setSignupPassword(e.target.value);
                      if (authStatus === 'error') setAuthStatus('idle');
                    }}
                    className="w-full bg-transparent border-none outline-none text-xs"
                    style={{ color: 'var(--text-primary)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Confirm Password
                </label>
                <div
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border focus-within:border-[var(--primary-accent)] transition-all"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <Lock size={16} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Confirm password..."
                    value={signupConfirmPassword}
                    onChange={(e) => {
                      setSignupConfirmPassword(e.target.value);
                      if (authStatus === 'error') setAuthStatus('idle');
                    }}
                    className="w-full bg-transparent border-none outline-none text-xs"
                    style={{ color: 'var(--text-primary)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Operational Rules Agreement */}
              <div className="flex items-center gap-2 pt-1 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  id="agree-rules"
                  checked={agreeRules}
                  onChange={(e) => setAgreeRules(e.target.checked)}
                  className="rounded accent-[var(--primary-accent)] cursor-pointer"
                />
                <label htmlFor="agree-rules" className="cursor-pointer">
                  I accept the Defensive Rules & Zero-Trust Telemetry policies
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={authStatus === 'loading' || authStatus === 'success'}
                className="w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-80"
                style={{
                  backgroundColor: authStatus === 'success'
                    ? '#10B981'
                    : 'var(--primary-accent)',
                  color: '#FFFFFF',
                  boxShadow: authStatus === 'success'
                    ? '0 0 20px rgba(16, 185, 129, 0.4)'
                    : '0 4px 15px -3px rgba(56, 189, 248, 0.4)'
                }}
              >
                {authStatus === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Organization Profile...
                  </span>
                ) : authStatus === 'success' ? (
                  <span className="flex items-center gap-2">
                    <Check size={16} />
                    Account Ready • Launching...
                  </span>
                ) : (
                  <>
                    Create Enterprise Account <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle bottom link */}
          <div className="mt-6 pt-5 border-t text-center text-xs" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
            {mode === 'login' ? (
              <p>
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setAuthStatus('idle');
                    setErrorMessage('');
                  }}
                  className="font-semibold hover:underline cursor-pointer"
                  style={{ color: 'var(--primary-accent)' }}
                >
                  Sign Up for Free
                </button>
              </p>
            ) : (
              <p>
                Already have an AEGIS account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setAuthStatus('idle');
                    setErrorMessage('');
                  }}
                  className="font-semibold hover:underline cursor-pointer"
                  style={{ color: 'var(--primary-accent)' }}
                >
                  Sign In instead
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="w-full border-t py-4 px-6 text-center text-[11px] relative z-20 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto"
        style={{
          borderColor: 'var(--border-color)',
          color: 'var(--text-muted)'
        }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>AEGIS Zero-Trust Architecture • 256-Bit Telemetry Isolation</span>
        </div>
        <div>
          © 2026 AEGIS Defense Intelligence. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
