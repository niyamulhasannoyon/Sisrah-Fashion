'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [pendingGoogleUser, setPendingGoogleUser] = useState<{credential: string, email: string, name: string} | null>(null);
  const [googlePhone, setGooglePhone] = useState('');

  const loginAction = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isLogin && !formData.phone) {
        setError("Phone number is strictly required to create an account.");
        setLoading(false);
        return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      loginAction(data.user);
      router.push('/profile');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();

      if (data.requirePhone) {
         setPendingGoogleUser({
           credential: credentialResponse.credential,
           email: data.email,
           name: data.name
         });
         setLoading(false);
         return;
      }

      if (!res.ok) throw new Error(data.error || 'Google Login failed');

      loginAction(data.user);
      router.push('/profile');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGooglePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                credential: pendingGoogleUser?.credential, 
                phone: googlePhone 
            }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        loginAction(data.user);
        router.push('/profile');
    } catch(err: any) {
        setError(err.message);
        setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F9F9F9] p-4">
        <div className="w-full max-w-md bg-white p-8 border border-gray-100 shadow-sm rounded-md">
          
          {pendingGoogleUser ? (
            <div>
               <h1 className="text-xl font-bold text-[#1A1A1A] uppercase text-center mb-4">Almost There!</h1>
               <p className="text-sm text-gray-500 text-center mb-6">
                 Welcome <strong>{pendingGoogleUser.name}</strong>! Please enter your phone number to complete your registration.
               </p>
               <form onSubmit={handleGooglePhoneSubmit} className="flex flex-col gap-4">
                 <input type="tel" placeholder="Phone Number (e.g. 017...)" required 
                    className="w-full border border-gray-200 p-3 focus:border-[#1A1A1A] outline-none rounded" 
                    onChange={e => setGooglePhone(e.target.value)} 
                 />
                 <button type="submit" disabled={loading} className="w-full bg-[#1A1A1A] text-white py-4 font-bold uppercase rounded hover:bg-[#A31F24] transition-colors">
                    {loading ? 'Processing...' : 'Complete Account'}
                 </button>
               </form>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[#1A1A1A] uppercase tracking-widest text-center mb-8">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h1>

              {error && <div className="bg-red-50 text-red-600 p-3 text-sm mb-6 border border-red-100 rounded">{error}</div>}

              <div className="flex justify-center mb-6">
                <GoogleLogin 
                   onSuccess={handleGoogleSuccess} 
                   onError={() => setError('Google Login Failed')}
                   theme="outline"
                   size="large"
                   text={isLogin ? "signin_with" : "signup_with"}
                   width="100%"
                />
              </div>

              <div className="relative flex items-center justify-center mb-6">
                <div className="border-t border-gray-200 w-full"></div>
                <span className="bg-white px-3 text-gray-400 text-xs font-medium uppercase absolute">Or continue with</span>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {!isLogin && (
                  <>
                    <input type="text" placeholder="Full Name" required 
                      className="w-full border border-gray-200 p-3 focus:border-[#1A1A1A] outline-none rounded" 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                    <input type="tel" placeholder="Phone Number (Required)" required 
                      className="w-full border border-gray-200 p-3 focus:border-[#1A1A1A] outline-none rounded" 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                    />
                  </>
                )}
                
                <input type="email" placeholder="Email Address" required 
                  className="w-full border border-gray-200 p-3 focus:border-[#1A1A1A] outline-none rounded" 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
                <input type="password" placeholder="Password" required 
                  className="w-full border border-gray-200 p-3 focus:border-[#1A1A1A] outline-none rounded" 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />

                <button type="submit" disabled={loading} 
                  className="w-full bg-[#1A1A1A] text-white py-4 mt-2 text-sm font-bold uppercase tracking-widest hover:bg-[#A31F24] transition-colors rounded flex justify-center items-center disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Register')}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-gray-500 underline hover:text-[#1A1A1A] transition">
                  {isLogin ? 'Need an account? Create one.' : 'Already have an account? Sign in.'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </GoogleOAuthProvider>
  );
}