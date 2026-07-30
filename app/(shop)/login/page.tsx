'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2, Mail, Lock, Phone, User, Eye, EyeOff, LogOut, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getDirectImageLink } from '@/lib/utils';

function CustomGoogleButton({
  googleClientId,
  onSuccess,
  onError,
  loading,
}: {
  googleClientId: string;
  onSuccess: (tokenResponse: any) => void;
  onError: (err: any) => void;
  loading: boolean;
}) {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => onSuccess(tokenResponse),
    onError: (errorResponse) => {
      console.error('Google OAuth error:', errorResponse);
      onError(errorResponse);
    },
  });

  const handleClick = () => {
    try {
      login();
    } catch (err: any) {
      console.error('Google OAuth trigger error:', err);
      onError(err);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-800 py-3.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-50"
    >
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
      </svg>
      <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
    </button>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, user, login: loginAction, logout } = useAuthStore();
  const { settings } = useSettingsStore();

  const initialMode = searchParams.get('register') === 'true' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [pendingGoogleUser, setPendingGoogleUser] = useState<{
    credential: string;
    email: string;
    name: string;
  } | null>(null);
  const [googlePhone, setGooglePhone] = useState('');

  // Sync tab with URL search parameter
  useEffect(() => {
    if (searchParams.get('register') === 'true') {
      setMode('register');
    } else {
      setMode('login');
    }
  }, [searchParams]);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '997671776781-8tvf6paidbpk13b0nghor90ge0qsvht9.apps.googleusercontent.com';

  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    const inputVal = formData.email.trim();

    if (mode === 'login') {
      const isEmail = emailRegex.test(inputVal);
      const isPhone = bdPhoneRegex.test(inputVal);

      if (!inputVal) {
        setError('Please enter your email or phone number.');
        setLoading(false);
        return;
      }

      if (!isEmail && !isPhone) {
        setError('Please enter a valid email address or phone number (e.g. 017XXXXXXXX).');
        setLoading(false);
        return;
      }

      if (!formData.password) {
        setError('Please enter your password.');
        setLoading(false);
        return;
      }
    } else {
      if (!formData.name.trim()) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      if (!emailRegex.test(inputVal)) {
        setError('Please enter a valid email address (e.g. name@example.com).');
        setLoading(false);
        return;
      }
      if (!formData.phone.trim()) {
        setError('Phone number is required to create an account.');
        setLoading(false);
        return;
      }
      if (!bdPhoneRegex.test(formData.phone.trim())) {
        setError('Please enter a valid Bangladeshi phone number (e.g. 017XXXXXXXX).');
        setLoading(false);
        return;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long.');
        setLoading(false);
        return;
      }
      if (!/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
        setError('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
        setLoading(false);
        return;
      }
    }

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: inputVal.toLowerCase(),
          identifier: inputVal,
          phone: formData.phone.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      loginAction(data.user);
      const redirectPath = searchParams.get('redirect') || '/';
      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (googleRes: any) => {
    setGoogleLoading(true);
    setError('');

    try {
      const payload: any = {};
      if (googleRes.credential) {
        payload.credential = googleRes.credential;
      } else if (googleRes.access_token) {
        payload.accessToken = googleRes.access_token;
      }

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.requirePhone) {
        setPendingGoogleUser({
          credential: payload.credential || payload.accessToken || '',
          email: data.email,
          name: data.name,
        });
        setGoogleLoading(false);
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Google Login failed');

      loginAction(data.user);
      const redirectPath = searchParams.get('redirect') || '/';
      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGooglePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleLoading(true);
    setError('');

    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    if (!bdPhoneRegex.test(googlePhone.trim())) {
      setError('Please enter a valid Bangladeshi phone number (e.g. 017XXXXXXXX).');
      setGoogleLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: pendingGoogleUser?.credential,
          phone: googlePhone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete account');

      loginAction(data.user);
      const redirectPath = searchParams.get('redirect') || '/';
      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Could not save phone number');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
  };

  // If user is already authenticated, show a clean active profile card
  if (isAuthenticated && user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 bg-gradient-to-b from-slate-50 to-slate-100">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-6"
        >
          <div className="relative w-20 h-20 mx-auto rounded-full bg-slate-100 border-2 border-[#A31F24]/20 flex items-center justify-center overflow-hidden shadow-inner">
            {user.image ? (
              <Image src={user.image} alt={user.name} fill sizes="80px" className="object-cover" />
            ) : (
              <span className="text-2xl font-bold text-[#A31F24]">{user.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
              <CheckCircle2 size={14} /> Logged In
            </div>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-xs text-slate-500 mt-1">{user.email || user.phone}</p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              href="/profile"
              className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#A31F24] text-white text-xs font-bold uppercase tracking-widest py-3.5 px-6 rounded-2xl transition-all shadow-md group"
            >
              <span>Go to My Profile</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-2xl transition-all"
            >
              <LogOut size={16} />
              <span>Sign Out / Switch Account</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="w-full max-w-lg">
          {/* Card Container */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-200/50 p-6 sm:p-10 overflow-hidden">
            
            {/* Header Branding */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-block mb-3">
                {settings?.logo ? (
                  <Image
                    src={getDirectImageLink(settings.logo)}
                    alt="AS SIDRAT"
                    width={120}
                    height={40}
                    className="h-10 w-auto mx-auto object-contain"
                  />
                ) : (
                  <span className="text-xl font-extrabold tracking-[0.25em] text-[#1A1A1A] uppercase">
                    AS SIDRAT
                  </span>
                )}
              </Link>
              <p className="text-xs text-slate-500 font-medium tracking-wide">
                {mode === 'login' ? 'Welcome back! Sign in to continue.' : 'Create an account for personalized luxury shopping.'}
              </p>
            </div>

            {/* Pending Google Phone Collection State */}
            {pendingGoogleUser ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 text-center">
                  <ShieldCheck size={28} className="mx-auto text-amber-600 mb-2" />
                  <h2 className="text-base font-bold text-slate-900">One Last Step!</h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Welcome <strong>{pendingGoogleUser.name}</strong>! Please provide your phone number for order tracking and SMS updates.
                  </p>
                </div>

                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3.5 rounded-xl">
                    {error}
                  </div>
                )}

                <form onSubmit={handleGooglePhoneSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone Number (Required)
                    </label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="e.g. 017XXXXXXXX"
                        required
                        value={googlePhone}
                        onChange={(e) => setGooglePhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-[#1A1A1A] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={googleLoading}
                    className="w-full bg-[#1A1A1A] hover:bg-[#A31F24] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {googleLoading ? <Loader2 className="animate-spin" size={18} /> : 'Complete Registration'}
                  </button>
                </form>
              </motion.div>
            ) : (
              <>
                {/* Custom Tab Switcher */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 border border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 ${
                      mode === 'login'
                        ? 'bg-white text-[#1A1A1A] shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); }}
                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 ${
                      mode === 'register'
                        ? 'bg-white text-[#1A1A1A] shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Error Banner */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3.5 rounded-xl mb-6 flex items-start gap-2"
                  >
                    <span className="shrink-0 text-rose-500 font-bold">✕</span>
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Google Sign In Option (Always Visible Custom Button) */}
                <div className="mb-6">
                  <CustomGoogleButton
                    googleClientId={googleClientId}
                    onSuccess={handleGoogleSuccess}
                    onError={(err: any) => {
                      console.error('Google Auth Handler Error:', err);
                      const msg = typeof err === 'string'
                        ? err
                        : (err?.error_description || err?.error || 'Google Sign-In popup closed or blocked by browser.');
                      setError(msg);
                    }}
                    loading={googleLoading}
                  />
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-6">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest absolute">
                    Or continue with email
                  </span>
                </div>

                {/* Main Auth Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <AnimatePresence mode="wait">
                    {mode === 'register' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 overflow-hidden"
                      >
                        {/* Name Input */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Full Name
                          </label>
                          <div className="relative">
                            <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="John Doe"
                              required={mode === 'register'}
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-[#1A1A1A] focus:outline-none transition-all"
                            />
                          </div>
                        </div>

                        {/* Phone Input */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Phone Number (Required)
                          </label>
                          <div className="relative">
                            <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="tel"
                              placeholder="017XXXXXXXX"
                              required={mode === 'register'}
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-[#1A1A1A] focus:outline-none transition-all"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email / Phone Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {mode === 'login' ? 'Email Address or Phone Number' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder={mode === 'login' ? "Email address or 017XXXXXXXX" : "yourname@example.com"}
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-[#1A1A1A] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Password
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setForgotModalOpen(true);
                            setForgotEmail(formData.email);
                            setForgotSuccess('');
                          }}
                          className="text-[11px] font-semibold text-[#A31F24] hover:underline focus:outline-none"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-[#1A1A1A] focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {mode === 'register' && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Min. 8 characters with 1 uppercase, 1 lowercase & 1 number.
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full bg-[#1A1A1A] hover:bg-[#A31F24] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer active:scale-[0.99]"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <span>{mode === 'login' ? 'Sign In to Account' : 'Create My Account'}</span>
                    )}
                  </button>
                </form>

                {/* Footer Switch */}
                <div className="mt-8 text-center pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">
                    {mode === 'login' ? "Don't have an account yet?" : 'Already registered with us?'}
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === 'login' ? 'register' : 'login');
                        setError('');
                      }}
                      className="ml-2 font-bold text-[#A31F24] hover:underline focus:outline-none"
                    >
                      {mode === 'login' ? 'Create Account' : 'Sign In'}
                    </button>
                  </p>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-slate-200"
            >
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>

              <h3 className="text-lg font-bold text-slate-900 mb-2">Reset Password</h3>
              <p className="text-xs text-slate-500 mb-4">
                Enter your email address or phone number associated with your account, and we will guide you to reset your password.
              </p>

              {forgotSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-4 rounded-xl mb-4">
                  {forgotSuccess}
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!forgotEmail.trim()) return;
                    setForgotSuccess(`Password reset instructions have been sent to ${forgotEmail.trim()}. Please check your inbox or phone.`);
                  }}
                  className="space-y-4"
                >
                  <input
                    type="text"
                    required
                    placeholder="Email address or 017XXXXXXXX"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#1A1A1A] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full bg-[#A31F24] hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-all"
                  >
                    Send Reset Instructions
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </GoogleOAuthProvider>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
          <Loader2 className="animate-spin text-[#A31F24]" size={32} />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}