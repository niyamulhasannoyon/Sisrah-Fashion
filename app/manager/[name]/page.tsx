'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function ManagerLoginPage() {
  const params = useParams() as { name?: string };
  const managerName = params?.name || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login: loginAction } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      // API sets cookie; update client store and redirect to staff area
      loginAction(data.user);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 border border-gray-100 shadow-sm rounded-md">
        <h1 className="text-2xl font-bold text-[#1A1A1A] uppercase tracking-widest text-center mb-4">Manager Login</h1>
        {managerName && (
          <p className="text-sm text-slate-500 text-center mb-4">Signing in for <strong>{managerName.replace(/[-_]/g, ' ')}</strong></p>
        )}

        {error && <div className="bg-rose-50 text-rose-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-200 p-3 rounded focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-200 p-3 rounded focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1A1A] text-white py-3 rounded font-bold hover:bg-[#A31F24] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-slate-400 mt-4 text-center">If you have trouble logging in, contact your administrator.</p>
      </div>
    </div>
  );
}
